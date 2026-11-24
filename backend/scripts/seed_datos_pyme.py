"""
Carga los datos de la PyME en la configuración del sistema: nombre, contacto, los
datos del elaborador que se precargan en el rótulo (razón social, domicilio y
número de RNPA/RPPA) y los prefijos con los que seed_productos genera el código de
barras de cada producto.

Solo completa los datos vacíos (o el nombre por defecto), así no pisa lo que el
usuario ya cargó desde la pantalla de configuración.
Uso: python -m scripts.seed_datos_pyme
"""
from sqlalchemy import Engine, inspect, text

import src.all_models  # noqa: F401
from src.configuracion_sistema.models import ConfiguracionSistema
from src.configuracion_sistema.services import obtener_o_crear_configuracion
from src.producto.services import completar_codigos_barras
from src.database import SessionLocal, engine

NOMBRE_POR_DEFECTO = "Mi establecimiento"

DATOS_PYME = {
    "nombre_pyme": "Lácteos y Panificados del Valle",
    "telefono_pyme": "0280-4431122",
    "email_pyme": "contacto@lacteosdelvalle.com.ar",
    "direccion_pyme": "Av. Fontana 1250, Trelew, Chubut",
    "razon_social_elaborador": "Lácteos y Panificados del Valle S.R.L.",
    "domicilio_elaborador": "Parque Industrial Trelew, Calle 3 N° 450, Trelew (9100), Chubut",
    "numero_rnpa_rppa": "RPPA 04-000123",
    # Prefijos del código de barras EAN-13 (779 = Argentina). El de empresa es demostrativo.
    "prefijo_gs1": "779",
    "prefijo_empresa": "1234",
}

# Mismas columnas que agrega el lifespan, por si se corre el seed sin haber levantado el backend.
COLUMNAS = {
    "nombre_pyme": "VARCHAR(100) NOT NULL DEFAULT 'Mi establecimiento'",
    "telefono_pyme": "VARCHAR(30)",
    "email_pyme": "VARCHAR(150)",
    "direccion_pyme": "VARCHAR(200)",
    "razon_social_elaborador": "VARCHAR(150)",
    "domicilio_elaborador": "VARCHAR(200)",
    "numero_rnpa_rppa": "VARCHAR(30)",
    "prefijo_gs1": "VARCHAR(3) NOT NULL DEFAULT '779'",
    "prefijo_empresa": "VARCHAR(4)",
}


def asegurar_columnas(motor: Engine = engine) -> None:
    inspector = inspect(motor)
    if "configuracion_sistema" not in inspector.get_table_names():
        ConfiguracionSistema.__table__.create(bind=motor)
        return

    existentes = {columna["name"] for columna in inspector.get_columns("configuracion_sistema")}
    with motor.begin() as connection:
        for columna, definicion in COLUMNAS.items():
            if columna not in existentes:
                connection.execute(text(f"ALTER TABLE configuracion_sistema ADD COLUMN {columna} {definicion}"))


def completar_datos_pyme(db) -> list[str]:
    configuracion = obtener_o_crear_configuracion(db)
    completados = []
    for campo, valor in DATOS_PYME.items():
        actual = (getattr(configuracion, campo) or "").strip()
        if not actual or (campo == "nombre_pyme" and actual == NOMBRE_POR_DEFECTO):
            setattr(configuracion, campo, valor)
            completados.append(campo)

    # Si ya había productos cargados, reciben su código de barras con los prefijos nuevos.
    db.flush()
    completar_codigos_barras(db, configuracion)
    return completados


def main():
    asegurar_columnas()
    db = SessionLocal()
    try:
        completados = completar_datos_pyme(db)
        db.commit()
        if completados:
            print(f"Se completaron {len(completados)} datos de la PyME: {', '.join(completados)}.")
        else:
            print("Los datos de la PyME ya estaban cargados; no se modificó nada.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
