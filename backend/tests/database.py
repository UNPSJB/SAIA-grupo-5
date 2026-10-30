import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker
from datetime import date

from src.config import settings
from src.models import Base
from src.database import get_db
from src.main import app
from src.personal.models import Persona
from src.auth.utils import get_password_hash
from src.unidad_medida.models import UnidadMedida
from src.producto.models import Producto

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
        operar=False,
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
def unico_producto(db_session, unica_unidad_medida):
    producto = Producto(nombre="Pan de salame", descripcion="Esto es un pan de salame",
                        cantidad_neta=1, unidad_medida_id=unica_unidad_medida.id,
                        fecha_lanzamiento=date(2026, 10, 1), foto_producto=None,)

    db_session.add(producto)
    db_session.commit()
    db_session.refresh(producto)
    return producto

@pytest.fixture(scope="function")
def multiples_productos(db_session, unica_unidad_medida):
    productos = [
        Producto(nombre="Queso crema", descripcion="Queso bien cremoso",
                        cantidad_neta=1, unidad_medida_id=unica_unidad_medida.id,
                        fecha_lanzamiento=date(2024, 10, 1), foto_producto=None,
                        activo=True),
        Producto(nombre="Leche", descripcion="Ideal para la chocolatada",
                        cantidad_neta=1, unidad_medida_id=unica_unidad_medida.id,
                        fecha_lanzamiento=date(2023, 10, 1), foto_producto=None,
                        activo=True),
        Producto(nombre="Aceitunas", descripcion="Ideal para pizzas",
                        cantidad_neta=1, unidad_medida_id=unica_unidad_medida.id,
                        fecha_lanzamiento=date(2020, 10, 1), foto_producto=None,
                        activo=True)
    ]
    db_session.add_all(productos)
    db_session.commit()
    return productos