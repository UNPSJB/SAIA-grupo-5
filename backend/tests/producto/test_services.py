import pytest
from src.producto import services, schemas, exceptions
from datetime import date


def test_crear_producto(db_session, unica_unidad_medida):
    datos = schemas.ProductoCreate(nombre="Frutillas empaquetadas", descripcion="Alguna descripcion",
                                    cantidad_neta=1, unidad_medida_id=unica_unidad_medida.id,
                                    fecha_lanzamiento=date(2026, 10, 1), foto_producto=None)
    
    nuevo = services.crear_producto(db = db_session, producto = datos)

    assert nuevo.id is not None
    assert nuevo.nombre == "Frutillas empaquetadas"
    assert nuevo.unidad_medida_id == unica_unidad_medida.id
    assert nuevo.activo is True


def test_crear_producto_duplicado(db_session, unico_producto, unica_unidad_medida):
    datos = schemas.ProductoCreate(nombre=unico_producto.nombre, descripcion="Alguna descripcion",
                                    cantidad_neta=1, unidad_medida_id=unica_unidad_medida.id,
                                    fecha_lanzamiento=date(2026, 10, 1), foto_producto=None)
    with pytest.raises(exceptions.ProductoDuplicado):
        services.crear_producto(db = db_session, producto=datos)


def test_listar_productos(db_session, multiples_productos):
    productos = services.listar_productos(db = db_session)

    assert len(productos) == 3
    assert productos[0].nombre == "Queso crema"


def test_leer_producto(db_session, unico_producto):
    producto = services.leer_producto(db=db_session, producto_id = unico_producto.id)

    assert producto.id == unico_producto.id
    assert producto.nombre == "Pan de salame"


def test_leer_producto_no_encontrado(db_session):
    with pytest.raises(exceptions.ProductoNoEncontrado):
        services.leer_producto(db = db_session, producto_id = 999)


def test_modificar_producto(db_session, unico_producto, unica_unidad_medida):
    datos = schemas.ProductoUpdate(nombre="Prueba", descripcion="Otra descripcion",
                                    cantidad_neta=1, unidad_medida_id=unica_unidad_medida.id,
                                    fecha_lanzamiento=date(2026, 10, 10), foto_producto=None)
    actualizado = services.modificar_producto(db = db_session,
                    producto_id = unico_producto.id, producto = datos)

    assert actualizado.nombre == "Prueba"


def test_cambiar_estado_producto(db_session, unico_producto):
    actualizado = services.cambiar_estado_producto(db = db_session, 
                        producto_id = unico_producto.id)

    assert actualizado.activo is False


def test_modificar_producto_dada_de_baja(db_session, unico_producto, unica_unidad_medida):
    services.cambiar_estado_producto(db = db_session, producto_id = unico_producto.id)

    datos = schemas.ProductoUpdate(nombre="Prueba 2", descripcion="Otra descripcion",
                                    cantidad_neta=1, unidad_medida_id=unica_unidad_medida.id,
                                    fecha_lanzamiento=date(2026, 10, 10), foto_producto=None)

    with pytest.raises(exceptions.ProductoDadoDeBaja):
        services.modificar_producto(db=db_session, 
                    producto_id=unico_producto.id, producto=datos)

def test_reactivar_producto_con_unidad_medida_inactiva(db_session, unico_producto, unica_unidad_medida):
    services.cambiar_estado_producto(db=db_session, producto_id=unico_producto.id)

    unica_unidad_medida.activo = False
    db_session.commit()

    with pytest.raises(exceptions.UnidadMedidaDadaDeBaja):
        services.cambiar_estado_producto(db=db_session, producto_id=unico_producto.id)