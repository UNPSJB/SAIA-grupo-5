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
from src.rotulado.ingredientes import texto_ingredientes
from src.rotulado.models import (
    HistorialRotuladoProducto, ReglasRotulado, RotuladoProducto, VersionEmpaquetado,
)
from src.lote_produccion.models import LoteProduccion
from src.personal.models import Persona
from src.receta.models import Receta, InsumoReceta
from src.receta.schemas import EvaluacionSellosCreate
from src.receta.sellos import evaluar_sellos
from src.insumos.models import Insumo
from src.informacion_nutricional_insumo.models import InformacionNutricionalInsumo
from src.calculo_nutricional.models import InformacionNutricionalReceta
from src.calculo_nutricional.services import obtener_o_crear_configuracion
from src.producto.services import leer_producto

if TYPE_CHECKING:
    from src.producto.models import Producto

logger = logging.getLogger(__name__)


def obtener_reglas_vigentes(db: Session) -> schemas.ReglasRotulado:
    reglas = db.scalar(select(ReglasRotulado).where(ReglasRotulado.vigente.is_(True)))
    if reglas is None:
        reglas = ReglasRotulado(version=1, vigente=True, fecha_desde_vigencia=datetime.now(),
                                observacion=OBSERVACION_INICIAL, **REGLAS_INICIALES)
        db.add(reglas)
        db.commit()
        db.refresh(reglas)
    return reglas

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


def _sugeridos(db: Session, producto: "Producto") -> dict[str, str]:
    """Valores que el sistema ya conoce y completa solo en el formulario."""
    receta = _receta_vigente(db, producto.id)
    ultimo_lote = db.scalars(
        select(LoteProduccion)
        .where(LoteProduccion.producto_id == producto.id)
        .order_by(LoteProduccion.id.desc())
    ).first()
    return {
        "denominacion_venta": producto.nombre,
        "contenido_neto": _contenido_neto_sugerido(producto),
        "lista_ingredientes": texto_ingredientes(receta) if receta else "",
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


def _armar_borrador(
    db: Session,
    producto: "Producto",
    registro: RotuladoProducto | None,
    sugeridos: dict[str, str],
    datos: schemas.DatosRotuladoCAA,
) -> schemas.BorradorRotuladoCAA:
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
    registro = db.scalars(
        select(RotuladoProducto).where(RotuladoProducto.producto_id == producto_id)
    ).first()
    es_nuevo = registro is None
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
        if es_nuevo:
            anterior = (sugeridos.get(clave) or "").strip()
        else:
            anterior = (getattr(registro, clave) or "").strip()
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
        unidad=_unidad_empaquetado(producto, evaluacion),
        porcion=info.porcion if info else None,
        leyenda=empaquetado.leyenda,
        faltantes=empaquetado.faltantes,
    ))
