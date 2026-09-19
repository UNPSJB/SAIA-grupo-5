from fastapi import APIRouter, Depends
from src.auth.dependencies import tiene_permiso_administrar, get_current_persona


class PermissionedRouter(APIRouter):
    """
    Router con permiso por default según el método HTTP:
    GET -> cualquier persona logueada. POST/PUT/PATCH/DELETE -> admin.

    Para una ruta que sea la excepción a esa regla (ej. un GET que también
    requiera admin), pasarle `dependencies=[...]` explícito a esa ruta
    puntual - eso pisa el default.
    
    Ejemplo en personal.py (backend/src/personal/router.py)
    
    Excepción a la regla por default: el listado completo también requiere admin.
    @router.get("/", response_model=list[schemas.Persona], dependencies=[Depends(tiene_permiso_administrar)])
    """

    def get(self, path, *, dependencies=None, **kwargs):
        dependencies = dependencies if dependencies is not None else [Depends(get_current_persona)]
        return super().get(path, dependencies=dependencies, **kwargs)

    def post(self, path, *, dependencies=None, **kwargs):
        dependencies = dependencies if dependencies is not None else [Depends(tiene_permiso_administrar)]
        return super().post(path, dependencies=dependencies, **kwargs)

    def put(self, path, *, dependencies=None, **kwargs):
        dependencies = dependencies if dependencies is not None else [Depends(tiene_permiso_administrar)]
        return super().put(path, dependencies=dependencies, **kwargs)

    def patch(self, path, *, dependencies=None, **kwargs):
        dependencies = dependencies if dependencies is not None else [Depends(tiene_permiso_administrar)]
        return super().patch(path, dependencies=dependencies, **kwargs)

    def delete(self, path, *, dependencies=None, **kwargs):
        dependencies = dependencies if dependencies is not None else [Depends(tiene_permiso_administrar)]
        return super().delete(path, dependencies=dependencies, **kwargs)
