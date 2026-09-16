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
