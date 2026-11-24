import logging
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, joinedload
from src.rotulado import schemas, exceptions
from src.rotulado.borrador_pdf import DatosBorrador, generar_pdf
from src.rotulado.empaquetado_pdf import DatosEmpaquetado, generar_pdf_empaquetado as generar_pdf_composicion
from src.rotulado.constants import (
    ABREVIATURA_UNIDAD, CAMPO_INFO_NUTRICIONAL, CAMPO_SELLOS, CAMPOS_AUTOMATICOS, CAMPOS_ROTULADO,
    CAMPOS_TEXTO, ELEMENTOS_EMPAQUETADO, LEYENDA_BORRADOR, MARCAS, MENSAJE_APLICA,
    MENSAJE_PENDIENTE, NOMBRE_CAMPO, OBSERVACION_INICIAL, REGLAS_INICIALES, EstadoRotulado,
)
from src.rotulado.ingredientes import armar_lista
from src.rotulado.models import (
    HistorialRotuladoProducto, ReglasRotulado, RotuladoProducto, VersionEmpaquetado,
)
from src.declaracion_alergenos.models import DeclaracionAlergenosReceta
from src.declaracion_alergenos.services import _calcular_desde_insumos
from src.lote_produccion.models import LoteProduccion
from src.personal.models import Persona
from src.receta.models import Receta, InsumoReceta
from src.receta.schemas import EvaluacionSellosCreate
from src.receta.sellos import evaluar_sellos
from src.receta.constants import TipoRenglon
from src.insumos.models import Insumo
from src.informacion_nutricional_insumo.models import InformacionNutricionalInsumo
from src.calculo_nutricional.models import InformacionNutricionalReceta
from src.calculo_nutricional.services import obtener_o_crear_configuracion
from src.producto.services import leer_producto
from src.configuracion_sistema.constants import ID_CONFIGURACION_SISTEMA
from src.configuracion_sistema.models import ConfiguracionSistema

if TYPE_CHECKING:
    from src.producto.models import Producto
    from src.rotulado.ingredientes import ListaIngredientes

logger = logging.getLogger(__name__)


def _registro(db: Session, producto_id: int) -> RotuladoProducto | None:
    return db.scalars(select(RotuladoProducto).where(RotuladoProducto.producto_id == producto_id)).first()

def _lista_ordenada(db: Session, producto_id: int) -> "ListaIngredientes | None":
    receta = _receta_vigente(db, producto_id)
    if receta is None:
        return None
    registro = _registro(db, producto_id)
    formato = obtener_reglas_vigentes(db).formato_declaracion_aditivos
    return armar_lista(receta, formato, registro.orden_ingredientes_manual if registro else None)


def obtener_lista_ingredientes(db: Session, producto_id: int) -> schemas.ListaIngredientesRotulo:
    """Resultado ordenado para el rotulado (E13)."""
    leer_producto(db, producto_id)
    lista = _lista_ordenada(db, producto_id)
    if lista is None:
        raise exceptions.ProductoSinReceta()
    return schemas.ListaIngredientesRotulo.model_validate(lista, from_attributes=True)

def obtener_reglas_vigentes(db: Session) -> schemas.ReglasRotulado:
    reglas = db.scalar(select(ReglasRotulado).where(ReglasRotulado.vigente.is_(True)))
    if reglas is None:
        reglas = ReglasRotulado(version=1, vigente=True, fecha_desde_vigencia=datetime.now(),
                                observacion=OBSERVACION_INICIAL, **REGLAS_INICIALES)
        db.add(reglas)
        db.commit()
        db.refresh(reglas)
    return reglas


def _nombres(lista) -> str:
    return " > ".join(i.texto for i in lista.ingredientes)

