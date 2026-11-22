import logging
from fastapi import Depends, Response
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth.dependencies import get_current_persona, tiene_permiso_administrar
from src.personal.models import Persona
from src.rotulado import schemas, services
from src.auth.router_base import PermissionedRouter

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/rotulado", tags=["rotulado"])


@router.get("/reglas", response_model=list[schemas.ReglasRotulado])
def read_versiones_reglas(db: Session = Depends(get_db)):
    return services.listar_versiones_reglas(db)

@router.get("/reglas/vigente", response_model=schemas.ReglasRotulado)
def read_reglas_vigentes(db: Session = Depends(get_db)):
    return services.obtener_reglas_vigentes(db)

@router.get("/reglas/{reglas_id}", response_model=schemas.ReglasRotulado)
def read_version_reglas(reglas_id: int, db: Session = Depends(get_db)):
    return services.leer_version_reglas(db, reglas_id)

@router.post("/reglas", response_model=schemas.ReglasRotulado)
def create_version_reglas(datos: schemas.ReglasRotuladoCreate, db: Session = Depends(get_db)):
    return services.crear_version_reglas(db, datos)

@router.get("/productos/{producto_id}", response_model=schemas.EvaluacionRotulado)
def read_rotulado_producto(producto_id: int, db: Session = Depends(get_db)):
    return services.obtener_rotulado_producto(db, producto_id)

@router.put("/productos/{producto_id}", response_model=schemas.EvaluacionRotulado)
def update_rotulado_producto(producto_id: int, datos: schemas.RotuladoProductoUpdate, db: Session = Depends(get_db)):
    return services.actualizar_rotulado_producto(db, producto_id, datos)


## Datos del rótulo del Capítulo V del CAA (borrador editable)

@router.get("/productos/{producto_id}/borrador", response_model=schemas.BorradorRotuladoCAA)
def read_borrador_caa(producto_id: int, db: Session = Depends(get_db)):
    return services.obtener_borrador_caa(db, producto_id)


@router.put("/productos/{producto_id}/borrador", response_model=schemas.BorradorRotuladoCAA)
def update_borrador_caa(
    producto_id: int,
    datos: schemas.RotuladoCAAUpdate,
    db: Session = Depends(get_db),
    usuario: Persona = Depends(get_current_persona),
):
    return services.guardar_borrador_caa(db, producto_id, datos, usuario)


# La exportación del borrador es una acción de administración, no una lectura más.
@router.get("/productos/{producto_id}/borrador.pdf", dependencies=[Depends(tiene_permiso_administrar)])
def exportar_borrador_pdf(producto_id: int, db: Session = Depends(get_db)):
    contenido = services.generar_borrador_pdf(db, producto_id)
    return Response(
        content=contenido,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="borrador_rotulo_{producto_id}.pdf"'},
    )


## Empaquetado: foto del envase y ubicación de los elementos del rótulo

@router.get("/productos/{producto_id}/empaquetado", response_model=schemas.EmpaquetadoProducto)
def read_empaquetado(producto_id: int, db: Session = Depends(get_db)):
    return services.obtener_empaquetado(db, producto_id)


@router.post("/productos/{producto_id}/empaquetado", response_model=schemas.EmpaquetadoProducto)
def create_version_empaquetado(
    producto_id: int,
    datos: schemas.EmpaquetadoGuardar,
    db: Session = Depends(get_db),
    usuario: Persona = Depends(get_current_persona),
):
    return services.guardar_version_empaquetado(db, producto_id, datos, usuario)


@router.get("/empaquetado/versiones/{version_id}", response_model=schemas.VersionEmpaquetado)
def read_version_empaquetado(version_id: int, db: Session = Depends(get_db)):
    return services.obtener_version_empaquetado(db, version_id)


@router.get("/productos/{producto_id}/empaquetado.pdf", dependencies=[Depends(tiene_permiso_administrar)])
def exportar_empaquetado_pdf(producto_id: int, db: Session = Depends(get_db)):
    contenido = services.generar_pdf_empaquetado(db, producto_id)
    return Response(
        content=contenido,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="empaquetado_{producto_id}.pdf"'},
    )
