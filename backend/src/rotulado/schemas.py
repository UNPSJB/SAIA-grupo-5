import base64
import re
from datetime import date, datetime
from typing import Annotated, Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from src.receta.schemas import EvaluacionSellos
from src.rotulado.constants import CLAVES_ELEMENTO_EMPAQUETADO, EstadoRotulado


class ReglasRotuladoBase(BaseModel):
    requiere_envasado_ausencia_cliente: bool
    aplica_por_azucares: bool
    aplica_por_grasas: bool
    aplica_por_sodio: bool
    aplica_por_edulcorantes: bool
    aplica_por_cafeina: bool
    mensaje_no_corresponde: Annotated[str, Field(min_length=5, max_length=300)]
    mensaje_exceptuado: Annotated[str, Field(min_length=5, max_length=300)]
    formato_declaracion_aditivos: Literal["nombre", "ins", "nombre_e_ins"] = "nombre_e_ins"


class ReglasRotuladoCreate(ReglasRotuladoBase):
    observacion: Annotated[str, Field(min_length=5, max_length=300)]


class ReglasRotulado(ReglasRotuladoCreate):
    id: int
    version: int
    vigente: bool
    fecha_desde_vigencia: datetime
    fecha_hasta_vigencia: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class RotuladoProductoUpdate(BaseModel):
    envasado_ausencia_cliente: bool | None = None
    azucares_agregados: bool | None = None
    grasas_agregadas: bool | None = None
    sodio_agregado: bool | None = None
    contiene_edulcorantes: bool | None = None
    contiene_cafeina: bool | None = None


class MarcaEvaluada(BaseModel):
    clave: str
    nombre: str
    sugerido: bool
    declarado: bool | None = None
    valor: bool
    considerada: bool
    insumos: list[str] = []


class EvaluacionRotulado(BaseModel):
    estado: EstadoRotulado
    mensaje: str
    envasado_ausencia_cliente: bool | None = None
    requiere_envasado_ausencia_cliente: bool
    marcas: list[MarcaEvaluada]
    reglas_version: int
    sellos: EvaluacionSellos | None = None


class DatosRotuladoCAA(BaseModel):
    """Datos del rótulo del Capítulo V del CAA declarados por el elaborador."""

    denominacion_venta: Annotated[str, Field(max_length=120)] = ""
    contenido_neto: Annotated[str, Field(max_length=60)] = ""
    lista_ingredientes: Annotated[str, Field(max_length=2000)] = ""
    razon_social: Annotated[str, Field(max_length=150)] = ""
    domicilio: Annotated[str, Field(max_length=200)] = ""
    numero_registro: Annotated[str, Field(max_length=30)] = ""
    identificacion_lote: Annotated[str, Field(max_length=100)] = ""
    fecha_duracion: date | None = None
    instrucciones_uso: Annotated[str, Field(max_length=2000)] = ""
    es_importado: bool = False
    importador_razon_social: Annotated[str, Field(max_length=150)] = ""
    importador_domicilio: Annotated[str, Field(max_length=200)] = ""
    importador_cuit: Annotated[str, Field(max_length=20)] = ""


class RotuladoCAAUpdate(DatosRotuladoCAA):
    pass


class CampoCompletitud(BaseModel):
    clave: str
    nombre: str
    obligatorio: bool
    completo: bool
    automatico: bool = False
    referencia: str | None = None
    condicional: str | None = None
    valor: str = ""
    origen: Literal["sistema", "manual", "vacio"] = "vacio"


class CambioRotulado(BaseModel):
    campo: str
    nombre_campo: str
    valor_anterior: str | None = None
    valor_nuevo: str | None = None
    usuario: str | None = None
    fecha_hora: datetime


PATRON_FOTO = re.compile(r"^data:image/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=\s]+$")
MAX_FOTO_BYTES = 8 * 1024 * 1024