def guardar_orden_ingredientes(
    db: Session, producto_id: int, datos: schemas.OrdenIngredientesUpdate, usuario: Persona | None = None,
) -> schemas.BorradorRotuladoCAA:
    producto = leer_producto(db, producto_id)
    receta = _receta_vigente(db, producto_id)
    if receta is None:
        raise exceptions.ProductoSinReceta()

    formato = obtener_reglas_vigentes(db).formato_declaracion_aditivos
    registro = _registro(db, producto_id)
    previa = armar_lista(receta, formato, registro.orden_ingredientes_manual if registro else None)

    ids = {i.insumo_id for i in receta.insumos if i.tipo == TipoRenglon.INGREDIENTE.value}
    if datos.orden:
        if len(set(datos.orden)) != len(datos.orden) or set(datos.orden) != ids:
            raise exceptions.OrdenIngredientesInvalido()
        # El pedido debe coincidir con lo que da el orden decreciente más el desempate pedido.
        if [i.insumo_id for i in armar_lista(receta, formato, datos.orden).ingredientes] != datos.orden:
            raise exceptions.OrdenIngredientesInvalido()

    nueva = armar_lista(receta, formato, datos.orden or None)
    if registro is None:
        registro = RotuladoProducto(producto_id=producto_id)
        db.add(registro)

    ahora = datetime.now()
    usuario_id = usuario.id if usuario else None
    registro.orden_ingredientes_manual = datos.orden if nueva.orden_manual else None

    if _nombres(previa) != _nombres(nueva) or previa.orden_manual != nueva.orden_manual:
        db.add(HistorialRotuladoProducto(
            rotulado=registro, campo="orden_ingredientes",
            valor_anterior=f"{'Manual' if previa.orden_manual else 'Automático'}: {_nombres(previa)}",
            valor_nuevo=f"{'Manual' if nueva.orden_manual else 'Automático'}: {_nombres(nueva)}",
            usuario_id=usuario_id, fecha_hora=ahora,
        ))

    if registro.lista_ingredientes and registro.lista_ingredientes.strip() != nueva.texto:
        db.add(HistorialRotuladoProducto(
            rotulado=registro, campo="lista_ingredientes",
            valor_anterior=registro.lista_ingredientes, valor_nuevo=nueva.texto,
            usuario_id=usuario_id, fecha_hora=ahora,
        ))
        registro.lista_ingredientes = nueva.texto

    registro.actualizado_por_id = usuario_id
    registro.fecha_actualizacion = ahora
    db.commit()
    db.refresh(registro)

    sugeridos = _sugeridos(db, producto)
    return _armar_borrador(db, producto, registro, sugeridos, _datos_del_borrador(registro, sugeridos))

def listar_versiones_reglas(db: Session) -> list[schemas.ReglasRotulado]:
    obtener_reglas_vigentes(db)
    return db.scalars(select(ReglasRotulado).order_by(ReglasRotulado.version.desc())).all()

def leer_version_reglas(db: Session, reglas_id: int) -> schemas.ReglasRotulado:
    reglas = db.get(ReglasRotulado, reglas_id)
    if reglas is None:
        raise exceptions.ReglasNoEncontradas()
    return reglas

