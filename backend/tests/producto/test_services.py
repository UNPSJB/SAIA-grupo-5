import pytest
from pydantic import ValidationError
from src.producto import services, schemas, exceptions
from datetime import date
from src.configuracion_sistema.models import ConfiguracionSistema
from src.configuracion_sistema.constants import ID_CONFIGURACION_SISTEMA
from pydantic import ValidationError

FOTO_PRUEBA = "data:image/png;base64,iVBORw0KGgo="


def test_crear_producto(db_session, unica_unidad_medida):
    datos = schemas.ProductoCreate(nombre="Frutillas empaquetadas", descripcion="Alguna descripcion",
                                    cantidad_neta=1, unidad_medida_id=unica_unidad_medida.id,
                                    fecha_lanzamiento=date(2026, 10, 1), foto_producto=FOTO_PRUEBA)
    
    nuevo = services.crear_producto(db = db_session, producto = datos)

    assert nuevo.id is not None
    assert nuevo.nombre == "Frutillas empaquetadas"
    assert nuevo.unidad_medida_id == unica_unidad_medida.id
    assert nuevo.activo is True


def test_crear_producto_sin_foto_falla(unica_unidad_medida):
    with pytest.raises(ValidationError):
        schemas.ProductoCreate(nombre="Producto sin foto", descripcion="Alguna descripcion",
                               cantidad_neta=1, unidad_medida_id=unica_unidad_medida.id,
                               fecha_lanzamiento=date(2026, 10, 1), foto_producto="")


def test_crear_producto_duplicado(db_session, unico_producto, unica_unidad_medida):
    datos = schemas.ProductoCreate(nombre=unico_producto.nombre, descripcion="Alguna descripcion",
                                    cantidad_neta=1, unidad_medida_id=unica_unidad_medida.id,
                                    fecha_lanzamiento=date(2026, 10, 1), foto_producto=FOTO_PRUEBA)
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
                                    fecha_lanzamiento=date(2026, 10, 10), foto_producto=FOTO_PRUEBA)
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
                                    fecha_lanzamiento=date(2026, 10, 10), foto_producto=FOTO_PRUEBA)

    with pytest.raises(exceptions.ProductoDadoDeBaja):
        services.modificar_producto(db=db_session, 
                    producto_id=unico_producto.id, producto=datos)

def test_reactivar_producto_con_unidad_medida_inactiva(db_session, unico_producto, unica_unidad_medida):
    services.cambiar_estado_producto(db=db_session, producto_id=unico_producto.id)

    unica_unidad_medida.activo = False
    db_session.commit()

    with pytest.raises(exceptions.UnidadMedidaDadaDeBaja):
        services.cambiar_estado_producto(db=db_session, producto_id=unico_producto.id)



# Tests para códigos de barras

def test_generar_digito_control():
    digito = services.generar_digito_control("590123412345")

    assert digito == 7


def test_generar_codigo_barras():
    codigo = services.generar_codigo_barras("590", "1234", "12345")

    assert codigo == "5901234123457"
    assert len(codigo) == 13


def test_generar_codigo_barras_invalido():
    with pytest.raises(ValueError):
        services.generar_codigo_barras("590", "1234", "1234")


def test_crear_producto_con_codigo_barras(db_session, unica_unidad_medida):
    configuracion = ConfiguracionSistema(id=ID_CONFIGURACION_SISTEMA, prefijo_gs1="590", prefijo_empresa="1234")
    db_session.add(configuracion)
    db_session.commit()

    datos = schemas.ProductoCreate(nombre="Producto con codigo", descripcion="Producto de prueba",
                                    cantidad_neta=500, unidad_medida_id=unica_unidad_medida.id,
                                    fecha_lanzamiento=date(2026, 10, 1), foto_producto=None,
                                    codigo_producto="12345")

    nuevo = services.crear_producto(db=db_session, producto=datos)

    assert nuevo.codigo_producto == "12345"
    assert nuevo.codigo_barras == "5901234123457"


def test_crear_producto_sin_prefijo_empresa(db_session, unica_unidad_medida):
    datos = schemas.ProductoCreate(nombre="Producto sin prefijo", descripcion="Producto de prueba",
                                    cantidad_neta=500, unidad_medida_id=unica_unidad_medida.id,
                                    fecha_lanzamiento=date(2026, 10, 1), foto_producto=None,
                                    codigo_producto="12345")

    nuevo = services.crear_producto(db=db_session, producto=datos)

    assert nuevo.codigo_producto == "12345"
    assert nuevo.codigo_barras is None


