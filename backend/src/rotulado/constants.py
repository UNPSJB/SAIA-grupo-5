from dataclasses import dataclass
from enum import Enum

class FormatoDeclaracionAditivos(str, Enum):
    NOMBRE = "nombre"
    INS = "ins"
    NOMBRE_E_INS = "nombre_e_ins"

PREFIJO_AROMATIZANTE = "aromatizante"


class EstadoRotulado(str, Enum):
    PENDIENTE = "pendiente"
    NO_CORRESPONDE = "no_corresponde"
    EXCEPTUADO = "exceptuado"
    APLICA = "aplica"


@dataclass(frozen=True)
class Marca:
    clave: str
    nombre: str
    campo_insumo: str
    campo_producto: str
    campo_regla: str


MARCAS = (
    Marca("azucares", "Azúcares agregados", "aporta_azucares", "azucares_agregados", "aplica_por_azucares"),
    Marca("grasas", "Grasas agregadas", "aporta_grasas", "grasas_agregadas", "aplica_por_grasas"),
    Marca("sodio", "Sodio agregado", "aporta_sodio", "sodio_agregado", "aplica_por_sodio"),
    Marca("edulcorantes", "Edulcorantes", "aporta_edulcorantes", "contiene_edulcorantes", "aplica_por_edulcorantes"),
    Marca("cafeina", "Cafeína", "aporta_cafeina", "contiene_cafeina", "aplica_por_cafeina"),
)

MENSAJE_PENDIENTE = "Indicá si el producto se comercializa envasado en ausencia del cliente para saber si le corresponde el rotulado frontal."
MENSAJE_APLICA = "El producto está alcanzado por el rotulado frontal porque tiene: {marcas}."

OBSERVACION_INICIAL = "Reglas iniciales de aplicabilidad del rotulado frontal."

REGLAS_INICIALES = {
    "requiere_envasado_ausencia_cliente": True,
    "aplica_por_azucares": True,
    "aplica_por_grasas": True,
    "aplica_por_sodio": True,
    "aplica_por_edulcorantes": True,
    "aplica_por_cafeina": True,
    "formato_declaracion_aditivos": FormatoDeclaracionAditivos.NOMBRE_E_INS.value,
    "mensaje_no_corresponde": "El producto no se comercializa envasado en ausencia del cliente, por lo que no corresponde el rotulado frontal.",
    "mensaje_exceptuado": "El producto no tiene agregado de azúcares, grasas ni sodio y no contiene edulcorantes ni cafeína, por lo que queda exceptuado del rotulado frontal.",
}


# Leyenda obligatoria en toda vista previa y exportación del empaquetado.
LEYENDA_BORRADOR = (
    "BORRADOR: debe ser revisado por un/a profesional y por la autoridad sanitaria "
    "competente antes de su uso."
)


@dataclass(frozen=True)
class ElementoEmpaquetado:
    clave: str
    nombre: str
    x: float
    y: float
    ancho: float
    alto: float
    visible: bool = True


# Posiciones iniciales (porcentajes del lienzo) de los elementos del empaquetado.
# Ningún bloque queda visible de entrada: la vista previa arranca con la lista de elementos
# sin tildar y el administrador elige qué ubicar sobre la foto del envase.
ELEMENTOS_EMPAQUETADO = (
    ElementoEmpaquetado("denominacion", "Denominación de venta", 4, 3, 58, 9, visible=False),
    ElementoEmpaquetado("contenido_neto", "Contenido neto", 4, 12.5, 34, 4.5, visible=False),
    ElementoEmpaquetado("descripcion", "Descripción del producto", 4, 17.5, 58, 6, visible=False),
    ElementoEmpaquetado("ingredientes", "Lista de ingredientes", 4, 24, 58, 13, visible=False),
    ElementoEmpaquetado("alergenos", "Leyendas de alérgenos y gluten", 4, 37.5, 58, 7.5,
                        visible=False),
    ElementoEmpaquetado("origen", "Origen con RNPA/RPPA", 4, 45.5, 58, 9, visible=False),
    ElementoEmpaquetado("lote_fecha", "Lote, elaboración y vencimiento", 4, 55, 58, 8.5,
                        visible=False),
    ElementoEmpaquetado("conservacion", "Condiciones de conservación", 4, 64, 58, 5, visible=False),
    ElementoEmpaquetado("instrucciones", "Preparación e instrucciones de uso", 4, 69.5, 58, 8,
                        visible=False),
    ElementoEmpaquetado("porciones", "Porciones por envase", 4, 78, 34, 4, visible=False),
    ElementoEmpaquetado("leyendas", "Leyendas de edulcorantes y cafeína", 4, 82.5, 58, 7,
                        visible=False),
    ElementoEmpaquetado("importador", "Importador", 4, 90, 58, 9, visible=False),
    ElementoEmpaquetado("sellos", "Octógonos / sellos de advertencia", 65, 3, 31, 24, visible=False),
    ElementoEmpaquetado("codigo_barras", "Código de barras", 65, 28, 31, 12, visible=False),
    ElementoEmpaquetado("tabla_nutricional", "Tabla nutricional", 65, 41, 31, 42, visible=False),
)