def crear_version_reglas(db: Session, datos: schemas.ReglasRotuladoCreate) -> schemas.ReglasRotulado:
    anterior = obtener_reglas_vigentes(db)
    ahora = datetime.now()

    anterior.vigente = False
    anterior.fecha_hasta_vigencia = ahora
    db.flush()

    nueva = ReglasRotulado(version=anterior.version + 1, vigente=True, fecha_desde_vigencia=ahora, **datos.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

def obtener_rotulado_producto(db: Session, producto_id: int) -> schemas.EvaluacionRotulado:
    db_producto = leer_producto(db, producto_id)
    return evaluar_rotulado(db, db_producto, _insumos_de_receta(db, producto_id))

def evaluar_rotulado_receta(db: Session, datos: EvaluacionSellosCreate) -> schemas.EvaluacionRotulado:
    producto = leer_producto(db, datos.producto_id)
    ids = [item.insumo_id for item in datos.insumos]
    insumos = {insumo.id: insumo for insumo in db.scalars(select(Insumo).where(Insumo.id.in_(ids))).all()}
    return evaluar_rotulado(db, producto, [(insumos[item.insumo_id], item.cantidad) for item in datos.insumos])

def actualizar_rotulado_producto(db: Session, producto_id: int, datos: schemas.RotuladoProductoUpdate) -> schemas.EvaluacionRotulado:
    db_producto = leer_producto(db, producto_id)
    for campo, valor in datos.model_dump().items():
        setattr(db_producto, campo, valor)
    db.commit()
    db.refresh(db_producto)
    return evaluar_rotulado(db, db_producto, _insumos_de_receta(db, producto_id))

def evaluar_rotulado(db: Session, producto: "Producto", insumos: list[tuple["Insumo", float]]) -> schemas.EvaluacionRotulado:
    reglas = obtener_reglas_vigentes(db)
    marcas = [_evaluar_marca(marca, producto, insumos, reglas) for marca in MARCAS]
    base = {
        "envasado_ausencia_cliente": producto.envasado_ausencia_cliente,
        "requiere_envasado_ausencia_cliente": reglas.requiere_envasado_ausencia_cliente,
        "marcas": marcas,
        "reglas_version": reglas.version,
    }

    if reglas.requiere_envasado_ausencia_cliente:
        if producto.envasado_ausencia_cliente is None:
            return schemas.EvaluacionRotulado(estado=EstadoRotulado.PENDIENTE, mensaje=MENSAJE_PENDIENTE, **base)
        if not producto.envasado_ausencia_cliente:
            return schemas.EvaluacionRotulado(estado=EstadoRotulado.NO_CORRESPONDE, mensaje=reglas.mensaje_no_corresponde, **base)

    activas = [marca for marca in marcas if marca.valor and marca.considerada]
    if not activas:
        return schemas.EvaluacionRotulado(estado=EstadoRotulado.EXCEPTUADO, mensaje=reglas.mensaje_exceptuado, **base)

    return schemas.EvaluacionRotulado(
        estado=EstadoRotulado.APLICA,
        mensaje=MENSAJE_APLICA.format(marcas=", ".join(marca.nombre.lower() for marca in activas)),
        sellos=evaluar_sellos(producto, insumos),
        **base,
    )


def _evaluar_marca(marca, producto: "Producto", insumos: list[tuple["Insumo", float]], reglas: ReglasRotulado) -> schemas.MarcaEvaluada:
    insumos_con_marca = [insumo.nombre for insumo, _ in insumos if getattr(insumo, marca.campo_insumo)]
    declarado = getattr(producto, marca.campo_producto)
    sugerido = bool(insumos_con_marca)
    return schemas.MarcaEvaluada(
        clave=marca.clave,
        nombre=marca.nombre,
        sugerido=sugerido,
        declarado=declarado,
        valor=sugerido if declarado is None else declarado,
        considerada=getattr(reglas, marca.campo_regla),
        insumos=insumos_con_marca,
    )


def generar_borrador_pdf(db: Session, producto_id: int) -> bytes:
    """Arma el PDF con el borrador del rótulo y el anexo con el detalle de los cálculos."""
    producto = leer_producto(db, producto_id)
    receta = db.scalars(
        select(Receta)
        .options(
            joinedload(Receta.porcion_unidad_medida),
            joinedload(Receta.etapas),
            joinedload(Receta.insumos).joinedload(InsumoReceta.insumo).joinedload(Insumo.unidad_medida),
            joinedload(Receta.insumos).joinedload(InsumoReceta.aditivo),
        )
        .where(Receta.producto_id == producto_id, Receta.vigente.is_(True))
    ).first()
    if receta is None:
        raise exceptions.ProductoSinReceta()

    info_nutricional = db.scalars(
        select(InformacionNutricionalReceta).where(InformacionNutricionalReceta.receta_id == receta.id)
    ).first()
    if info_nutricional is None:
        raise exceptions.InformacionNutricionalNoCalculada()

    evaluacion = evaluar_rotulado(db, producto, [(item.insumo, item.cantidad) for item in receta.insumos])

    return generar_pdf(DatosBorrador(
        producto=producto,
        receta=receta,
        evaluacion=evaluacion,
        info_nutricional=info_nutricional,
        reglas=obtener_reglas_vigentes(db),
        configuracion=obtener_o_crear_configuracion(db),
        fuentes=_fuentes_nutricionales(db, receta),
        caa=db.scalars(
            select(RotuladoProducto).where(RotuladoProducto.producto_id == producto_id)
        ).first(),
    ))


def _fuentes_nutricionales(db: Session, receta: Receta) -> dict[str, InformacionNutricionalInsumo]:
    ids_insumos = [item.insumo_id for item in receta.insumos]
    ids_aditivos = [item.aditivo_id for item in receta.insumos if item.aditivo_id is not None]

    condiciones = []
    if ids_insumos:
        condiciones.append(InformacionNutricionalInsumo.insumo_id.in_(ids_insumos))
    if ids_aditivos:
        condiciones.append(InformacionNutricionalInsumo.aditivo_id.in_(ids_aditivos))
    if not condiciones:
        return {}

    registros = db.scalars(
        select(InformacionNutricionalInsumo)
        .options(joinedload(InformacionNutricionalInsumo.fuente_nutricional))
        .where(or_(*condiciones))
    ).all()

    fuentes: dict[str, InformacionNutricionalInsumo] = {}
    for registro in registros:
        if registro.aditivo_id is not None:
            fuentes[f"aditivo:{registro.aditivo_id}"] = registro
        if registro.insumo_id is not None:
            fuentes[f"insumo:{registro.insumo_id}"] = registro
    return fuentes


def _insumos_de_receta(db: Session, producto_id: int) -> list[tuple["Insumo", float]]:
    receta = db.scalar(select(Receta).where(Receta.producto_id == producto_id))
    if receta is None:
        return []
    return [(item.insumo, item.cantidad) for item in receta.insumos]


# --- Datos del rótulo del Capítulo V del CAA ---


def _abreviatura_unidad(nombre: str) -> str:
    return ABREVIATURA_UNIDAD.get(nombre.strip().lower(), nombre.strip().lower())


def _contenido_neto_sugerido(producto: "Producto") -> str:
    return f"{producto.cantidad_neta:g} {_abreviatura_unidad(producto.unidad_medida.nombre)}"


def _receta_vigente(db: Session, producto_id: int) -> "Receta | None":
    return db.scalars(
        select(Receta)
        .options(
            joinedload(Receta.insumos).joinedload(InsumoReceta.insumo).joinedload(Insumo.unidad_medida),
            joinedload(Receta.insumos).joinedload(InsumoReceta.aditivo),
        )
        .where(Receta.producto_id == producto_id, Receta.vigente.is_(True))
    ).first()


def _ultimo_lote(db: Session, producto_id: int) -> LoteProduccion | None:
    return db.scalars(
        select(LoteProduccion)
        .where(LoteProduccion.producto_id == producto_id)
        .order_by(LoteProduccion.id.desc())
    ).first()


def _sugeridos(db: Session, producto: "Producto") -> dict[str, str]:
    """Valores que el sistema ya conoce y completa solo en el formulario."""
    lista = _lista_ordenada(db, producto.id)
    ultimo_lote = _ultimo_lote(db, producto.id)
    pyme = db.get(ConfiguracionSistema, ID_CONFIGURACION_SISTEMA)
    return {
        "razon_social": (pyme.razon_social_elaborador or "") if pyme else "",
        "domicilio": (pyme.domicilio_elaborador or "") if pyme else "",
        "numero_registro": (pyme.numero_rnpa_rppa or "") if pyme else "",
        "denominacion_venta": producto.nombre,
        "contenido_neto": _contenido_neto_sugerido(producto),
        "lista_ingredientes": lista.texto if lista else "",
        "identificacion_lote": (
            f"{ultimo_lote.id:06d} · {ultimo_lote.fecha_produccion:%d/%m/%Y}" if ultimo_lote else ""
        ),
    }


def _valor_texto(valor) -> str:
    if valor is None:
        return ""
    if hasattr(valor, "strftime"):
        return valor.strftime("%d/%m/%Y")
    return str(valor).strip()


def _datos_del_borrador(
    registro: RotuladoProducto | None, sugeridos: dict[str, str]
) -> schemas.DatosRotuladoCAA:
    if registro is None:
        return schemas.DatosRotuladoCAA(
            **{clave: sugeridos.get(clave, "") for clave in CAMPOS_TEXTO}
        )

    valores = {}
    for clave in CAMPOS_TEXTO:
        valor = getattr(registro, clave)
        if not valor and clave in CAMPOS_AUTOMATICOS:
            # Un dato que el sistema puede completar no se muestra vacío.
            valor = sugeridos.get(clave)
        valores[clave] = valor or ""
    return schemas.DatosRotuladoCAA(
        **valores,
        fecha_duracion=registro.fecha_duracion,
        es_importado=registro.es_importado,
    )


def _tabla_nutricional(db: Session, producto_id: int) -> list[dict] | None:
    receta = _receta_vigente(db, producto_id)
    if receta is None:
        return None
    info = db.scalars(
        select(InformacionNutricionalReceta).where(InformacionNutricionalReceta.receta_id == receta.id)
    ).first()
    return info.tabla_nutricional if info else None


def _historial(registro: RotuladoProducto | None) -> list[schemas.CambioRotulado]:
    if registro is None:
        return []
    return [
        schemas.CambioRotulado(
            campo=cambio.campo,
            nombre_campo=NOMBRE_CAMPO.get(cambio.campo, cambio.campo),
            valor_anterior=cambio.valor_anterior,
            valor_nuevo=cambio.valor_nuevo,
            usuario=(
                f"{cambio.usuario.nombre} {cambio.usuario.apellido}" if cambio.usuario else None
            ),
            fecha_hora=cambio.fecha_hora,
        )
        for cambio in list(registro.historial)[:20]
    ]


def _campos_completitud(
    datos: schemas.DatosRotuladoCAA,
    sugeridos: dict[str, str],
    tabla: list[dict] | None,
    evaluacion: schemas.EvaluacionRotulado,
) -> list[schemas.CampoCompletitud]:
    campos = []
    for campo in CAMPOS_ROTULADO:
        valor = _valor_texto(getattr(datos, campo.clave))
        aplica = not campo.clave.startswith("importador_") or datos.es_importado

        origen = "vacio"
        if valor:
            es_sugerido = campo.clave in CAMPOS_AUTOMATICOS and valor == (sugeridos.get(campo.clave) or "")
            origen = "sistema" if es_sugerido else "manual"

        campos.append(schemas.CampoCompletitud(
            clave=campo.clave,
            nombre=campo.nombre,
            obligatorio=campo.obligatorio and aplica,
            completo=bool(valor) or not aplica,
            automatico=campo.automatico,
            referencia=campo.referencia,
            condicional=campo.condicional,
            valor=valor if aplica else "No aplica: el producto no es importado",
            origen=origen,
        ))

    sellos = evaluacion.sellos.sellos if evaluacion.sellos else []
    campos.append(schemas.CampoCompletitud(
        clave=CAMPO_INFO_NUTRICIONAL.clave,
        nombre=CAMPO_INFO_NUTRICIONAL.nombre,
        obligatorio=True,
        completo=bool(tabla),
        automatico=True,
        referencia=CAMPO_INFO_NUTRICIONAL.referencia,
        valor="Tabla calculada" if tabla else "",
        origen="sistema" if tabla else "vacio",
    ))
    campos.append(schemas.CampoCompletitud(
        clave=CAMPO_SELLOS.clave,
        nombre=CAMPO_SELLOS.nombre,
        obligatorio=False,
        completo=True,
        automatico=True,
        referencia=CAMPO_SELLOS.referencia,
        valor=", ".join(sellos) if sellos else "Sin sellos",
        origen="sistema",
    ))
    return campos


def _armar_borrador(db, producto, registro, sugeridos, datos):
    lista = _lista_ordenada(db, producto.id)
    lista_ordenada = (
        schemas.ListaIngredientesRotulo.model_validate(lista, from_attributes=True)
        if lista else None
    )
    tabla = _tabla_nutricional(db, producto.id)
    evaluacion = evaluar_rotulado(db, producto, _insumos_de_receta(db, producto.id))
    campos = _campos_completitud(datos, sugeridos, tabla, evaluacion)
    

    obligatorios = [campo for campo in campos if campo.obligatorio]
    completos = [campo for campo in obligatorios if campo.completo]

    return schemas.BorradorRotuladoCAA(
        producto_id=producto.id,
        datos=datos,
        sugeridos=sugeridos,
        campos=campos,
        faltantes=[campo.nombre for campo in obligatorios if not campo.completo],
        completitud=round(100 * len(completos) / len(obligatorios)) if obligatorios else 100,
        historial=_historial(registro),
        tabla_nutricional=tabla,
        sellos=evaluacion.sellos.sellos if evaluacion.sellos else [],
        fecha_actualizacion=registro.fecha_actualizacion if registro else None,
        lista_ordenada=lista_ordenada,
    )


def obtener_borrador_caa(db: Session, producto_id: int) -> schemas.BorradorRotuladoCAA:
    producto = leer_producto(db, producto_id)
    sugeridos = _sugeridos(db, producto)
    registro = db.scalars(
        select(RotuladoProducto).where(RotuladoProducto.producto_id == producto_id)
    ).first()
    return _armar_borrador(db, producto, registro, sugeridos, _datos_del_borrador(registro, sugeridos))


def guardar_borrador_caa(
    db: Session,
    producto_id: int,
    datos: schemas.RotuladoCAAUpdate,
    usuario: Persona | None = None,
) -> schemas.BorradorRotuladoCAA:
    """Guarda el borrador aunque falten datos; cada cambio sobre un dato automático queda registrado."""
    producto = leer_producto(db, producto_id)
    sugeridos = _sugeridos(db, producto)
    registro = _registro(db, producto_id)
    if registro is None:
        registro = RotuladoProducto(producto_id=producto_id)
        db.add(registro)

    ahora = datetime.now()
    usuario_id = usuario.id if usuario else None

    def registrar(campo: str, anterior: str, nuevo: str) -> None:
        if anterior == nuevo:
            return
        db.add(HistorialRotuladoProducto(
            rotulado=registro,
            campo=campo,
            valor_anterior=anterior or None,
            valor_nuevo=nuevo or None,
            usuario_id=usuario_id,
            fecha_hora=ahora,
        ))

    for clave in CAMPOS_TEXTO:
        nuevo = (getattr(datos, clave) or "").strip()
        anterior = (getattr(registro, clave) or "").strip()
        if not anterior and clave in CAMPOS_AUTOMATICOS:
            anterior = (sugeridos.get(clave) or "").strip()
        setattr(registro, clave, nuevo or None)
        registrar(clave, anterior, nuevo)

    registrar("fecha_duracion", _valor_texto(registro.fecha_duracion), _valor_texto(datos.fecha_duracion))
    registro.fecha_duracion = datos.fecha_duracion

    registrar(
        "es_importado",
        "Sí" if registro.es_importado else "No",
        "Sí" if datos.es_importado else "No",
    )
    registro.es_importado = datos.es_importado

    registro.actualizado_por_id = usuario_id
    registro.fecha_actualizacion = ahora
    db.commit()
    db.refresh(registro)

    return _armar_borrador(db, producto, registro, sugeridos, _datos_del_borrador(registro, sugeridos))

# --- Empaquetado: foto del envase y ubicación de los elementos del rótulo ---


def _elementos_de_version(
    version: VersionEmpaquetado | None, es_importado: bool
) -> list[schemas.ElementoEmpaquetado]:
    """Disposición guardada; si falta un bloque se usa la posición inicial."""
    guardados = {elemento.get("clave"): elemento for elemento in (version.elementos if version else [])}
    elementos = []
    for definicion in ELEMENTOS_EMPAQUETADO:
        visible_por_defecto = definicion.visible and (
            definicion.clave != "importador" or es_importado
        )
        datos = guardados.get(definicion.clave)
        if datos:
            elemento = schemas.ElementoEmpaquetado(**datos)
            if elemento.clave == "importador" and not es_importado:
                elemento.visible = False
            elementos.append(elemento)
            continue
        elementos.append(schemas.ElementoEmpaquetado(
            clave=definicion.clave, x=definicion.x, y=definicion.y,
            ancho=definicion.ancho, alto=definicion.alto, visible=visible_por_defecto,
        ))
    return elementos


def _mensaje_sellos(evaluacion: schemas.EvaluacionRotulado) -> str:
    if evaluacion.estado == EstadoRotulado.PENDIENTE.value:
        return "no determinados (falta informar la comercialización del producto)"
    if evaluacion.estado != EstadoRotulado.APLICA.value or evaluacion.sellos is None:
        return f"no corresponde. {evaluacion.mensaje}"
    if not evaluacion.sellos.evaluable:
        return "no evaluables por falta de información nutricional de los insumos"
    if not evaluacion.sellos.sellos:
        return "el cálculo no arroja sellos para el producto"
    return ""


def _version_empaquetado_esquema(
    version: VersionEmpaquetado | None, es_importado: bool
) -> schemas.VersionEmpaquetado | None:
    if version is None:
        return None
    return schemas.VersionEmpaquetado(
        id=version.id,
        version=version.version,
        vigente=version.vigente,
        tiene_foto=bool(version.foto),
        observacion=version.observacion,
        creado_por=(
            f"{version.creado_por.nombre} {version.creado_por.apellido}"
            if version.creado_por else None
        ),
        fecha_desde_vigencia=version.fecha_desde_vigencia,
        fecha_hasta_vigencia=version.fecha_hasta_vigencia,
        foto=version.foto,
        elementos=_elementos_de_version(version, es_importado),
    )


def _resumen_version(version: VersionEmpaquetado) -> schemas.VersionEmpaquetadoResumen:
    return schemas.VersionEmpaquetadoResumen(
        id=version.id,
        version=version.version,
        vigente=version.vigente,
        tiene_foto=bool(version.foto),
        observacion=version.observacion,
        creado_por=(
            f"{version.creado_por.nombre} {version.creado_por.apellido}"
            if version.creado_por else None
        ),
        fecha_desde_vigencia=version.fecha_desde_vigencia,
        fecha_hasta_vigencia=version.fecha_hasta_vigencia,
    )


def _unidad_empaquetado(producto: "Producto", evaluacion: schemas.EvaluacionRotulado) -> str:
    if evaluacion.sellos is not None:
        return "ml" if evaluacion.sellos.es_liquido else "g"
    return ABREVIATURA_UNIDAD.get(
        producto.unidad_medida.nombre.strip().lower(), producto.unidad_medida.nombre
    )


def _declaracion_alergenos(
    db: Session, receta: "Receta | None"
) -> DeclaracionAlergenosReceta | None:
    if receta is None:
        return None
    return db.scalars(
        select(DeclaracionAlergenosReceta).where(DeclaracionAlergenosReceta.receta_id == receta.id)
    ).first()


def _leyendas_alergenos(
    declaracion: DeclaracionAlergenosReceta | None, receta: "Receta | None"
) -> list[str]:
    """Leyendas de alérgenos, gluten y contaminación cruzada que van al rótulo."""
    if declaracion is None:
        if receta is None:
            return []
        # Sin declaración guardada se usa la propuesta que el sistema calcula desde los insumos.
        _, texto_alergenos, contiene_gluten, texto_gluten = _calcular_desde_insumos(receta)
        contaminacion = None
    else:
        texto_alergenos = declaracion.texto_alergenos
        contiene_gluten = declaracion.contiene_gluten
        texto_gluten = declaracion.texto_gluten
        contaminacion = declaracion.texto_contaminacion_cruzada

    leyendas = [texto_alergenos] if texto_alergenos else []
    # "LIBRE DE GLUTEN / SIN TACC (sugerido…)" es un texto interno: al rótulo solo va la leyenda positiva.
    if contiene_gluten and texto_gluten:
        leyendas.append(texto_gluten)
    if contaminacion:
        leyendas.append(contaminacion)
    return leyendas


def _leyendas_obligatorias(evaluacion: schemas.EvaluacionRotulado) -> list[str]:
    """Leyendas de edulcorantes y cafeína (Ley 27.642) según lo declarado o sugerido."""
    valores = {marca.clave: marca.valor for marca in evaluacion.marcas}
    leyendas = []
    if valores.get("edulcorantes"):
        leyendas.append("CONTIENE EDULCORANTES. NO RECOMENDABLE EN NIÑOS/AS.")
    if valores.get("cafeina"):
        leyendas.append("CONTIENE CAFEÍNA. EVITAR EN NIÑOS/AS.")
    return leyendas


FACTOR_UNIDAD_BASE = {
    "gramo": 1.0, "g": 1.0, "kilogramo": 1000.0, "kg": 1000.0,
    "mililitro": 1.0, "ml": 1.0, "litro": 1000.0, "l": 1000.0,
}

FAMILIA_UNIDAD = {
    "gramo": "masa", "g": "masa", "kilogramo": "masa", "kg": "masa",
    "mililitro": "volumen", "ml": "volumen", "litro": "volumen", "l": "volumen",
}


def _porcion_declarada(
    receta: "Receta | None", info, unidad: str
) -> float | None:
    """Porción en la unidad de la tabla nutricional: la calculada o la declarada en la receta."""
    if info is not None and info.porcion and float(info.porcion) > 0:
        return float(info.porcion)
    if receta is None or not receta.porcion or float(receta.porcion) <= 0:
        return None

    nombre = (
        receta.porcion_unidad_medida.nombre.strip().lower()
        if receta.porcion_unidad_medida else ""
    )
    factor = FACTOR_UNIDAD_BASE.get(nombre)
    if factor is None or FAMILIA_UNIDAD.get(nombre) != FAMILIA_UNIDAD.get(unidad):
        return None
    return float(receta.porcion) * factor


def _porciones_por_envase(
    producto: "Producto", porcion: float | None, unidad: str
) -> str | None:
    """Cantidad de porciones que rinde el envase, comparando unidades compatibles."""
    if not porcion or float(porcion) <= 0:
        return None
    nombre = producto.unidad_medida.nombre.strip().lower()
    factor = FACTOR_UNIDAD_BASE.get(nombre)
    if factor is None or FAMILIA_UNIDAD.get(nombre) != FAMILIA_UNIDAD.get(unidad):
        return None

    porciones = producto.cantidad_neta * factor / float(porcion)
    if porciones <= 0:
        return None
    return f"{round(porciones, 1):g} × {float(porcion):g} {unidad}"


def _info_nutricional_vigente(db: Session, producto_id: int):
    receta = _receta_vigente(db, producto_id)
    if receta is None:
        return None
    return db.scalars(
        select(InformacionNutricionalReceta).where(InformacionNutricionalReceta.receta_id == receta.id)
    ).first()


def obtener_empaquetado(db: Session, producto_id: int) -> schemas.EmpaquetadoProducto:
    producto = leer_producto(db, producto_id)
    registro = db.scalars(
        select(RotuladoProducto).where(RotuladoProducto.producto_id == producto_id)
    ).first()
    sugeridos = _sugeridos(db, producto)
    datos = _datos_del_borrador(registro, sugeridos)
    tabla = _tabla_nutricional(db, producto_id)
    evaluacion = evaluar_rotulado(db, producto, _insumos_de_receta(db, producto_id))

    versiones = db.scalars(
        select(VersionEmpaquetado)
        .where(VersionEmpaquetado.producto_id == producto_id)
        .order_by(VersionEmpaquetado.version.desc())
    ).all()
    vigente = next((version for version in versiones if version.vigente), None)
    campos = _campos_completitud(datos, sugeridos, tabla, evaluacion)

    receta = _receta_vigente(db, producto_id)
    declaracion = _declaracion_alergenos(db, receta)
    info = _info_nutricional_vigente(db, producto_id)
    lote = _ultimo_lote(db, producto_id)
    unidad = _unidad_empaquetado(producto, evaluacion)

    return schemas.EmpaquetadoProducto(
        producto_id=producto_id,
        vigente=_version_empaquetado_esquema(vigente, datos.es_importado),
        versiones=[_resumen_version(version) for version in versiones],
        foto=vigente.foto if vigente else None,
        elementos=_elementos_de_version(vigente, datos.es_importado),
        datos=datos,
        tabla_nutricional=tabla,
        tabla_incompleta=(
            not tabla or any(
                not fila.get("texto_porcion") or not fila.get("texto_100g") for fila in tabla
            )
        ),
        sellos=evaluacion.sellos.sellos if evaluacion.sellos else [],
        mensaje_sellos=_mensaje_sellos(evaluacion),
        descripcion=producto.descripcion,
        codigo_barras=producto.codigo_barras,
        alergenos=_leyendas_alergenos(declaracion, receta),
        conservacion=declaracion.condiciones_conservacion if declaracion else None,
        porciones_por_envase=_porciones_por_envase(
            producto, _porcion_declarada(receta, info, unidad), unidad
        ),
        leyendas_obligatorias=_leyendas_obligatorias(evaluacion),
        fecha_elaboracion=lote.fecha_produccion if lote else None,
        fecha_vencimiento=lote.fecha_vencimiento if lote else None,
        leyenda=LEYENDA_BORRADOR,
        faltantes=[campo.nombre for campo in campos if campo.obligatorio and not campo.completo],
    )


def guardar_version_empaquetado(
    db: Session,
    producto_id: int,
    datos: schemas.EmpaquetadoGuardar,
    usuario: Persona | None = None,
) -> schemas.EmpaquetadoProducto:
    """Guarda una nueva versión vigente y deja la anterior en el historial."""
    producto = leer_producto(db, producto_id)
    ahora = datetime.now()

    versiones = db.scalars(
        select(VersionEmpaquetado).where(VersionEmpaquetado.producto_id == producto_id)
    ).all()
    vigente = next((version for version in versiones if version.vigente), None)
    if vigente is not None:
        vigente.vigente = False
        vigente.fecha_hasta_vigencia = ahora
        db.flush()

    numero = max((version.version for version in versiones), default=0) + 1
    registro = db.scalars(
        select(RotuladoProducto).where(RotuladoProducto.producto_id == producto_id)
    ).first()
    es_importado = _datos_del_borrador(registro, _sugeridos(db, producto)).es_importado

    recibidos = {elemento.clave: elemento for elemento in datos.elementos}
    elementos = []
    for definicion in ELEMENTOS_EMPAQUETADO:
        elemento = recibidos.get(definicion.clave)
        if elemento is None:
            continue
        if elemento.clave == "importador" and not es_importado:
            elemento.visible = False
        elementos.append(elemento.model_dump())

    nueva = VersionEmpaquetado(
        producto_id=producto_id,
        version=numero,
        vigente=True,
        foto=datos.foto,
        elementos=elementos,
        observacion=datos.observacion.strip() or None,
        creado_por_id=usuario.id if usuario else None,
        fecha_desde_vigencia=ahora,
    )
    db.add(nueva)
    db.commit()
    return obtener_empaquetado(db, producto_id)


def obtener_version_empaquetado(db: Session, version_id: int) -> schemas.VersionEmpaquetado:
    version = db.get(VersionEmpaquetado, version_id)
    if version is None:
        raise exceptions.VersionEmpaquetadoNoEncontrada()
    producto = leer_producto(db, version.producto_id)
    registro = db.scalars(
        select(RotuladoProducto).where(RotuladoProducto.producto_id == producto.id)
    ).first()
    es_importado = _datos_del_borrador(registro, _sugeridos(db, producto)).es_importado
    return _version_empaquetado_esquema(version, es_importado)


def generar_pdf_empaquetado(db: Session, producto_id: int) -> bytes:
    producto = leer_producto(db, producto_id)
    empaquetado = obtener_empaquetado(db, producto_id)
    evaluacion = evaluar_rotulado(db, producto, _insumos_de_receta(db, producto_id))
    info = _info_nutricional_vigente(db, producto_id)

    return generar_pdf_composicion(DatosEmpaquetado(
        producto_nombre=producto.nombre,
        datos=empaquetado.datos,
        elementos=empaquetado.elementos,
        foto=empaquetado.foto,
        tabla_nutricional=empaquetado.tabla_nutricional,
        sellos=empaquetado.sellos,
        mensaje_sellos=empaquetado.mensaje_sellos,
        descripcion=empaquetado.descripcion,
        codigo_barras=empaquetado.codigo_barras,
        alergenos=empaquetado.alergenos,
        conservacion=empaquetado.conservacion,
        porciones_por_envase=empaquetado.porciones_por_envase,
        leyendas_obligatorias=empaquetado.leyendas_obligatorias,
        fecha_elaboracion=empaquetado.fecha_elaboracion,
        fecha_vencimiento=empaquetado.fecha_vencimiento,
        unidad=_unidad_empaquetado(producto, evaluacion),
        porcion=info.porcion if info else None,
        leyenda=empaquetado.leyenda,
        faltantes=empaquetado.faltantes,
    ))
