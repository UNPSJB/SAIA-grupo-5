from datetime import date, timedelta
import pytest
from src.proveedor import exceptions, schemas, services
from src.proveedor.constants import EstadoVencimientoHabilitacion


def test_listar_proveedores(db_session, multiples_proveedores):
    proveedores = services.listar_proveedores(db_session)
    assert len(proveedores) >= 3


def test_leer_proveedor_exitoso(db_session, unico_proveedor):
    proveedor = services.leer_proveedor(db_session, unico_proveedor.id)
    assert proveedor.id == unico_proveedor.id
    assert proveedor.nombre == "Distribuidora Patagonica"
    assert proveedor.cuit == "30112233445"
    assert proveedor.habilitacion_estado == EstadoVencimientoHabilitacion.VIGENTE


def test_leer_proveedor_no_encontrado_error(db_session):
    with pytest.raises(exceptions.ProveedorNoEncontrado):
        services.leer_proveedor(db_session, 99999)


def test_crear_proveedor_exitoso(db_session):
    datos = schemas.ProveedorCreate(
        nombre="Lacteos del Sur",
        cuit="30445566778",
        telefono="2804445566",
        email="ventas@lacteossur.com",
        numero_habilitacion="HAB-887766",
        vencimiento_habilitacion=date.today() + timedelta(days=120),
    )

    nuevo = services.crear_proveedor(db_session, datos)

    assert nuevo.id is not None
    assert nuevo.cuit == "30445566778"
    assert nuevo.activo is True


def test_crear_proveedor_cuit_duplicado_error(db_session, unico_proveedor):
    datos = schemas.ProveedorCreate(
        nombre="Otro Proveedor",
        cuit=unico_proveedor.cuit,
        telefono="2804000000",
        email="otro@test.com",
    )

    with pytest.raises(exceptions.ProveedorCuitDuplicado):
        services.crear_proveedor(db_session, datos)


def test_modificar_proveedor_exitoso(db_session, unico_proveedor):
    datos = schemas.ProveedorUpdate(
        nombre="Distribuidora Patagonica SA",
        cuit=unico_proveedor.cuit,
        telefono="2804999999",
        email="nuevo@distribuidora.com",
        numero_habilitacion="HAB-NUEVA",
        vencimiento_habilitacion=unico_proveedor.vencimiento_habilitacion,
    )

    modificado = services.modificar_proveedor(db_session, unico_proveedor.id, datos)

    assert modificado.nombre == "Distribuidora Patagonica SA"
    assert modificado.telefono == "2804999999"


def test_modificar_proveedor_cuit_duplicado_error(db_session, unico_proveedor, multiples_proveedores):
    otro_cuit = multiples_proveedores[0].cuit
    datos = schemas.ProveedorUpdate(
        nombre="Intento Duplicar",
        cuit=otro_cuit,
    )
    
    with pytest.raises(exceptions.ProveedorCuitDuplicado):
        services.modificar_proveedor(db_session, unico_proveedor.id, datos)


def test_cambiar_estado_proveedor(db_session, unico_proveedor):
    estado_original = unico_proveedor.activo
    proveedor = services.cambiar_estado_proveedor(db_session, unico_proveedor.id)
    assert proveedor.activo == (not estado_original)

    proveedor = services.cambiar_estado_proveedor(db_session, unico_proveedor.id)
    assert proveedor.activo == estado_original