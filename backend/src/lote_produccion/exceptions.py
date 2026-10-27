from fastapi import HTTPException


class ProductoDadoDeBaja(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=400,
            detail="No se puede registrar un lote de un producto dado de baja."
        )


class LoteProduccionNoEncontrado(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="El lote de producción no fue encontrado."
        )


class LoteProduccionDadoDeBaja(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=400,
            detail="No se puede modificar un lote de producción dado de baja."
        )