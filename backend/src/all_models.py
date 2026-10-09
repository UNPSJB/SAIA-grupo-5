# src/all_models.py
"""
Importa todos los modelos para que SQLAlchemy los registre antes de armar
las relaciones entre ellos (evita errores de import circular al resolver
relaciones cruzadas entre módulos, ej. Sector <-> Equipo <-> PlanLimpieza).
"""
from src.insumos.models import Insumo  
from src.personal.models import Persona  
from src.equipos.models import Equipo  
from src.sector.models import Sector  
from src.plan_limpieza.models import PlanLimpieza
from src.tarea.models import Tarea
from src.tareas_ocurrencia.models import TareaOcurrencia
from src.superficies.models import Superficie
from src.elementosLimpieza.models import ElementoLimpieza, TipoElementoLimpieza
from src.recambiosElementosLimpieza.models import RecambioElementoLimpieza
from src.consumo_producto.models import ConsumoProducto
from src.tipo_quimico.models import TipoQuimico

from src.tipo_documento.models import TipoDocumento
from src.documentos.models import Documento
from src.version_documento.models import VersionDocumento

from src.planesCalibracion.models import PlanCalibracion
from src.registrosCalibracion.models import RegistroCalibracion
from src.configuracion_sistema.models import ConfiguracionSistema
from src.notificaciones.models import Notificacion

from src.tipo_incidente.models import TipoIncidente
from src.incidentes.models import Incidente
from src.accion_correctiva.models import AccionCorrectiva
