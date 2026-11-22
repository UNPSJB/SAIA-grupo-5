from datetime import date, timedelta
from src.notificaciones import services
from src.notificaciones.constants import TipoNotificacion
from src.personal.models import Persona


def test_notificaciones_vencimiento_insumo_lote(db_session, unico_insumo_lote):
    admin = Persona(
        nombre="Admin",
        apellido="Test",
        username="admin_notif_test",
        hashed_password="x",
        administrar=True,
        operar=False,
        activo=True,
    )
    db_session.add(admin)
    unico_insumo_lote.fecha_vencimiento = date.today() + timedelta(days=5)
    unico_insumo_lote.cantidad_restante = 10
    db_session.commit()

    creadas = services.generar_notificaciones_vencimiento_insumo_lote(db_session)
    assert len(creadas) >= 1
    assert creadas[0].tipo == TipoNotificacion.VENCIMIENTO_INSUMO_LOTE.value

    duplicadas = services.generar_notificaciones_vencimiento_insumo_lote(db_session)
    assert len(duplicadas) == 0


def test_notificaciones_habilitacion_proveedor(db_session, unico_proveedor):
    admin = Persona(
        nombre="Admin",
        apellido="Prov",
        username="admin_prov_test",
        hashed_password="x",
        administrar=True,
        operar=False,
        activo=True,
    )
    db_session.add(admin)
    unico_proveedor.vencimiento_habilitacion = date.today() + timedelta(days=10)
    db_session.commit()

    creadas = services.generar_notificaciones_habilitacion_proveedor(db_session)
    assert len(creadas) >= 1
    assert creadas[0].tipo == TipoNotificacion.HABILITACION_PROVEEDOR.value


def test_notificaciones_pedidos_demorados(db_session, unico_pedido_proveedor):
    admin = Persona(
        nombre="Admin",
        apellido="Ped",
        username="admin_ped_test",
        hashed_password="x",
        administrar=True,
        operar=False,
        activo=True,
    )
    db_session.add(admin)
    unico_pedido_proveedor.fecha_entrega_estimada = date.today() - timedelta(days=2)
    db_session.commit()

    creadas = services.generar_notificaciones_pedidos_demorados(db_session)
    assert len(creadas) >= 1
    assert creadas[0].tipo == TipoNotificacion.PEDIDO_PROVEEDOR_DEMORADO.value
