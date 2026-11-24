from datetime import date, datetime, timedelta
from sqlalchemy import select
import src.all_models  # noqa: F401
from src.database import SessionLocal, engine
from src.models import ModeloBase
from src.auth.utils import get_password_hash
from src.personal.models import Persona
from src.unidad_medida.models import UnidadMedida
from src.unidad_medida.services import cargar_unidades_estandar
from src.sector.models import Sector
from src.equipos.models import Equipo
from src.producto.models import Producto
from src.receta.models import Receta
from src.etapa_receta.models import EtapaReceta
from src.paso_etapa.models import PasoEtapa
from src.lote_produccion.models import LoteProduccion
from src.supervision_lote.models import SupervisionOcurrencia
from src.supervision_lote.services import generar_checklist_elaboracion_lote
from src.incidentes.migrations import migrar_esquema_incidentes
from src.lote_produccion.migrations import migrar_esquema_lote_produccion
from src.insumos.migrations import migrar_esquema_insumos
from src.producto.migrations import migrar_esquema_productos
from src.receta.migrations import migrar_esquema_recetas
from src.unidad_medida.migrations import migrar_esquema_unidades_medida


def seed():
    ModeloBase.metadata.create_all(bind=engine)
    migrar_esquema_incidentes(engine)
    migrar_esquema_lote_produccion(engine)
    migrar_esquema_insumos(engine)
    migrar_esquema_productos(engine)
    migrar_esquema_recetas(engine)
    migrar_esquema_unidades_medida(engine)

    db = SessionLocal()
    try:
        cargar_unidades_estandar(db)

        password_comun = get_password_hash("password123")

        def asegurar_persona(username, nombre, apellido, dni, mail, operar, administrar, supervisor):
            p = db.scalar(select(Persona).where(Persona.username == username))
            if not p:
                p = Persona(
                    nombre=nombre,
                    apellido=apellido,
                    dni=dni,
                    mail=mail,
                    username=username,
                    hashed_password=password_comun,
                    operar=operar,
                    administrar=administrar,
                    supervisor=supervisor,
                    activo=True,
                )
                db.add(p)
                db.flush()
            else:
                p.operar = operar
                p.administrar = administrar
                p.supervisor = supervisor
                p.activo = True
                p.hashed_password = password_comun
                db.flush()
            return p

        admin = asegurar_persona("admin", "Admin", "Sistema", "10000001", "admin@test.com", True, True, True)
        supervisor = asegurar_persona("supervisor", "Carlos", "Supervisor", "20000002", "supervisor@test.com", True, False, True)
        operario = asegurar_persona("operario", "Juan", "Operario", "30000003", "operario@test.com", True, False, False)

        um_gramo = db.scalar(select(UnidadMedida).where(UnidadMedida.codigo == "g"))
        if not um_gramo:
            um_gramo = db.scalar(select(UnidadMedida).where(UnidadMedida.nombre == "Gramo"))
        if not um_gramo:
            um_gramo = UnidadMedida(nombre="Gramo", codigo="g", masa_volumen="masa", factor_a_base=0.001, activo=True)
            db.add(um_gramo)
            db.flush()

        sector_elab = db.scalar(select(Sector).where(Sector.nombre == "Sector Elaboracion"))
        if not sector_elab:
            sector_elab = Sector(nombre="Sector Elaboracion", activo=True)
            db.add(sector_elab)
            db.flush()

        sector_empaque = db.scalar(select(Sector).where(Sector.nombre == "Sector Empaque"))
        if not sector_empaque:
            sector_empaque = Sector(nombre="Sector Empaque", activo=True)
            db.add(sector_empaque)
            db.flush()

        equipo_frio = db.scalar(select(Equipo).where(Equipo.nombre == "Camara de Frio 1"))
        if not equipo_frio:
            equipo_frio = Equipo(
                nombre="Camara de Frio 1",
                categoria="Refrigeracion",
                ubicacion="Nave A",
                estado=True,
                sector_id=sector_elab.id,
                controla_temperatura=True,
                temperatura_minima=2.0,
                temperatura_maxima=8.0,
            )
            db.add(equipo_frio)
            db.flush()

        foto_dummy = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

        prod_con_receta = db.scalar(select(Producto).where(Producto.nombre == "Alfajor Artesanal"))
        if not prod_con_receta:
            prod_con_receta = Producto(
                nombre="Alfajor Artesanal",
                descripcion="Alfajor artesanal con dulce de leche y cobertura de chocolate",
                cantidad_neta=100,
                unidad_medida_id=um_gramo.id,
                foto_producto=foto_dummy,
                fecha_lanzamiento=date.today(),
                activo=True,
                azucares_agregados=True,
                grasas_agregadas=True,
            )
            db.add(prod_con_receta)
            db.flush()

        prod_sin_receta = db.scalar(select(Producto).where(Producto.nombre == "Galletitas de Vainilla"))
        if not prod_sin_receta:
            prod_sin_receta = Producto(
                nombre="Galletitas de Vainilla",
                descripcion="Galletitas caseras sin receta asignada",
                cantidad_neta=200,
                unidad_medida_id=um_gramo.id,
                foto_producto=foto_dummy,
                fecha_lanzamiento=date.today(),
                activo=True,
            )
            db.add(prod_sin_receta)
            db.flush()

        receta = db.scalar(select(Receta).where(Receta.producto_id == prod_con_receta.id, Receta.vigente == True))
        if not receta:
            receta = Receta(
                producto_id=prod_con_receta.id,
                version=1,
                vigente=True,
                fecha_creacion=datetime.now(),
                porcion=50.0,
                porcion_unidad_medida_id=um_gramo.id,
            )
            db.add(receta)
            db.flush()

            etapa1 = EtapaReceta(receta_id=receta.id, nombre="Amasado y Horneado", orden=1)
            etapa2 = EtapaReceta(receta_id=receta.id, nombre="Relleno y Banio", orden=2)
            db.add_all([etapa1, etapa2])
            db.flush()

            paso1 = PasoEtapa(etapa_id=etapa1.id, descripcion="Mezclar ingredientes y amasar por 15 minutos", orden=1)
            paso2 = PasoEtapa(etapa_id=etapa1.id, descripcion="Hornear tapas a 180 grados durante 12 minutos", orden=2)
            paso3 = PasoEtapa(etapa_id=etapa2.id, descripcion="Rellenar con dulce de leche repostero", orden=1)
            paso4 = PasoEtapa(etapa_id=etapa2.id, descripcion="Baniar en chocolate y dejar enfriar", orden=2)
            db.add_all([paso1, paso2, paso3, paso4])
            db.flush()

        lote = db.scalar(select(LoteProduccion).where(LoteProduccion.producto_id == prod_con_receta.id))
        if not lote:
            lote = LoteProduccion(
                producto_id=prod_con_receta.id,
                fecha_produccion=date.today(),
                fecha_vencimiento=date.today() + timedelta(days=60),
                cantidad_producida=100,
                cantidad_disponible=100,
                estado="En produccion",
                sector_id=sector_elab.id,
                activo=True,
            )
            db.add(lote)
            db.flush()

        pendientes = db.scalars(
            select(SupervisionOcurrencia).where(SupervisionOcurrencia.lote_produccion_id == lote.id)
        ).all()
        if not pendientes:
            generar_checklist_elaboracion_lote(db, lote)

        db.commit()
        print("Seed completado exitosamente.")
    except Exception as e:
        db.rollback()
        print(f"Error al ejecutar seed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
