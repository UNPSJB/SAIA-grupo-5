import secrets
from datetime import date, datetime, time, timedelta

from sqlalchemy import select

import src.all_models
from src.database import SessionLocal, engine
from src.configuracion_sistema.models import ConfiguracionSistema
from src.configuracion_sistema.publica import leer_vista_publica
from src.documentos.models import Documento
from src.elementosLimpieza.models import ElementoLimpieza, TipoElementoLimpieza
from src.equipos.models import Equipo
from src.lote_produccion.migrations import migrar_esquema_lote_produccion
from src.personal.models import Persona
from src.plan_limpieza.models import PlanLimpieza
from src.planesCalibracion.models import PlanCalibracion
from src.producto.models import Producto
from src.recambiosElementosLimpieza.models import RecambioElementoLimpieza
from src.registrosCalibracion.models import RegistroCalibracion
from src.sector.models import Sector
from src.tarea.models import Tarea
from src.tareas_ocurrencia.constants import EstadoTareaOcurrencia
from src.tareas_ocurrencia.models import TareaOcurrencia
from src.tipo_documento.models import TipoDocumento
from src.unidad_medida.models import UnidadMedida
from src.version_documento.models import VersionDocumento
from scripts.seed_lote_produccion import generar_lotes_produccion


PRODUCTOS_SEMILLA = [
    ("Yogur natural", "Yogur elaborado con leche entera", 1000),
    ("Queso cremoso", "Queso cremoso fresco", 500),
    ("Dulce de leche", "Dulce de leche tradicional", 400),
]


def seed_configuracion(db: SessionLocal) -> ConfiguracionSistema:
    cfg = db.scalar(select(ConfiguracionSistema))
    if not cfg:
        cfg = ConfiguracionSistema(
            vista_publica_activa=True,
            vista_publica_token=secrets.token_urlsafe(32),
            nombre_pyme="Establecimiento Modelo",
        )
        db.add(cfg)
        db.flush()

    cfg.vista_publica_activa = True
    if not cfg.vista_publica_token:
        cfg.vista_publica_token = secrets.token_urlsafe(32)

    cfg.vista_publica_mostrar_cumplimiento = True
    cfg.vista_publica_mostrar_tareas_realizadas = True
    cfg.vista_publica_mostrar_dias_limpieza = True
    cfg.vista_publica_mostrar_calibraciones = True
    cfg.vista_publica_mostrar_tiempo_calibracion = True
    cfg.vista_publica_mostrar_recambios = True
    cfg.vista_publica_mostrar_tiempo_recambio = True
    cfg.vista_publica_mostrar_planes_limpieza = True
    cfg.vista_publica_mostrar_documentos_tecnicos = True
    cfg.vista_publica_mostrar_productos_elaborados = True
    cfg.vista_publica_mostrar_lotes_producidos = True

    db.commit()
    db.refresh(cfg)
    return cfg


def seed_checklists(db: SessionLocal):
    hoy = date.today()
    inicio_mes = hoy.replace(day=1)

    existentes = db.scalars(
        select(TareaOcurrencia).where(
            TareaOcurrencia.fecha >= inicio_mes,
            TareaOcurrencia.fecha <= hoy,
            TareaOcurrencia.estado == EstadoTareaOcurrencia.COMPLETADA,
        )
    ).all()

    if len(existentes) >= 2:
        return

    operario = db.scalar(select(Persona).where(Persona.activo == True))

    tareas_base = [
        ("Sanitización de mesadas de acero inoxidable", "Limpieza diaria de mesadas", "1", "alta", "Plan Limpieza General"),
        ("Desinfección de pisos de producción", "Lavado con solución clorada", "1", "alta", "Plan Limpieza General"),
        ("Limpieza profunda de cámaras frigoríficas", "Higiene y sanitización de paredes y estantes", "7", "media", "Plan Limpieza Semanal"),
        ("Desinfección de utensilios y bandejas", "Inmersión en desinfectante", "1", "alta", "Plan Limpieza Diario"),
    ]

    fechas_a_poblar = [hoy]
    if hoy > inicio_mes:
        fechas_a_poblar.append(inicio_mes)

    for fecha in fechas_a_poblar:
        for nombre, desc, freq, prior, plan_nom in tareas_base:
            ocurrencia = TareaOcurrencia(
                operario_id=operario.id if operario else None,
                tarea_nombre_snap=nombre,
                tarea_descripcion_snap=desc,
                frecuencia_snap=freq,
                prioridad_snap=prior,
                foto_obligatoria_snap=False,
                plan_nombre_snap=plan_nom,
                fecha=fecha,
                fecha_completado=datetime.combine(fecha, time(10, 30)),
                estado=EstadoTareaOcurrencia.COMPLETADA,
            )
            db.add(ocurrencia)

    db.commit()


def seed_calibraciones(db: SessionLocal):
    hoy = date.today()
    equipos = db.scalars(select(Equipo).where(Equipo.estado == True)).all()

    if not equipos:
        sector = db.scalar(select(Sector))
        if not sector:
            sector = Sector(nombre="Producción")
            db.add(sector)
            db.flush()
        eq1 = Equipo(nombre="Balanza de precisión", categoria="Pesaje", ubicacion="Balanza 1", sector_id=sector.id, estado=True)
        eq2 = Equipo(nombre="Termómetro digital", categoria="Control", ubicacion="Cámara 1", sector_id=sector.id, estado=True)
        db.add_all([eq1, eq2])
        db.flush()
        equipos = [eq1, eq2]

    for equipo in equipos[:3]:
        plan = db.scalar(select(PlanCalibracion).where(PlanCalibracion.equipo_id == equipo.id))
        if not plan:
            plan = PlanCalibracion(
                equipo_id=equipo.id,
                fecha_inicio=hoy - timedelta(days=60),
                periodicidad=30,
                estado=True,
            )
            db.add(plan)
            db.flush()

        regs = db.scalars(select(RegistroCalibracion).where(RegistroCalibracion.plan_calibracion_id == plan.id)).all()
        if not regs:
            reg1 = RegistroCalibracion(
                plan_calibracion_id=plan.id,
                fecha=plan.fecha_inicio + timedelta(days=34),
                observacion="Calibración programada realizada con ajuste",
            )
            reg2 = RegistroCalibracion(
                plan_calibracion_id=plan.id,
                fecha=hoy - timedelta(days=2),
                observacion="Calibración vigente dentro de norma",
            )
            db.add_all([reg1, reg2])

    db.commit()


