from pydantic import ConfigDict
from src.insumos.schemas import InsumoBase
from src.tipo_quimico.schemas import TipoQuimico

class InsumoQuimicoBase(InsumoBase):
    tipo_quimico_id: int
    dilucion: str

class InsumoQuimicoCreate(InsumoBase):
    tipo_quimico_id: int
    dilucion: str

class InsumoQuimicoUpdate(InsumoBase):
    tipo_quimico_id: int
    dilucion: str

class InsumoQuimico(InsumoBase):
    id: int
    activo: bool
    tipo: TipoQuimico
    dilucion: str

    model_config = ConfigDict(from_attributes=True)

class InsumoQuimicoDelete(InsumoBase):
    id: int