CLAVES_ELEMENTO_EMPAQUETADO = tuple(elemento.clave for elemento in ELEMENTOS_EMPAQUETADO)


@dataclass(frozen=True)
class CampoRotulado:
    clave: str
    nombre: str
    obligatorio: bool = True
    automatico: bool = False
    referencia: str | None = None
    condicional: str | None = None
    multilinea: bool = False


# Campos del Capítulo V del CAA que se completan en el borrador del rótulo.
CAMPOS_ROTULADO = (
    CampoRotulado("denominacion_venta", "Denominación de venta", automatico=True,
                  referencia="Nombre del producto"),
    CampoRotulado("contenido_neto", "Contenido neto", automatico=True,
                  referencia="Contenido neto del producto"),
    CampoRotulado("lista_ingredientes", "Lista de ingredientes", automatico=True,
                  referencia="Receta vigente", multilinea=True),
    CampoRotulado("razon_social", "Razón social del elaborador", automatico=True,
                  referencia="Datos de la PyME"),
    CampoRotulado("domicilio", "Domicilio del elaborador", automatico=True,
                  referencia="Datos de la PyME"),
    CampoRotulado("numero_registro", "Número de RNPA/RPPA", automatico=True,
                  referencia="Datos de la PyME"),
    CampoRotulado("identificacion_lote", "Identificación del lote", automatico=True,
                  referencia="Ultimo lote producido"),
    CampoRotulado("fecha_duracion", "Fecha de duración"),
    CampoRotulado("instrucciones_uso", "Preparación e instrucciones de uso", obligatorio=False,
                  multilinea=True, condicional="Cuando corresponda"),
    CampoRotulado("importador_razon_social", "Razón social del importador",
                  condicional="Solo si el producto es importado"),
    CampoRotulado("importador_domicilio", "Domicilio del importador",
                  condicional="Solo si el producto es importado"),
    CampoRotulado("importador_cuit", "CUIT del importador", obligatorio=False,
                  condicional="Solo si el producto es importado"),
)

CAMPOS_TEXTO = tuple(
    campo.clave for campo in CAMPOS_ROTULADO if campo.clave != "fecha_duracion"
)

CAMPOS_AUTOMATICOS = tuple(campo.clave for campo in CAMPOS_ROTULADO if campo.automatico)

NOMBRE_CAMPO = {campo.clave: campo.nombre for campo in CAMPOS_ROTULADO}
NOMBRE_CAMPO["orden_ingredientes"] = "Orden de ingredientes"

# Abreviaturas para armar el contenido neto sugerido a partir del producto.
ABREVIATURA_UNIDAD = {
    "gramo": "g", "kilogramo": "kg", "mililitro": "ml", "litro": "l",
    "unidad": "u", "docena": "docena",
}

CAMPO_INFO_NUTRICIONAL = CampoRotulado(
    "informacion_nutricional", "Información nutricional", automatico=True, referencia="Tabla Autocalculada"
)
CAMPO_SELLOS = CampoRotulado("sellos", "Sellos de advertencia", obligatorio=False, automatico=True,
                             referencia="E12 · evaluación de rotulado frontal")


class ErrorCode:
    REGLAS_NO_ENCONTRADAS = "La versión de las reglas de rotulado no fue encontrada."
    PRODUCTO_SIN_RECETA = "El producto no tiene una receta vigente para generar el borrador del rótulo."
    INFO_NUTRICIONAL_NO_CALCULADA = (
        "La receta no tiene la información nutricional calculada. Calculala antes de exportar el borrador del rótulo."
    )
    VERSION_EMPAQUETADO_NO_ENCONTRADA = "La versión del empaquetado no fue encontrada."
    FOTO_EMPAQUETADO_INVALIDA = (
        "La foto del empaquetado debe ser una imagen PNG, JPEG o WebP de hasta 8 MB."
    )
    ELEMENTO_EMPAQUETADO_INVALIDO = "Los elementos del empaquetado tienen posiciones o tamaños inválidos."
    ORDEN_INVALIDO = "El orden solo puede cambiarse entre ingredientes con el mismo porcentaje."