def seed_recambios(db: SessionLocal):
    hoy = date.today()
    elementos = db.scalars(
        select(ElementoLimpieza).where(
            ElementoLimpieza.estado == True,
            ElementoLimpieza.frecuencia_recambio.is_not(None),
        )
    ).all()

    if not elementos:
        tipo = db.scalar(select(TipoElementoLimpieza))
        if not tipo:
            tipo = TipoElementoLimpieza(nombre="Cepillos", prefijo="CEP")
            db.add(tipo)
            db.flush()
        elem = ElementoLimpieza(
            codigo="CEP-001",
            nombre="Cepillo cerdas duras",
            tipo_id=tipo.id,
            ubicacion="Elaboración",
            frecuencia_recambio=30,
            fecha_alta=hoy - timedelta(days=45),
            estado=True,
        )
        db.add(elem)
        db.flush()
        elementos = [elem]

    for elemento in elementos[:3]:
        regs = db.scalars(
            select(RecambioElementoLimpieza).where(RecambioElementoLimpieza.elemento_id == elemento.id)
        ).all()
        if not regs:
            fecha_prog = elemento.fecha_alta + timedelta(days=elemento.frecuencia_recambio)
            recambio = RecambioElementoLimpieza(
                elemento_id=elemento.id,
                fecha=fecha_prog + timedelta(days=3),
                observacion="Desgaste natural de uso",
            )
            db.add(recambio)

    db.commit()


def seed_documentos(db: SessionLocal):
    hoy = date.today()
    tipo = db.scalar(select(TipoDocumento))
    if not tipo:
        tipo = TipoDocumento(nombre="Manual POES", descripcion="Procedimientos Operativos Estandarizados")
        db.add(tipo)
        db.flush()

    docs = db.scalars(select(Documento)).all()
    if not docs:
        doc1 = Documento(nombre="Manual de Buenas Prácticas de Manufactura", tipo_id=tipo.id, activo=True)
        doc2 = Documento(nombre="Procedimiento Operativo de Higiene", tipo_id=tipo.id, activo=True)
        db.add_all([doc1, doc2])
        db.flush()

        v1 = VersionDocumento(
            documento_id=doc1.id,
            version=1,
            vigente=True,
            activo=True,
            fecha_subida=hoy - timedelta(days=10),
            archivo="documentos/bpm_v1.pdf",
            fecha_desde_vigencia=datetime.combine(hoy - timedelta(days=10), time.min),
        )
        v2 = VersionDocumento(
            documento_id=doc2.id,
            version=1,
            vigente=True,
            activo=True,
            fecha_subida=hoy - timedelta(days=5),
            archivo="documentos/poh_v1.pdf",
            fecha_desde_vigencia=datetime.combine(hoy - timedelta(days=5), time.min),
        )
        db.add_all([v1, v2])
        db.commit()


def _productos_para_lotes(db: SessionLocal) -> list[Producto]:
    hoy = date.today()
    unidad = db.scalar(select(UnidadMedida).where(UnidadMedida.activo == True))
    if not unidad:
        unidad = UnidadMedida(nombre="Unidad", activo=True)
        db.add(unidad)
        db.flush()

    for nombre, descripcion, cantidad in PRODUCTOS_SEMILLA:
        if not db.scalar(select(Producto).where(Producto.nombre == nombre)):
            db.add(Producto(
                nombre=nombre,
                descripcion=descripcion,
                cantidad_neta=cantidad,
                unidad_medida_id=unidad.id,
                fecha_lanzamiento=hoy - timedelta(days=90),
                foto_producto=None,
                activo=True,
            ))

    db.commit()
    return db.scalars(select(Producto).where(Producto.activo == True)).all()


def seed_lotes_produccion(db: SessionLocal):
    # Reutiliza el generador de scripts.seed_lote_produccion: histórico de los últimos
    # 30 días con varios lotes por día, estados por defecto y algunos lotes dados de baja.
    productos = _productos_para_lotes(db)
    if not productos:
        return

    lotes = generar_lotes_produccion(db)
    if not lotes:
        return

    db.add_all(lotes)
    db.commit()


def main():
    migrar_esquema_lote_produccion(engine)
    db = SessionLocal()
    try:
        cfg = seed_configuracion(db)
        seed_checklists(db)
        seed_calibraciones(db)
        seed_recambios(db)
        seed_documentos(db)
        seed_lotes_produccion(db)

        vp = leer_vista_publica(db, cfg.vista_publica_token)
        print("=== Seed Vista Pública completado con éxito ===")
        print(f"Establecimiento: {vp.establecimiento}")
        print(f"Token: {cfg.vista_publica_token}")
        print(f"Indicadores activos generados ({len(vp.indicadores)}):")
        for ind in vp.indicadores:
            print(f"  - [{ind.clave}] {ind.titulo}: {ind.valor}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
