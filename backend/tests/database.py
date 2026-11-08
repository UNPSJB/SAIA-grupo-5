import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker
from datetime import date

from src.config import settings
from src.models import Base
from src.database import get_db
import src.all_models
from src.personal.models import Persona
from src.auth.utils import get_password_hash
from src.unidad_medida.models import UnidadMedida
from src.producto.models import Producto
from src.lote_produccion.models import LoteProduccion
from src.clientes.models import Cliente
from src.direcciones_cliente.models import DireccionCliente
from src.envios_lote import services as envios_services
from src.envios_lote import schemas as envios_schemas

from src.main import app
engine = create_engine(
    settings.DB_URL_TEST, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, expire_on_commit=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    # Crea las tablas antes de cada test y las destruye al finalizar
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    # Sobrescribe la dependencia get_db para usar la base de datos en memoria
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def persona(db_session):
    # Una persona activa cualquiera, sin permiso de administrar
    _persona = Persona(
        nombre="Juana",
        apellido="Perez",
        dni="30111222",
        mail="juana.perez@test.com",
        username="juana_perez",
        hashed_password=get_password_hash("juana123"),
        operar=True,
        administrar=False,
        activo=True,
    )
    db_session.add(_persona)
    db_session.commit()
    db_session.refresh(_persona)
    return _persona


@pytest.fixture(scope="function")
def auth_headers(client, db_session):
    # Una persona activa cualquiera, com permiso de administrar
    admin = Persona(
        nombre="Admin",
        apellido="Test",
        dni="00000001",
        mail="admin.test@test.com",
        username="admin_test",
        hashed_password=get_password_hash("admin123"),
        operar=True,        #tuve que poner esto en true para hacer los test de lotes_produccion
        administrar=True,
        activo=True,
    )
    db_session.add(admin)
    db_session.commit()

    r = client.post("/auth/token", data={"username": "admin_test", "password": "admin123"})
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def auth_headers_sin_permiso(client, persona):
    # se loguea persona sin permisos 
    r = client.post("/auth/token", data={"username": persona.username, "password": "juana123"})
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def unica_unidad_medida(db_session):
    unidad = UnidadMedida(nombre="Kilogramo", activo=True)
    db_session.add(unidad)
    db_session.commit()
    db_session.refresh(unidad)
    return unidad


@pytest.fixture(scope="function")
def multiples_unidades_medida(db_session):
    unidades = [
        UnidadMedida(nombre="Kilogramo", activo=True),
        UnidadMedida(nombre="Litro", activo=False),
        UnidadMedida(nombre="Gramo", activo=True),
    ]
    db_session.add_all(unidades)
    db_session.commit()
    return unidades

@pytest.fixture(scope="function")
def unico_lote_produccion(db_session, unico_producto):
    lote = LoteProduccion(
        producto_id=unico_producto.id, 
        fecha_produccion=date(2026,10,1),
        fecha_vencimiento=date(2028, 10, 1), 
        cantidad_producida=100,
        cantidad_disponible=100,
        activo=True)

    db_session.add(lote)
    db_session.commit()
    db_session.refresh(lote)
    return lote

@pytest.fixture(scope="function")
def multiples_lotes_produccion(db_session, unico_producto):
    lotes = [
        LoteProduccion(producto_id=unico_producto.id, 
                        fecha_produccion=date(2026,11,12),
                        fecha_vencimiento=date(2028, 10, 1), 
                        cantidad_producida=100,
                        cantidad_disponible=100),

        LoteProduccion(producto_id=unico_producto.id, 
                        fecha_produccion=date(2026,12,14),
                        fecha_vencimiento=date(2028, 10, 1), 
                        cantidad_producida=100,
                        cantidad_disponible=100),

        LoteProduccion(producto_id=unico_producto.id, 
                        fecha_produccion=date(2026,9,13),
                        fecha_vencimiento=date(2028, 10, 1), 
                        cantidad_producida=100,
                        cantidad_disponible=100)
    ]

    db_session.add_all(lotes)
    db_session.commit()
    return lotes

@pytest.fixture(scope="function")
def unico_producto(db_session, unica_unidad_medida):
    producto = Producto(nombre="Pan de salame", 
                        descripcion="Esto es un pan de salame",
                        cantidad_neta=1, 
                        unidad_medida_id=unica_unidad_medida.id,
                        fecha_lanzamiento=date(2026, 10, 1), 
                        foto_producto=None,)

    db_session.add(producto)
    db_session.commit()
    db_session.refresh(producto)
    return producto

@pytest.fixture(scope="function")
def multiples_productos(db_session, unica_unidad_medida):
    productos = [
        Producto(nombre="Queso crema", 
                descripcion="Queso bien cremoso",
                cantidad_neta=1, 
                unidad_medida_id=unica_unidad_medida.id,
                fecha_lanzamiento=date(2024, 10, 1), 
                foto_producto=None,
                activo=True),

        Producto(nombre="Leche", 
                descripcion="Ideal para la chocolatada",
                cantidad_neta=1, 
                unidad_medida_id=unica_unidad_medida.id,
                fecha_lanzamiento=date(2023, 10, 1), 
                foto_producto=None,
                activo=True),

        Producto(nombre="Aceitunas", 
                descripcion="Ideal para pizzas",
                cantidad_neta=1, 
                unidad_medida_id=unica_unidad_medida.id,
                fecha_lanzamiento=date(2020, 10, 1), 
                foto_producto=None,
                activo=True)
    ]
    db_session.add_all(productos)
    db_session.commit()
    return productos



@pytest.fixture(scope="function")
def unico_cliente(db_session):
    cliente = Cliente(
        razon_social="Distribuidora Sur",
        cuit="30-11223344-5",
        telefono="2804123456",
        email="contacto@distribuidorasur.com",
        activo=True,
    )
    db_session.add(cliente)
    db_session.commit()
    db_session.refresh(cliente)
    return cliente


@pytest.fixture(scope="function")
def multiples_clientes(db_session):
    clientes = [
        Cliente(razon_social="Supermercado Trelew", cuit="30-55667788-9", activo=True),
        Cliente(razon_social="Almacen Central", cuit="30-99887766-5", activo=True),
        Cliente(razon_social="Kiosco Madryn", cuit="30-12344321-0", activo=False),
    ]
    db_session.add_all(clientes)
    db_session.commit()
    return clientes


@pytest.fixture(scope="function")
def unica_direccion_cliente(db_session, unico_cliente):
    direccion = DireccionCliente(
        cliente_id=unico_cliente.id,
        calle_altura="Avenida Fontana 123",
        provincia="Chubut",
        localidad="Trelew",
        codigo_postal="9100",
        descripcion="Deposito Central",
        activo=True,
    )
    db_session.add(direccion)
    db_session.commit()
    db_session.refresh(direccion)
    return direccion


@pytest.fixture(scope="function")
def multiples_direcciones_cliente(db_session, unico_cliente):
    direcciones = [
        DireccionCliente(cliente_id=unico_cliente.id,
                        calle_altura="Ruta 3 Km 1400", 
                        provincia="Chubut",
                        localidad="Trelew",
                        codigo_postal="9100",
                        descripcion="Planta Industrial", 
                        activo=True),

        DireccionCliente(cliente_id=unico_cliente.id, 
                        calle_altura="Mitre 450", 
                        provincia="Chubut",
                        localidad="Rawson",
                        codigo_postal="9103",
                        descripcion="Sucursal Centro", 
                        activo=True),

        DireccionCliente(cliente_id=unico_cliente.id, 
                        calle_altura="Belgrano 890", 
                        provincia="Chubut",
                        localidad="Puerto Madryn",
                        codigo_postal="9120",
                        descripcion="Oficina Administrativa", 
                        activo=False),
    ]
    db_session.add_all(direcciones)
    db_session.commit()
    return direcciones


@pytest.fixture(scope="function")
def unico_envio(db_session, unico_lote_produccion, unico_cliente, unica_direccion_cliente):
    from src.lote_produccion import services as lote_services
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id, usuario_id=1)
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id, usuario_id=1)

    datos = envios_schemas.EnvioLoteCreate(
        lote_id=unico_lote_produccion.id,
        cliente_id=unico_cliente.id,
        direccion_cliente_id=unica_direccion_cliente.id,
        cantidad=30,
        numero_remito="R-0001-00000001",
        transportista="Transporte Sur",
        fecha_envio=date(2026, 10, 5),
    )
    return envios_services.crear_envio(db=db_session, datos=datos)

