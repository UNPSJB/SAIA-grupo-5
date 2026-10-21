import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from src.config import settings
from src.models import Base
from src.database import get_db
from src.main import app
from src.personal.models import Persona
from src.auth.utils import get_password_hash

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
        hashed_password="x",
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
