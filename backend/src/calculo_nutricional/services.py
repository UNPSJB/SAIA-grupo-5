import logging
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy import select, update
from sqlalchemy.orm import Session, joinedload
from src.calculo_nutricional.models import ConfiguracionCalculoNutricional, ParametroNutriente, InformacionNutricionalReceta
from src.calculo_nutricional import exceptions, schemas
from src.informacion_nutricional_insumo.models import InformacionNutricionalInsumo
from src.informacion_nutricional_insumo.constants import DATOS_NUTRICIONALES
from src.receta.models import Receta, InsumoReceta
from src.receta import constants as receta_constants
from src.receta.sellos import gramos_de_insumo
from src.calculo_nutricional.constants import ( ID_CONFIGURACION_CALCULO, PARAMETROS_NUTRIENTES_DEFAULT)

logger = logging.getLogger(__name__)

def _convertir_gramos(cantidad: Decimal | float, unidad_medida) -> Decimal:
    cant = Decimal(str(cantidad))
    if unidad_medida is None:
        return cant

    simbolo = unidad_medida.nombre.strip().lower()
    factor = receta_constants.FACTORES_UNIDAD_MEDIDA.get(simbolo)
    if factor is None:
        raise exceptions.UnidadNoConvertible()

    return cant * Decimal(str(factor))

def _redondear_caa(valor: Decimal, parametro: schemas.ParametroNutriente, config: ConfiguracionCalculoNutricional) -> tuple[float, str]:
    if valor <= parametro.umbral_no_significativo:
        return 0.0, config.texto_no_significativo

    if valor < Decimal("1"):
        decimales = config.decimales_menor_a_1
    elif valor < Decimal("10"):
        decimales = config.decimales_entre_1_y_10
    else:
        decimales = config.decimales_mayor_igual_10

    formato = "1" if decimales == 0 else "0." + ("0" * decimales)
    redondeado = valor.quantize(Decimal(formato), rounding=ROUND_HALF_UP)

    if decimales == 0:
        texto = str(int(redondeado))
    else:
        texto = f"{redondeado:.{decimales}f}".replace(".", ",")

    return float(redondeado), texto