class ElementoEmpaquetado(BaseModel):
    """Ubicación de un bloque del rótulo sobre la foto, en porcentajes del lienzo."""

    clave: str
    x: Annotated[float, Field(ge=0, le=100)]
    y: Annotated[float, Field(ge=0, le=100)]
    ancho: Annotated[float, Field(gt=0, le=100)]
    alto: Annotated[float, Field(gt=0, le=100)]
    visible: bool = True

    @field_validator("clave")
    @classmethod
    def validar_clave(cls, valor: str) -> str:
        if valor not in CLAVES_ELEMENTO_EMPAQUETADO:
            raise ValueError(f"Elemento de empaquetado desconocido: {valor}")
        return valor

    @model_validator(mode="after")
    def validar_limites(self):
        if self.x + self.ancho > 100.5 or self.y + self.alto > 100.5:
            raise ValueError("El elemento queda fuera del lienzo del empaquetado")
        return self


class EmpaquetadoGuardar(BaseModel):
    foto: str | None = None
    elementos: list[ElementoEmpaquetado] = []
    observacion: Annotated[str, Field(max_length=300)] = ""

    @field_validator("foto")
    @classmethod
    def validar_foto(cls, valor: str | None) -> str | None:
        if not valor:
            return None
        if not PATRON_FOTO.match(valor):
            raise ValueError("La foto del empaquetado debe ser una imagen PNG, JPEG o WebP.")
        crudo = base64.b64decode(valor.split(",", 1)[1])
        if len(crudo) > MAX_FOTO_BYTES:
            raise ValueError("La foto del empaquetado no puede superar los 8 MB.")
        return valor

    @field_validator("elementos")
    @classmethod
    def validar_elementos(cls, valores: list[ElementoEmpaquetado]) -> list[ElementoEmpaquetado]:
        claves = [elemento.clave for elemento in valores]
        if len(claves) != len(set(claves)):
            raise ValueError("No se puede repetir un elemento del empaquetado.")
        return valores


class VersionEmpaquetadoResumen(BaseModel):
    id: int
    version: int
    vigente: bool
    tiene_foto: bool
    observacion: str | None = None
    creado_por: str | None = None
    fecha_desde_vigencia: datetime
    fecha_hasta_vigencia: datetime | None = None
    
class IngredienteRotulo(BaseModel):
    insumo_id: int
    texto: str
    porcentaje: float | None = None
    empata: bool = False
    model_config = ConfigDict(from_attributes=True)


class AditivoRotulo(BaseModel):
    funcion: str | None = None
    texto: str
    aditivos: list[str] = []
    model_config = ConfigDict(from_attributes=True)


class ListaIngredientesRotulo(BaseModel):
    ingredientes: list[IngredienteRotulo]
    aditivos: list[AditivoRotulo]
    texto: str
    orden_manual: bool
    formato: str
    model_config = ConfigDict(from_attributes=True)


class OrdenIngredientesUpdate(BaseModel):
    orden: list[int] = []

class VersionEmpaquetado(VersionEmpaquetadoResumen):
    foto: str | None = None
    elementos: list[ElementoEmpaquetado] = []


class EmpaquetadoProducto(BaseModel):
    producto_id: int
    vigente: VersionEmpaquetado | None = None
    versiones: list[VersionEmpaquetadoResumen] = []
    # Lo que se dibuja: la versión vigente o la disposición inicial.
    foto: str | None = None
    elementos: list[ElementoEmpaquetado] = []
    datos: DatosRotuladoCAA
    tabla_nutricional: list[dict] | None = None
    tabla_incompleta: bool = False
    sellos: list[str] = []
    mensaje_sellos: str = ""
    descripcion: str | None = None
    codigo_barras: str | None = None
    alergenos: list[str] = []
    conservacion: str | None = None
    porciones_por_envase: str | None = None
    leyendas_obligatorias: list[str] = []
    fecha_elaboracion: date | None = None
    fecha_vencimiento: date | None = None
    leyenda: str
    faltantes: list[str] = []


class BorradorRotuladoCAA(BaseModel):
    producto_id: int
    datos: DatosRotuladoCAA
    sugeridos: dict[str, str] = {}
    campos: list[CampoCompletitud]
    faltantes: list[str]
    completitud: int
    historial: list[CambioRotulado] = []
    tabla_nutricional: list[dict] | None = None
    sellos: list[str] = []
    fecha_actualizacion: datetime | None = None
    lista_ordenada: ListaIngredientesRotulo | None = None