def test_crear_producto_codigo_duplicado(db_session, unica_unidad_medida):
    datos1 = schemas.ProductoCreate(nombre="Producto uno", descripcion="Producto de prueba",
                                    cantidad_neta=500, unidad_medida_id=unica_unidad_medida.id,
                                    fecha_lanzamiento=date(2026, 10, 1), foto_producto=None,
                                    codigo_producto="12345")

    datos2 = schemas.ProductoCreate(nombre="Producto dos", descripcion="Producto de prueba",
                                    cantidad_neta=500, unidad_medida_id=unica_unidad_medida.id,
                                    fecha_lanzamiento=date(2026, 10, 1), foto_producto=None,
                                    codigo_producto="12345")

    services.crear_producto(db=db_session, producto=datos1)

    with pytest.raises(exceptions.CodigoProductoDuplicado):
        services.crear_producto(db=db_session, producto=datos2)


def test_modificar_codigo_producto(db_session, unico_producto, unica_unidad_medida):
    configuracion = ConfiguracionSistema(id=ID_CONFIGURACION_SISTEMA, prefijo_gs1="590", prefijo_empresa="1234")
    db_session.add(configuracion)
    db_session.commit()

    datos = schemas.ProductoUpdate(nombre=unico_producto.nombre, descripcion="Producto modificado",
                                    cantidad_neta=500, unidad_medida_id=unica_unidad_medida.id,
                                    fecha_lanzamiento=date(2026, 10, 1), foto_producto=None,
                                    codigo_producto="12345")

    actualizado = services.modificar_producto(db=db_session, producto_id=unico_producto.id, producto=datos)

    assert actualizado.codigo_producto == "12345"
    assert actualizado.codigo_barras == "5901234123457"


def test_modificar_codigo_barras_existente(db_session, unica_unidad_medida):
    configuracion = ConfiguracionSistema(id=ID_CONFIGURACION_SISTEMA, prefijo_gs1="590", prefijo_empresa="1234")
    db_session.add(configuracion)
    db_session.commit()

    datos = schemas.ProductoCreate(nombre="Producto original", descripcion="Producto de prueba",
                                    cantidad_neta=500, unidad_medida_id=unica_unidad_medida.id,
                                    fecha_lanzamiento=date(2026, 10, 1), foto_producto=None,
                                    codigo_producto="12345")

    nuevo = services.crear_producto(db=db_session, producto=datos)

    datos_edicion = schemas.ProductoUpdate(nombre="Producto original", descripcion="Producto modificado",
                                    cantidad_neta=500, unidad_medida_id=unica_unidad_medida.id,
                                    fecha_lanzamiento=date(2026, 10, 1), foto_producto=None,
                                    codigo_producto="54321")

    actualizado = services.modificar_producto(db=db_session, producto_id=nuevo.id, producto=datos_edicion)

    assert actualizado.codigo_producto == "54321"
    assert actualizado.codigo_barras == services.generar_codigo_barras("590", "1234", "54321")
    assert actualizado.codigo_barras != "5901234123457"


def test_modificar_producto_codigo_duplicado(db_session, unica_unidad_medida):
    datos1 = schemas.ProductoCreate(nombre="Producto uno", descripcion="Producto de prueba",
                                    cantidad_neta=500, unidad_medida_id=unica_unidad_medida.id,
                                    fecha_lanzamiento=date(2026, 10, 1), foto_producto=None,
                                    codigo_producto="12345")

    datos2 = schemas.ProductoCreate(nombre="Producto dos", descripcion="Producto de prueba",
                                    cantidad_neta=500, unidad_medida_id=unica_unidad_medida.id,
                                    fecha_lanzamiento=date(2026, 10, 1), foto_producto=None,
                                    codigo_producto="54321")

    services.crear_producto(db=db_session, producto=datos1)
    producto2 = services.crear_producto(db=db_session, producto=datos2)

    datos_edicion = schemas.ProductoUpdate(nombre="Producto dos", descripcion="Producto modificado",
                                    cantidad_neta=500, unidad_medida_id=unica_unidad_medida.id,
                                    fecha_lanzamiento=date(2026, 10, 1), foto_producto=None,
                                    codigo_producto="12345")

    with pytest.raises(exceptions.CodigoProductoDuplicado):
        services.modificar_producto(db=db_session, producto_id=producto2.id, producto=datos_edicion)


def test_validar_codigo_producto_invalido(unica_unidad_medida):
    with pytest.raises(ValidationError):
        schemas.ProductoCreate(nombre="Producto invalido", descripcion="Producto de prueba",
                                cantidad_neta=500, unidad_medida_id=unica_unidad_medida.id,
                                fecha_lanzamiento=date(2026, 10, 1), foto_producto=None,
                                codigo_producto="1234")