def _construir_tabla_nutricional(totales: dict[str, Decimal], rendimiento_base: Decimal, porcion_base: Decimal, config: ConfiguracionCalculoNutricional, parametros: list[ParametroNutriente]) -> list[dict]:
    tabla: list[dict] = []

    for param in parametros:
        total_nutriente = totales.get(param.codigo_nutriente, Decimal("0"))

        val_100_exacto = (total_nutriente * Decimal("100")) / rendimiento_base
        val_porcion_exacto = (total_nutriente * porcion_base) / rendimiento_base

        val_100_red, texto_100 = _redondear_caa(val_100_exacto, param, config)
        val_porcion_red, texto_porcion = _redondear_caa(val_porcion_exacto, param, config)

        porcentaje_vd: int | None = None
        if param.declara_porcentaje_vd and param.valor_diario_referencia:
            vd = (Decimal(str(val_porcion_red)) / param.valor_diario_referencia) * Decimal("100")
            porcentaje_vd = int(vd.quantize(Decimal("1"), rounding=ROUND_HALF_UP))

        kj_100g: int | None = None
        kj_porcion: int | None = None
        if param.codigo_nutriente == "valor_energetico":
            kj_100 = Decimal(str(val_100_red)) * config.factor_conversion_kj
            kj_por = Decimal(str(val_porcion_red)) * config.factor_conversion_kj
            kj_100g = int(kj_100.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
            kj_porcion = int(kj_por.quantize(Decimal("1"), rounding=ROUND_HALF_UP))

        fila = schemas.FilaNutrienteCalculado(
            codigo=param.codigo_nutriente,
            nombre=param.nombre,
            unidad=param.unidad,
            valor_100g_exacto=round(float(val_100_exacto), 4),
            valor_100g_redondeado=val_100_red,
            texto_100g=texto_100,
            valor_porcion_exacto=round(float(val_porcion_exacto), 4),
            valor_porcion_redondeado=val_porcion_red,
            texto_porcion=texto_porcion,
            porcentaje_vd=porcentaje_vd,
            kj_100g=kj_100g,
            kj_porcion=kj_porcion,
        )
        tabla.append(fila.model_dump())

    return tabla

def calcular_informacion_receta(db: Session, receta_id: int, datos: schemas.CalculoRecetaCreate) -> InformacionNutricionalReceta:
    receta = db.scalars(select(Receta)
        .options(
            joinedload(Receta.porcion_unidad_medida),
            joinedload(Receta.insumos).joinedload(InsumoReceta.insumo),
            joinedload(Receta.insumos).joinedload(InsumoReceta.aditivo),
        ).where(Receta.id == receta_id)).first()

    if not receta:
        raise exceptions.RecetaNoEncontrada()

    if receta.porcion is None:
        raise exceptions.PorcionInvalida()

    rendimiento_base = datos.rendimiento
    porcion_base = _convertir_gramos(receta.porcion, receta.porcion_unidad_medida)

    if rendimiento_base <= 0:
        raise exceptions.RendimientoInvalido()
    if porcion_base <= 0:
        raise exceptions.PorcionInvalida()

    config = obtener_o_crear_configuracion(db)
    parametros = obtener_o_crear_parametros(db)

    totales = {campo: Decimal("0") for campo in DATOS_NUTRICIONALES}

    for item in receta.insumos:
        if item.tipo == receta_constants.TipoRenglon.ADITIVO.value and item.aditivo_id is not None:
            info = db.scalars(
                select(InformacionNutricionalInsumo).where(
                    InformacionNutricionalInsumo.aditivo_id == item.aditivo_id
                )
            ).first()
            if info is None and item.insumo_id is not None:
                    info = db.scalars(
                        select(InformacionNutricionalInsumo).where(
                            InformacionNutricionalInsumo.insumo_id == item.insumo_id
                        )
                    ).first()
            if info is None:
                continue
        else:
            info = db.scalars(
                select(InformacionNutricionalInsumo).where(
                    InformacionNutricionalInsumo.insumo_id == item.insumo_id
                )
            ).first()
            if info is None:
                raise exceptions.InsumoSinInfoNutricional()

        # Misma conversión a gramos que sellos y composición (incluye peso_unidad para unidades de conteo)
        gramos = gramos_de_insumo(item.insumo, item.cantidad)
        if gramos is None:
            raise exceptions.UnidadNoConvertible()
        cantidad_base = Decimal(str(gramos))

        for campo in DATOS_NUTRICIONALES:
            valor_100 = getattr(info, campo) or Decimal("0")
            totales[campo] += (valor_100 * cantidad_base) / Decimal("100")

    tabla = _construir_tabla_nutricional(totales, rendimiento_base, porcion_base, config, parametros)

    db_info = db.scalars(select(InformacionNutricionalReceta).where(InformacionNutricionalReceta.receta_id == receta_id)).first()

    if db_info:
        db_info.rendimiento = rendimiento_base
        db_info.porcion = porcion_base
        db_info.tabla_nutricional = tabla
        db_info.fecha_calculo = datetime.now()
    else:
        db_info = InformacionNutricionalReceta(
            receta_id=receta_id,
            rendimiento=rendimiento_base,
            porcion=porcion_base,
            tabla_nutricional=tabla,
            fecha_calculo=datetime.now(),
        )
        db.add(db_info)

    db.commit()
    db.refresh(db_info)
    return db_info

def leer_informacion_receta(db: Session, receta_id: int) -> InformacionNutricionalReceta:
    db_info = db.scalars( select(InformacionNutricionalReceta).where(InformacionNutricionalReceta.receta_id == receta_id)).first()
    if not db_info:
        raise exceptions.InfoNutricionalRecetaNoEncontrada()
    return db_info


def obtener_o_crear_configuracion(db: Session) -> ConfiguracionCalculoNutricional:
    db_configuracion = db.get(ConfiguracionCalculoNutricional, ID_CONFIGURACION_CALCULO)
    if db_configuracion is None:
        db_configuracion = ConfiguracionCalculoNutricional(id=ID_CONFIGURACION_CALCULO)
        db.add(db_configuracion)
        db.commit()
        db.refresh(db_configuracion)
    return db_configuracion

def obtener_o_crear_parametros(db: Session) -> list[ParametroNutriente]:
    parametros = list(
        db.scalars(
            select(ParametroNutriente).order_by(ParametroNutriente.orden_tabla.asc())
        ).all()
    )
    existentes = {p.codigo_nutriente for p in parametros}
    faltantes = [
        ParametroNutriente(
            codigo_nutriente=cod,
            nombre=nombre,
            unidad=unidad,
            valor_diario_referencia=vdr,
            declara_porcentaje_vd=declara_vd,
            umbral_no_significativo=umbral,
            orden_tabla=orden,
        )
        for cod, nombre, unidad, vdr, declara_vd, umbral, orden in PARAMETROS_NUTRIENTES_DEFAULT
        if cod not in existentes
    ]

    if faltantes:
        db.add_all(faltantes)
        db.commit()
        parametros = list(
            db.scalars(
                select(ParametroNutriente).order_by(ParametroNutriente.orden_tabla.asc())
            ).all()
        )

    return parametros

def obtener_configuracion(db: Session) -> ConfiguracionCalculoNutricional:
    return obtener_o_crear_configuracion(db)

def actualizar_configuracion(
    db: Session, datos: schemas.ConfiguracionCalculoUpdate
) -> ConfiguracionCalculoNutricional:
    db_configuracion = obtener_o_crear_configuracion(db)
    for clave, valor in datos.model_dump(exclude_unset=True).items():
        if valor is not None:
            setattr(db_configuracion, clave, valor)
    db.commit()
    db.refresh(db_configuracion)
    return db_configuracion


def listar_parametros(db: Session) -> list[ParametroNutriente]:
    return obtener_o_crear_parametros(db)

def actualizar_parametro(db: Session, parametro_id: int, datos: schemas.ParametroNutrienteUpdate) -> ParametroNutriente:
    parametro = db.scalars(select(ParametroNutriente).where(ParametroNutriente.id == parametro_id)).first()
    
    if not parametro:
        raise exceptions.ParametrosNoEncontrados()
    
    for key, value in datos.model_dump().items():
        setattr(parametro, key, value)
    db.commit()
    db.refresh(parametro)
    return parametro
