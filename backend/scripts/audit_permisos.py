# scripts/audit_permisos.py
"""
Recorre todas las rutas de la app y muestra qué permiso requiere cada una,
inspeccionando las Depends() reales de FastAPI (no un archivo de reglas
aparte, así que nunca queda desactualizado).
Uso: python -m scripts.audit_permisos
"""
from src.main import app
from src.auth.dependencies import tiene_permiso_administrar, tiene_permiso_operar, get_current_persona

NOMBRES = {
    tiene_permiso_administrar: "administrar",
    tiene_permiso_operar: "operar",
    get_current_persona: "logueado (cualquiera)",
}


def recorrer(routes):
    for route in routes:
        if hasattr(route, "original_router"):
            yield from recorrer(route.original_router.routes)
        elif hasattr(route, "dependant"):
            yield route


def main():
    for route in recorrer(app.routes):
        permisos = [NOMBRES[dep.call] for dep in route.dependant.dependencies if dep.call in NOMBRES]
        metodos = ",".join(route.methods - {"HEAD", "OPTIONS"}) if route.methods else ""
        print(f"{metodos:8} {route.path:45} -> {permisos or '(publico)'}")


if __name__ == "__main__":
    main()