@pytest.fixture(scope="function")
def multiples_envios(db_session, unico_lote_produccion, unico_cliente, unica_direccion_cliente):
    from src.lote_produccion import services as lote_services
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id, usuario_id=1)
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id, usuario_id=1)

    envio_1 = envios_schemas.EnvioLoteCreate(
        lote_id=unico_lote_produccion.id,
        cliente_id=unico_cliente.id,
        direccion_cliente_id=unica_direccion_cliente.id,
        cantidad=30,
        numero_remito="R-0001-00000001",
        transportista="Transporte Sur",
        fecha_envio=date(2026, 10, 5),
    )
    envio_2 = envios_schemas.EnvioLoteCreate(
        lote_id=unico_lote_produccion.id,
        cliente_id=unico_cliente.id,
        direccion_cliente_id=unica_direccion_cliente.id,
        cantidad=40,
        numero_remito="R-0001-00000002",
        transportista="Expreso Trelew",
        fecha_envio=date(2026, 10, 8),
    )

    db_envio_1 = envios_services.crear_envio(db=db_session, datos=envio_1)
    db_envio_2 = envios_services.crear_envio(db=db_session, datos=envio_2)

    return [db_envio_1, db_envio_2]

@pytest.fixture(scope="function")
def auth_headers_sin_operar(client, db_session):
    usuario_sin_operar = Persona(
        nombre="Usuario",
        apellido="Prueba",
        dni="30111999",
        mail="sin.operar@test.com",
        username="sin_operar",
        hashed_password=get_password_hash("test123"),
        operar=False,
        administrar=False,
        activo=True,
    )
    db_session.add(usuario_sin_operar)
    db_session.commit()

    response = client.post("/auth/token", data={"username": "sin_operar", "password": "test123"})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}