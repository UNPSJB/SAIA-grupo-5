"""
Pobla la base de datos con tareas basadas en procedimientos POES reales
(boletín POES Argentina - SAGPyA, y guía práctica de POES Uruguay,
sección 5.2), asignadas a los planes de limpieza ya existentes.
 
Cada plan tiene al menos 8 tareas, con frecuencia y prioridad variadas:
- prioridad "alta": tareas sobre superficies/equipos de contacto directo con
  alimentos, o pasos de seguridad (energía, temperatura, gas).
- prioridad "media": limpieza de instalaciones de contacto indirecto,
  verificaciones y controles.
- prioridad "baja": registro/documentación y limpieza periódica de bajo riesgo.
- frecuencia "DIARIA": tareas que los documentos POES describen como
  intermedias (cambio de producto) o disparadas por una situación puntual
  (desperfecto de un equipo), no por calendario.
 
Requiere haber corrido antes: python -m scripts.seed_planes_limpieza
Uso: python -m scripts.seed_tareas
"""
from sqlalchemy import select

import src.all_models
from src.database import SessionLocal
from src.plan_limpieza.models import PlanLimpieza
from src.sector.models import Sector
from src.superficies.models import Superficie
from src.equipos.models import Equipo
from src.tarea.models import Tarea
from src.tarea.constants import Frecuencia, Prioridad

# plan -> sector al que pertenece (mismo criterio que scripts/seed_sectores.py
# usaba antes para vincular sectores con planes). Se usa acá solo para
# desambiguar equipos con nombre repetido en distintos sectores (ej. "Horno").
SECTOR_DEL_PLAN = {
    "Limpieza de instalaciones - Elaboración": "Elaboración",
    "Limpieza cortadora de fiambre": "Fiambrería",
    "Limpieza de equipos de frío": "Equipos de frío",
    "Limpieza de ductos y tuberías": "Depósito",
    "Gestión de recipientes de residuos": "Depósito",
    "Limpieza Salón de ventas": "Salón de ventas",
    "Limpieza Fiambrería - Útiles": "Fiambrería",
    "Limpieza Fiambrería - Balanzas": "Fiambrería",
    "Limpieza Fiambrería - Mesadas de trabajo": "Fiambrería",
    "Limpieza Fiambrería - Piletas de lavado": "Fiambrería",
    "Limpieza Rotisería - Cocina": "Rotisería",
    "Limpieza Rotisería - Horno": "Rotisería",
    "Limpieza Rotisería - Fritador": "Rotisería",
    "Limpieza Rotisería - Campana y extractor": "Rotisería",
    "Limpieza Rotisería - Mesadas y piletas": "Rotisería",
}
 
TAREAS_POR_PLAN = {
    "Limpieza de instalaciones - Elaboración": [
        {
            "nombre": "Limpiar pisos, zócalos, desagües y rejillas",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": (
                "Retirar utensilios y materiales del área, recoger los residuos sólidos, "
                "aplicar detergente/desengrasante y cepillar, enjuagar con agua potable, "
                "aplicar desinfectante y dejar actuar 15 minutos antes de reiniciar las actividades."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
            "procedimiento": [
                "Retirar todos los utensilios y llevarlos a la zona de lavado.",
                "Recoger residuos sólidos por barrido o aspirado y recolectar los mismos en bolsas de residuos.",
                "Retirar las rejillas y colocarlas en recipientes para su limpieza.",
                "Aplicar detergente y refregar con cepillos donde sea necesario.",
                "Enjuagar con agua hasta quitar todo residuo de detergente.",
                "Aplicar solución desinfectante y dejar actuar 15 minutos, como mínimo.",
                "Enjuagar cuando es requerido.",
                "Retirar el exceso de agua hacia el desagüe.",
            ],
        },
        {
            "nombre": "Limpiar paredes, revestimientos y aberturas",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": (
                "Eliminar polvo y salpicaduras de paredes, revestimientos y aberturas, aplicar "
                "solución detergente con paño o cepillo, enjuagar y desinfectar."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
            "procedimiento": [
                "Aplicar agua con detergente, esponja, cepillo o similar.",
                "Enjuagar con agua hasta quitar todo residuo de detergente.",
                "Aplicar solución desinfectante.",
                "Verificar el estado correcto de la limpieza y completar el registro de limpieza.",
            ],
        },
        {
            "nombre": "Limpiar techos, luces y estructuras aéreas",
            "frecuencia": Frecuencia.MENSUAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": (
                "Remover telarañas y polvo acumulado en techos y estructuras aéreas, limpiar "
                "luminarias con paño húmedo y verificar ausencia de condensación."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": "Repetir la limpieza si se detecta acumulación de residuos o condensación",
            "procedimiento": [
                "Aplicar agua con desinfectante, comenzando por el techo y siguiendo con las luces.",
                "Verificar el estado correcto de la limpieza y completar el registro de limpieza.",
            ],
        },
        {
            "nombre": "Limpiar mesadas y útiles de trabajo",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": (
                "Retirar restos de alimentos y utensilios, lavar con detergente, enjuagar con "
                "agua potable y aplicar desinfectante sobre toda la superficie de contacto directo."
            ),
            "foto_obligatoria": True,
            "accion_correctiva": "Repetir el lavado y la desinfección antes de reanudar la manipulación de alimentos",
            "procedimiento": [
                "Lavar la superficie.",
                "Enjuagar.",
                "Desinfectar.",
                "Enjuagar nuevamente.",
                "Secar.",
            ],
        },
        {
            "nombre": "Limpiar estanterías y armarios",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Retirar mercadería estibada y repasar estanterías y armarios con trapo húmedo.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
            "procedimiento": [
                "Retirar de las estanterías la mercadería estibada.",
                "Repasar estanterías, estantes o racks con trapo húmedo.",
                "Verificar el estado correcto de la limpieza y completar el registro de limpieza.",
            ],
        },
        {
            "nombre": "Limpiar piletas de lavado y desinfección de vegetales y huevos",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": (
                "Retirar residuos sólidos, aplicar detergente con esponja o cepillo, enjuagar "
                "con abundante agua y aplicar solución desinfectante apta para alimentos."
            ),
            "foto_obligatoria": True,
            "accion_correctiva": None,
            "procedimiento": [
                "Retirar residuos sólidos.",
                "Aplicar agua y detergente con esponja, cepillo o similar.",
                "Enjuagar con abundante agua.",
                "Aplicar agua con desinfectante.",
            ],
        },
        {
            "nombre": "Limpiar equipos de elaboración (amasadora)",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": (
                "Desarmar y quitar las paletas y el recipiente de amasado. Lavar, enjuagar, "
                "desinfectar, enjuagar y secar cada parte antes de rearmar el equipo."
            ),
            "foto_obligatoria": True,
            "accion_correctiva": "Repetir el desarmado y la desinfección de las partes antes de continuar la producción",
            "procedimiento": [
                "Desarmar y quitar las paletas y el recipiente de amasado.",
                "Lavar cada parte.",
                "Enjuagar.",
                "Desinfectar.",
                "Enjuagar nuevamente.",
                "Secar cada parte antes de rearmar el equipo.",
            ],
        },
        {
            "nombre": "Completar y verificar planilla de registro de limpieza preoperacional",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.BAJA,
            "descripcion": (
                "Verificar visualmente el estado de la limpieza de instalaciones y equipos, y "
                "completar la planilla de control indicando correcto/incorrecto y las acciones "
                "correctivas tomadas."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
    ],
    "Limpieza cortadora de fiambre": [
        {
            "nombre": "Limpieza diaria de cortadora",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": (
                "Desconectar la máquina de la energía eléctrica, retirar residuos de alimentos, "
                "desarmar las partes desmontables (cuchilla, protector, bandeja), aplicar detergente "
                "desengrasante, enjuagar con agua potable y aplicar desinfectante sobre todas las "
                "superficies de contacto directo con el alimento."
            ),
            "foto_obligatoria": True,
            "accion_correctiva": "Repetir el procedimiento completo y verificar antes de continuar",
            "procedimiento": [
                "Desconectar la energía eléctrica.",
                "Retirar residuos de fiambre del equipo, utilizando trapo o similar.",
                "Desarmar todas las partes del equipo.",
                "Aplicar agua y detergente en todas las partes, con esponja, cepillo o similar.",
                "Enjuagar con abundante agua.",
                "Aplicar agua con desinfectante.",
            ],
        },
        {
            "nombre": "Limpieza intermedia al cambiar de producto",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": (
                "En caso de utilizar el mismo equipo para cortar distintos productos (por ejemplo "
                "fiambres y quesos), realizar una limpieza intermedia eliminando los residuos "
                "sólidos antes de cambiar de producto."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
            "procedimiento": [
                "Detener el uso del equipo.",
                "Retirar los residuos sólidos del producto anterior.",
                "Verificar que no queden restos antes de continuar con el nuevo producto.",
            ],
        },
        {
            "nombre": "Verificar desconexión de energía eléctrica antes de la limpieza",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": "Confirmar que el equipo está desconectado de la energía eléctrica antes de iniciar cualquier tarea de limpieza.",
            "foto_obligatoria": False,
            "accion_correctiva": "No proceder con la limpieza hasta confirmar que el equipo está desconectado",
        },
        {
            "nombre": "Desarmar y limpiar partes desmontables",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": "Retirar cuchilla, protector y bandeja, lavar cada parte por separado con detergente y enjuagar con abundante agua.",
            "foto_obligatoria": True,
            "accion_correctiva": None,
        },
        {
            "nombre": "Aplicar y verificar acción del desinfectante",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Aplicar la solución desinfectante en la concentración indicada y dejar actuar el tiempo mínimo requerido antes de enjuagar.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Limpieza semanal profunda de la base y soportes",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Limpiar la base, los soportes y las zonas de difícil acceso del equipo con cepillo y desinfectante.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar filo y estado de la cuchilla",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Inspeccionar visualmente el filo y el estado general de la cuchilla.",
            "foto_obligatoria": False,
            "accion_correctiva": "Retirar el equipo de uso y notificar al encargado si la cuchilla presenta daños",
        },
        {
            "nombre": "Completar registro de limpieza y desinfección",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Completar la planilla de control indicando el resultado de la limpieza y la persona responsable.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
    ],
    "Limpieza de equipos de frío": [
        {
            "nombre": "Limpieza diaria de heladeras y vitrinas",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": (
                "Retirar residuos y derrames, limpiar superficies internas y externas con paño "
                "húmedo y detergente, enjuagar, desinfectar y verificar la temperatura de funcionamiento."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
            "procedimiento": [
                "Retirar residuos sólidos, utilizando trapo o similar.",
                "Aplicar agua y detergente con esponja, cepillo o similar al interior y exterior del equipo.",
                "Enjuagar con agua mediante trapo o similar.",
                "Aplicar agua con desinfectante.",
                "Verificar el estado correcto de la limpieza y completar el registro de limpieza.",
            ],
        },
        {
            "nombre": "Limpieza profunda semanal de heladeras",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": (
                "Retirar y desarmar las partes internas removibles (estantes, bandejas, burletes), "
                "lavar con detergente, enjuagar, desinfectar y secar antes de recolocarlas; "
                "verificar el estado de burletes y desagües."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
            "procedimiento": [
                "Retirar y desarmar las partes internas del equipo.",
                "Aplicar agua y detergente a todas las partes con esponja, cepillo o similar.",
                "Enjuagar con agua mediante trapo o similar.",
                "Aplicar agua con desinfectante.",
                "Verificar el estado correcto de la limpieza y completar el registro de limpieza.",
            ],
        },
        {
            "nombre": "Limpieza superficial de cámaras",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": (
                "Barrer y retirar residuos del piso de la cámara, limpiar salpicaduras en paredes "
                "bajas y verificar ausencia de hielo o derrames."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
            "procedimiento": [
                "Retirar residuos sólidos de piso, estanterías, racks y pallets.",
                "Aplicar agua y detergente con esponja, cepillo o similar.",
                "Enjuagar con agua mediante trapo o similar.",
                "Verificar el estado correcto de la limpieza y completar el registro de limpieza.",
            ],
        },
        {
            "nombre": "Limpieza profunda semanal de cámaras",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": (
                "Reubicar temporalmente los productos estibados, limpiar paredes, techo y piso con "
                "detergente desengrasante, enjuagar, desinfectar y ventilar antes de reingresar la "
                "mercadería."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": "Verificar que la cámara alcance nuevamente la temperatura adecuada antes de reingresar la mercadería",
            "procedimiento": [
                "Reubicar los productos estibados en estanterías, racks, pallets y cajones.",
                "Retirar residuos sólidos de piso, estanterías, racks y pallets.",
                "Aplicar agua y detergente en techo, luces, paredes, cortinas, estanterías, pallets, racks y piso con esponja, cepillo o similar.",
                "Enjuagar con abundante agua.",
                "Aplicar agua con desinfectante.",
            ],
        },
        {
            "nombre": "Limpieza semanal de freezers",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.ALTA,
            "descripcion": (
                "Reubicar los productos estibados y descongelar el equipo, aplicar agua y "
                "detergente con esponja o cepillo, enjuagar y aplicar agua con desinfectante."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
            "procedimiento": [
                "Reubicar los productos estibados y descongelar el equipo.",
                "Aplicar agua y detergente a todas las partes con esponja, cepillo o similar.",
                "Enjuagar con agua mediante trapo o similar.",
                "Aplicar agua con desinfectante.",
                "Verificar el estado correcto de la limpieza y completar el registro de limpieza.",
            ],
        },
        {
            "nombre": "Verificar temperatura de heladeras y freezers",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": "Controlar y registrar la temperatura de funcionamiento de cada equipo de frío.",
            "foto_obligatoria": False,
            "accion_correctiva": "Notificar al encargado si la temperatura está fuera de rango y reubicar los productos si es necesario",
        },
        {
            "nombre": "Limpiar burletes y desagües de cámaras",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Limpiar burletes de puertas y verificar que los desagües no estén obstruidos.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Completar planilla de control de temperatura y limpieza",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Registrar en la planilla correspondiente la temperatura y el estado de limpieza de cada equipo.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
    ],
    "Limpieza de ductos y tuberías": [
        {
            "nombre": "Limpiar caños, tubos, ductos de ventilación",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": (
                "Retirar la mercadería estibada en estanterías y racks cercanos, repasar caños, "
                "tubos y ductos de ventilación con un trapo húmedo."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
            "procedimiento": [
                "Retirar de las estanterías, racks, estantes la mercadería estibada.",
                "Repasar tubos, ductos, caños con trapo húmedo.",
                "Verificar el estado correcto de la limpieza y completar el registro de limpieza.",
            ],
        },
        {
            "nombre": "Retirar mercadería estibada antes de la limpieza de ductos",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Despejar la zona debajo de los ductos, retirando mercadería estibada en estanterías y racks.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Repasar rejillas de ventilación con trapo húmedo",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Limpiar rejillas de ventilación accesibles con trapo húmedo.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar ausencia de acumulación de polvo en ductos",
            "frecuencia": Frecuencia.QUINCENAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Inspeccionar visualmente los ductos para verificar que no haya acumulación de polvo o suciedad.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Limpieza mensual de estructuras aéreas del depósito",
            "frecuencia": Frecuencia.MENSUAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Limpiar estructuras aéreas y soportes del depósito con agua y desinfectante.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar funcionamiento de extractores de aire",
            "frecuencia": Frecuencia.MENSUAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Comprobar que los extractores de aire del depósito funcionen correctamente.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Completar registro de limpieza de instalaciones del depósito",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Registrar en la planilla correspondiente la limpieza realizada en ductos y estructuras.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Inspeccionar ausencia de plagas en ductos y aberturas",
            "frecuencia": Frecuencia.MENSUAL,
            "prioridad": Prioridad.ALTA,
            "descripcion": "Verificar que ductos y aberturas no presenten indicios de plagas o roedores.",
            "foto_obligatoria": False,
            "accion_correctiva": "Notificar al encargado y contactar al servicio de control de plagas",
        },
    ],
    "Gestión de recipientes de residuos": [
        {
            "nombre": "Limpiar recipientes de residuos",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": (
                "Retirar las bolsas de residuos, aplicar detergente con esponja o cepillo, "
                "enjuagar y aplicar desinfectante."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
            "procedimiento": [
                "Retirar las bolsas de residuos de los recipientes para su eliminación.",
                "Aplicar agua con detergente, utilizando esponja, cepillo o similar.",
                "Enjuagar con abundante agua.",
                "Aplicar agua y desinfectante.",
                "Verificar el estado correcto de la limpieza y completar el registro de limpieza.",
            ],
        },
        {
            "nombre": "Retirar y cerrar correctamente las bolsas de residuos",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Cerrar correctamente cada bolsa llena antes de trasladarla, evitando derrames.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Trasladar y estibar residuos en el depósito de residuos",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Trasladar las bolsas cerradas y estibarlas correctamente en el depósito de residuos.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Lavar y desinfectar guantes utilizados en el manejo de residuos",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Lavar y desinfectar los guantes utilizados en el manejo de residuos antes de guardarlos.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar cierre correcto de recipientes de residuos",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Verificar que las tapas de los recipientes queden correctamente cerradas.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Limpieza semanal profunda de recipientes de residuos",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Realizar una limpieza y desinfección profunda de todos los recipientes de residuos.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar ausencia de derrames o malos olores en el depósito de residuos",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Inspeccionar el depósito de residuos para verificar que no existan derrames ni malos olores.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Completar registro de gestión de residuos",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Registrar en la planilla correspondiente la gestión diaria de residuos.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
    ],
    "Limpieza Salón de ventas": [
        {
            "nombre": "Limpiar estanterías, estantes, racks",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Retirar la mercadería estibada y repasar con un trapo húmedo.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
            "procedimiento": [
                "Retirar de las estanterías la mercadería estibada.",
                "Repasar estanterías, estantes o racks con trapo húmedo.",
                "Verificar el estado correcto de la limpieza y completar el registro de limpieza.",
            ],
        },
        {
            "nombre": "Limpiar pisos del salón de ventas",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Barrer y trapear los pisos del salón de ventas con agua y detergente.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Limpiar vidrieras y mostradores",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Limpiar vidrieras y mostradores con paño húmedo y producto adecuado para vidrio.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Limpiar cestos de residuos del salón",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Vaciar y limpiar los cestos de residuos ubicados en el salón de ventas.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Repasar cajas registradoras y mostradores de atención al público",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Repasar con paño húmedo las cajas registradoras y mostradores de atención.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Limpieza mensual de techos y luminarias del salón",
            "frecuencia": Frecuencia.MENSUAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Limpiar techos y luminarias del salón de ventas.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Limpiar puertas y aberturas de acceso al salón",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Limpiar puertas, manijas y aberturas de acceso al salón de ventas.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Completar registro de limpieza del salón de ventas",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Registrar en la planilla correspondiente la limpieza realizada en el salón.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
    ],
    "Limpieza Fiambrería - Útiles": [
        {
            "nombre": "Limpiar útiles",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": "Aplicar agua y detergente con esponja o cepillo, enjuagar con abundante agua.",
            "foto_obligatoria": True,
            "accion_correctiva": None,
            "procedimiento": [
                "Aplicar agua y detergente, con esponja, cepillo o similar.",
                "Enjuagar con abundante agua.",
                "Verificar el estado correcto de la limpieza y completar el registro de limpieza.",
            ],
        },
        {
            "nombre": "Desinfectar útiles luego del lavado",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": "Aplicar solución desinfectante sobre los útiles luego del lavado y enjuagar.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Secar útiles antes de guardarlos",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Secar completamente los útiles antes de almacenarlos.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar ausencia de residuos en útiles antes de su uso",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Inspeccionar visualmente los útiles antes de utilizarlos para confirmar que están limpios.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Almacenar útiles limpios en lugar identificado y protegido",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Guardar los útiles limpios en un lugar identificado y protegido de contaminación.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Limpieza semanal profunda de útiles (cuchillos, tablas, ganchos)",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Realizar una limpieza y desinfección profunda de cuchillos, tablas y ganchos.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar estado de conservación de tablas y utensilios",
            "frecuencia": Frecuencia.QUINCENAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Inspeccionar el estado de tablas y utensilios, verificando ausencia de grietas o deterioro.",
            "foto_obligatoria": False,
            "accion_correctiva": "Dar de baja y reemplazar los utensilios que presenten grietas o deterioro",
        },
        {
            "nombre": "Completar registro de limpieza de útiles",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Registrar en la planilla correspondiente la limpieza diaria de útiles.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
    ],
    "Limpieza Fiambrería - Balanzas": [
        {
            "nombre": "Limpiar balanzas",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": (
                "Aplicar agua y detergente con trapo o esponja, enjuagar, aplicar desinfectante "
                "y enjuagar nuevamente."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
            "procedimiento": [
                "Aplicar agua y detergente con trapo, esponja o similar.",
                "Enjuagar con agua.",
                "Aplicar desinfectante.",
                "Enjuagar.",
                "Verificar el estado correcto de limpieza y completar el registro de limpieza.",
            ],
        },
        {
            "nombre": "Desinfectar plato de balanza luego de pesar producto crudo",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": "Desinfectar el plato de la balanza cada vez que se pese un producto crudo, antes de pesar otro tipo de producto.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar calibración de la balanza",
            "frecuencia": Frecuencia.MENSUAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Verificar que la balanza mantenga una calibración correcta.",
            "foto_obligatoria": False,
            "accion_correctiva": "Notificar al encargado y solicitar la recalibración del equipo",
        },
        {
            "nombre": "Limpiar base y estructura externa de la balanza",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Limpiar la base y estructura externa de la balanza con paño húmedo.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Retirar residuos de papel y etiquetas adheridas",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Retirar restos de papel, etiquetas o precintos adheridos a la balanza.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar ausencia de humedad en el sistema electrónico",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Verificar que no ingrese humedad al sistema electrónico de la balanza durante la limpieza.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Completar registro de limpieza de balanzas",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Registrar en la planilla correspondiente la limpieza diaria de la balanza.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Notificar desperfectos de la balanza al encargado",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Notificar al encargado ante cualquier desperfecto detectado en el funcionamiento de la balanza.",
            "foto_obligatoria": False,
            "accion_correctiva": "Retirar la balanza de uso hasta su reparación",
        },
    ],
    "Limpieza Fiambrería - Mesadas de trabajo": [
        {
            "nombre": "Limpiar mesadas de trabajo",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": (
                "Retirar residuos sólidos, aplicar detergente, enjuagar y aplicar desinfectante."
            ),
            "foto_obligatoria": True,
            "accion_correctiva": None,
            "procedimiento": [
                "Retirar residuos sólidos, utilizando trapo o similar.",
                "Aplicar agua y detergente con esponja, cepillo o similar.",
                "Enjuagar con abundante agua.",
                "Aplicar agua con desinfectante.",
            ],
        },
        {
            "nombre": "Retirar elementos apoyados sobre la mesada antes de limpiar",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Retirar materia prima, productos semielaborados y terminados antes de iniciar la limpieza de la mesada.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Desinfectar mesada luego de cada cambio de producto",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": "Desinfectar la mesada cada vez que se cambia el tipo de producto que se manipula sobre ella.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar ausencia de residuos antes de reanudar el trabajo",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Verificar visualmente que la mesada esté libre de residuos antes de reanudar la manipulación de alimentos.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Limpieza semanal profunda de bordes y uniones de la mesada",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Limpiar en profundidad bordes y uniones de la mesada donde pueden acumularse residuos.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar estado de la superficie (grietas, deterioro)",
            "frecuencia": Frecuencia.MENSUAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Inspeccionar la superficie de la mesada en busca de grietas o deterioro que dificulten la limpieza.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Completar registro de limpieza de mesadas",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Registrar en la planilla correspondiente la limpieza diaria de la mesada.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Notificar daños en la superficie de la mesada al encargado",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Notificar al encargado ante grietas, deterioro u otro daño detectado en la superficie de la mesada.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
    ],
    "Limpieza Fiambrería - Piletas de lavado": [
        {
            "nombre": "Limpiar piletas de lavado",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": (
                "Retirar residuos sólidos, aplicar detergente, enjuagar y aplicar desinfectante."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
            "procedimiento": [
                "Retirar residuos sólidos.",
                "Aplicar agua y detergente con esponja, cepillo o similar.",
                "Enjuagar con abundante agua.",
                "Aplicar agua con desinfectante.",
            ],
        },
        {
            "nombre": "Retirar residuos sólidos antes del lavado",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Retirar residuos sólidos de la pileta antes de aplicar detergente.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Desinfectar pileta luego del lavado de utensilios",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": "Aplicar solución desinfectante en la pileta luego de utilizarla para lavar utensilios.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar buen funcionamiento del desagüe",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Verificar que el desagüe de la pileta no esté obstruido.",
            "foto_obligatoria": False,
            "accion_correctiva": "Notificar al encargado si el desagüe presenta obstrucciones",
        },
        {
            "nombre": "Limpiar grifería y accesorios de la pileta",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Limpiar grifería, jaboneras y accesorios de la pileta.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar disponibilidad de jabón y elementos de higiene de manos",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Verificar que la pileta cuente con jabón y elementos necesarios para la higiene de manos.",
            "foto_obligatoria": False,
            "accion_correctiva": "Reponer jabón o elementos faltantes antes de reanudar las tareas",
        },
        {
            "nombre": "Completar registro de limpieza de piletas",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Registrar en la planilla correspondiente la limpieza diaria de la pileta.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Reportar obstrucciones en el desagüe al encargado",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Reportar al encargado cualquier obstrucción o mal funcionamiento detectado en el desagüe.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
    ],
    "Limpieza Rotisería - Cocina": [
        {
            "nombre": "Limpiar cocina",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": (
                "Retirar residuos, desarmar partes (rejillas, hornallas), aplicar detergente, "
                "enjuagar y aplicar desinfectante."
            ),
            "foto_obligatoria": True,
            "accion_correctiva": None,
            "procedimiento": [
                "Retirar residuos sólidos del equipo, utilizando trapo o similar.",
                "Desarmar todas las partes del equipo (rejillas, hornallas, etcétera).",
                "Aplicar agua y detergente en todas las partes, con esponja, cepillo o similar.",
                "Enjuagar con abundante agua.",
                "Aplicar agua con desinfectante.",
                "Verificar el estado correcto de la limpieza y completar el registro de limpieza.",
            ],
        },
        {
            "nombre": "Desarmar y limpiar rejillas y hornallas",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": "Retirar rejillas y hornallas, lavar con detergente y enjuagar con abundante agua.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar cierre correcto de llaves de gas al finalizar la limpieza",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": "Verificar que todas las llaves de gas de la cocina queden correctamente cerradas al finalizar la limpieza.",
            "foto_obligatoria": False,
            "accion_correctiva": "No dejar el sector hasta confirmar el cierre de las llaves de gas",
        },
        {
            "nombre": "Limpiar perillas y panel de control de la cocina",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Limpiar perillas y panel de control con paño húmedo y detergente.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar ausencia de residuos grasos acumulados",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Inspeccionar la cocina en busca de residuos grasos acumulados en zonas de difícil acceso.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Limpieza profunda mensual de la cocina",
            "frecuencia": Frecuencia.MENSUAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Realizar una limpieza profunda de toda la cocina, incluyendo zonas menos accesibles.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Completar registro de limpieza de la cocina",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Registrar en la planilla correspondiente la limpieza diaria de la cocina.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar funcionamiento correcto de los quemadores",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Verificar que los quemadores enciendan y funcionen correctamente luego de la limpieza.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
    ],
    "Limpieza Rotisería - Horno": [
        {
            "nombre": "Limpiar horno",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Retirar residuos, retirar partes del equipo, aplicar detergente y enjuagar.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
            "procedimiento": [
                "Retirar residuos sólidos del equipo, utilizando trapo o similar.",
                "Retirar todas las partes del equipo (rejillas, hornallas, etcétera).",
                "Aplicar agua y detergente en todas las partes, con esponja, cepillo o similar.",
                "Enjuagar con abundante agua.",
                "Verificar el estado correcto de la limpieza y completar el registro de limpieza.",
            ],
        },
        {
            "nombre": "Retirar residuos sólidos del horno con trapo",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Retirar residuos sólidos del interior del horno utilizando trapo o similar.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Retirar y lavar rejillas del horno",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Retirar las rejillas del horno y lavarlas con detergente, enjuagando con abundante agua.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Enjuagar y secar completamente el horno",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Enjuagar con abundante agua y secar completamente antes de volver a utilizar el horno.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar estado de la puerta y burletes del horno",
            "frecuencia": Frecuencia.MENSUAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Verificar el estado de la puerta y los burletes del horno.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar temperatura de funcionamiento del horno",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Verificar que el horno alcance y mantenga la temperatura de funcionamiento esperada.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Completar registro de limpieza del horno",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Registrar en la planilla correspondiente la limpieza semanal del horno.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Notificar desperfectos del horno al encargado",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Notificar al encargado ante cualquier desperfecto detectado en el funcionamiento del horno.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
    ],
    "Limpieza Rotisería - Fritador": [
        {
            "nombre": "Limpiar fritador",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.ALTA,
            "descripcion": (
                "Vaciar el aceite en un recipiente adecuado, desarmar partes, aplicar agua caliente "
                "y detergente, enjuagar y secar completamente."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": "Verificar temperatura del equipo antes de proceder a la limpieza para evitar siniestros laborales",
            "procedimiento": [
                "Vaciar el fritador colocando el aceite en recipiente adecuado para su eliminación.",
                "Desarmar todas las partes posibles del equipo.",
                "Aplicar agua caliente y detergente en todas las partes, con esponja, cepillo o similar.",
                "Enjuagar con abundante agua.",
                "Secar completamente el equipo.",
                "Verificar el estado correcto de la limpieza y completar el registro de limpieza.",
            ],
        },
        {
            "nombre": "Verificar temperatura del fritador antes de la limpieza",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.ALTA,
            "descripcion": "Comprobar que el fritador esté a una temperatura segura antes de comenzar la limpieza.",
            "foto_obligatoria": False,
            "accion_correctiva": "No proceder con la limpieza hasta que el equipo esté a temperatura segura",
        },
        {
            "nombre": "Eliminar aceite usado en recipiente adecuado",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Vaciar el aceite usado en un recipiente adecuado para su eliminación correcta.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Desarmar y lavar partes desmontables del fritador",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Desarmar las partes posibles del equipo y lavarlas con agua caliente y detergente.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Secar completamente antes de volver a cargar aceite",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Secar completamente el equipo antes de volver a cargar aceite nuevo.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar estado del aceite antes de cada uso",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": "Verificar el color y estado del aceite antes de iniciar la jornada de fritado.",
            "foto_obligatoria": False,
            "accion_correctiva": "Reemplazar el aceite si presenta signos de deterioro",
        },
        {
            "nombre": "Completar registro de limpieza del fritador",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Registrar en la planilla correspondiente la limpieza semanal del fritador.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Notificar humo u olores anormales durante el uso",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": "Notificar de inmediato al encargado si se detecta humo excesivo u olores anormales durante el uso del fritador.",
            "foto_obligatoria": False,
            "accion_correctiva": "Suspender el uso del equipo hasta su revisión",
        },
    ],
    "Limpieza Rotisería - Campana y extractor": [
        {
            "nombre": "Limpiar campana y extractor",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": (
                "Aplicar agua caliente y detergente/desengrasante, enjuagar, secar y verificar "
                "el filtro si existiera."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
            "procedimiento": [
                "Aplicar agua caliente y detergente o desengrasante con esponja, cepillo o similar.",
                "Enjuagar con abundante agua.",
                "Secar completamente el equipo.",
                "Verificar el estado correcto de la limpieza y del filtro (si existiere en extractor) y completar el registro de limpieza.",
            ],
        },
        {
            "nombre": "Aplicar desengrasante y enjuagar completamente",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Aplicar producto desengrasante sobre la campana y enjuagar completamente con agua caliente.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Secar campana y extractor luego de la limpieza",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Secar completamente la campana y el extractor luego de la limpieza.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar y limpiar el filtro del extractor",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Retirar, limpiar y verificar el estado del filtro del extractor, si existiera.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar tiraje correcto del extractor",
            "frecuencia": Frecuencia.MENSUAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Verificar que el extractor mantenga un tiraje adecuado luego de la limpieza.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Limpieza profunda mensual de ductos de extracción",
            "frecuencia": Frecuencia.MENSUAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Realizar una limpieza profunda de los ductos de extracción de la campana.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Completar registro de limpieza de campana y extractor",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Registrar en la planilla correspondiente la limpieza semanal de campana y extractor.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Notificar acumulación excesiva de grasa en el filtro",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Notificar al encargado si se detecta una acumulación excesiva de grasa en el filtro antes de la próxima limpieza programada.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
    ],
    "Limpieza Rotisería - Mesadas y piletas": [
        {
            "nombre": "Limpiar mesadas de trabajo",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": (
                "Retirar residuos sólidos, aplicar detergente, enjuagar y aplicar desinfectante."
            ),
            "foto_obligatoria": True,
            "accion_correctiva": None,
            "procedimiento": [
                "Retirar residuos sólidos, utilizando trapo o similar.",
                "Aplicar agua y detergente con esponja, cepillo o similar.",
                "Enjuagar con abundante agua.",
                "Aplicar agua con desinfectante.",
                "Verificar el estado correcto de la limpieza y completar el registro de limpieza.",
            ],
        },
        {
            "nombre": "Limpiar piletas de lavado",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": (
                "Retirar residuos sólidos, aplicar detergente, enjuagar y aplicar desinfectante."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
            "procedimiento": [
                "Retirar residuos sólidos.",
                "Aplicar agua y detergente con esponja, cepillo o similar.",
                "Enjuagar con abundante agua.",
                "Aplicar agua con desinfectante.",
                "Verificar el estado correcto de la limpieza y completar el registro de limpieza.",
            ],
        },
        {
            "nombre": "Limpiar útiles",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": "Aplicar agua y detergente con esponja o cepillo, enjuagar con abundante agua.",
            "foto_obligatoria": True,
            "accion_correctiva": None,
            "procedimiento": [
                "Aplicar agua y detergente, con esponja, cepillo o similar.",
                "Enjuagar con abundante agua.",
                "Verificar el estado correcto de la limpieza y completar el registro de limpieza.",
            ],
        },
        {
            "nombre": "Desinfectar mesada luego de cada cambio de producto",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.ALTA,
            "descripcion": "Desinfectar la mesada cada vez que se cambia el tipo de producto que se manipula sobre ella.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Retirar residuos sólidos antes del lavado de piletas",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Retirar residuos sólidos de la pileta antes de aplicar detergente.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Verificar disponibilidad de jabón y elementos de higiene de manos",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.MEDIA,
            "descripcion": "Verificar que la pileta cuente con jabón y elementos necesarios para la higiene de manos.",
            "foto_obligatoria": False,
            "accion_correctiva": "Reponer jabón o elementos faltantes antes de reanudar las tareas",
        },
        {
            "nombre": "Limpieza semanal profunda de mesadas y piletas",
            "frecuencia": Frecuencia.SEMANAL,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Realizar una limpieza y desinfección profunda de mesadas y piletas.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Completar registro de limpieza de mesadas, piletas y útiles",
            "frecuencia": Frecuencia.DIARIA,
            "prioridad": Prioridad.BAJA,
            "descripcion": "Registrar en la planilla correspondiente la limpieza diaria de mesadas, piletas y útiles.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
    ],
}


# Cada tarea es de un solo sector, superficie o equipo (exclusividad a nivel
# de base). Criterio de asignación: si el nombre de la tarea corresponde a una
# superficie/equipo ya sembrado (seed_superficies.py / seed_equipos.py), se usa
# ese; si la tarea es administrativa (planillas, notificaciones) o abarca más
# de una superficie/equipo del plan, se usa el sector al que pertenece el plan.
# (tipo, nombre) -> tipo es "sector" | "superficie" | "equipo"
RELACIONES = {
    "Limpieza de instalaciones - Elaboración": {
        "Limpiar pisos, zócalos, desagües y rejillas": ("superficie", "Paredes, techo, piso y zócalos - Elaboración"),
        "Limpiar paredes, revestimientos y aberturas": ("superficie", "Paredes, techo, piso y zócalos - Elaboración"),
        "Limpiar techos, luces y estructuras aéreas": ("superficie", "Paredes, techo, piso y zócalos - Elaboración"),
        "Limpiar mesadas y útiles de trabajo": ("superficie", "Mesadas y útiles de trabajo - Elaboración"),
        "Limpiar estanterías y armarios": ("superficie", "Estanterías y armarios - Elaboración"),
        "Limpiar piletas de lavado y desinfección de vegetales y huevos": ("sector", "Elaboración"),
        "Limpiar equipos de elaboración (amasadora)": ("equipo", "Amasadora"),
        "Completar y verificar planilla de registro de limpieza preoperacional": ("sector", "Elaboración"),
    },
    "Limpieza cortadora de fiambre": {
        "Limpieza diaria de cortadora": ("equipo", "Cortadora de fiambre"),
        "Limpieza intermedia al cambiar de producto": ("equipo", "Cortadora de fiambre"),
        "Verificar desconexión de energía eléctrica antes de la limpieza": ("equipo", "Cortadora de fiambre"),
        "Desarmar y limpiar partes desmontables": ("equipo", "Cortadora de fiambre"),
        "Aplicar y verificar acción del desinfectante": ("equipo", "Cortadora de fiambre"),
        "Limpieza semanal profunda de la base y soportes": ("equipo", "Cortadora de fiambre"),
        "Verificar filo y estado de la cuchilla": ("equipo", "Cortadora de fiambre"),
        "Completar registro de limpieza y desinfección": ("equipo", "Cortadora de fiambre"),
    },
    "Limpieza de equipos de frío": {
        "Limpieza diaria de heladeras y vitrinas": ("equipo", "Heladera/vitrina exhibidora"),
        "Limpieza profunda semanal de heladeras": ("equipo", "Heladera/vitrina exhibidora"),
        "Limpieza superficial de cámaras": ("equipo", "Cámara"),
        "Limpieza profunda semanal de cámaras": ("equipo", "Cámara"),
        "Limpieza semanal de freezers": ("equipo", "Freezer"),
        "Verificar temperatura de heladeras y freezers": ("sector", "Equipos de frío"),
        "Limpiar burletes y desagües de cámaras": ("equipo", "Cámara"),
        "Completar planilla de control de temperatura y limpieza": ("sector", "Equipos de frío"),
    },
    "Limpieza de ductos y tuberías": {
        "Limpiar caños, tubos, ductos de ventilación": ("superficie", "Caños, tubos y ductos de ventilación - Depósito"),
        "Retirar mercadería estibada antes de la limpieza de ductos": ("superficie", "Caños, tubos y ductos de ventilación - Depósito"),
        "Repasar rejillas de ventilación con trapo húmedo": ("superficie", "Caños, tubos y ductos de ventilación - Depósito"),
        "Verificar ausencia de acumulación de polvo en ductos": ("superficie", "Caños, tubos y ductos de ventilación - Depósito"),
        "Limpieza mensual de estructuras aéreas del depósito": ("sector", "Depósito"),
        "Verificar funcionamiento de extractores de aire": ("superficie", "Caños, tubos y ductos de ventilación - Depósito"),
        "Completar registro de limpieza de instalaciones del depósito": ("sector", "Depósito"),
        "Inspeccionar ausencia de plagas en ductos y aberturas": ("superficie", "Caños, tubos y ductos de ventilación - Depósito"),
    },
    "Gestión de recipientes de residuos": {
        "Limpiar recipientes de residuos": ("equipo", "Recipientes de residuos"),
        "Retirar y cerrar correctamente las bolsas de residuos": ("equipo", "Recipientes de residuos"),
        "Trasladar y estibar residuos en el depósito de residuos": ("sector", "Depósito"),
        "Lavar y desinfectar guantes utilizados en el manejo de residuos": ("equipo", "Recipientes de residuos"),
        "Verificar cierre correcto de recipientes de residuos": ("equipo", "Recipientes de residuos"),
        "Limpieza semanal profunda de recipientes de residuos": ("equipo", "Recipientes de residuos"),
        "Verificar ausencia de derrames o malos olores en el depósito de residuos": ("sector", "Depósito"),
        "Completar registro de gestión de residuos": ("sector", "Depósito"),
    },
    "Limpieza Salón de ventas": {
        "Limpiar estanterías, estantes, racks": ("superficie", "Estanterías, estantes y racks - Salón de ventas"),
        "Limpiar pisos del salón de ventas": ("sector", "Salón de ventas"),
        "Limpiar vidrieras y mostradores": ("sector", "Salón de ventas"),
        "Limpiar cestos de residuos del salón": ("sector", "Salón de ventas"),
        "Repasar cajas registradoras y mostradores de atención al público": ("sector", "Salón de ventas"),
        "Limpieza mensual de techos y luminarias del salón": ("sector", "Salón de ventas"),
        "Limpiar puertas y aberturas de acceso al salón": ("sector", "Salón de ventas"),
        "Completar registro de limpieza del salón de ventas": ("sector", "Salón de ventas"),
    },
    "Limpieza Fiambrería - Útiles": {
        "Limpiar útiles": ("superficie", "Útiles - Fiambrería"),
        "Desinfectar útiles luego del lavado": ("superficie", "Útiles - Fiambrería"),
        "Secar útiles antes de guardarlos": ("superficie", "Útiles - Fiambrería"),
        "Verificar ausencia de residuos en útiles antes de su uso": ("superficie", "Útiles - Fiambrería"),
        "Almacenar útiles limpios en lugar identificado y protegido": ("superficie", "Útiles - Fiambrería"),
        "Limpieza semanal profunda de útiles (cuchillos, tablas, ganchos)": ("superficie", "Útiles - Fiambrería"),
        "Verificar estado de conservación de tablas y utensilios": ("superficie", "Útiles - Fiambrería"),
        "Completar registro de limpieza de útiles": ("sector", "Fiambrería"),
    },
    "Limpieza Fiambrería - Balanzas": {
        "Limpiar balanzas": ("equipo", "Balanza"),
        "Desinfectar plato de balanza luego de pesar producto crudo": ("equipo", "Balanza"),
        "Verificar calibración de la balanza": ("equipo", "Balanza"),
        "Limpiar base y estructura externa de la balanza": ("equipo", "Balanza"),
        "Retirar residuos de papel y etiquetas adheridas": ("equipo", "Balanza"),
        "Verificar ausencia de humedad en el sistema electrónico": ("equipo", "Balanza"),
        "Completar registro de limpieza de balanzas": ("sector", "Fiambrería"),
        "Notificar desperfectos de la balanza al encargado": ("equipo", "Balanza"),
    },
    "Limpieza Fiambrería - Mesadas de trabajo": {
        "Limpiar mesadas de trabajo": ("superficie", "Mesadas de trabajo - Fiambrería"),
        "Retirar elementos apoyados sobre la mesada antes de limpiar": ("superficie", "Mesadas de trabajo - Fiambrería"),
        "Desinfectar mesada luego de cada cambio de producto": ("superficie", "Mesadas de trabajo - Fiambrería"),
        "Verificar ausencia de residuos antes de reanudar el trabajo": ("superficie", "Mesadas de trabajo - Fiambrería"),
        "Limpieza semanal profunda de bordes y uniones de la mesada": ("superficie", "Mesadas de trabajo - Fiambrería"),
        "Verificar estado de la superficie (grietas, deterioro)": ("superficie", "Mesadas de trabajo - Fiambrería"),
        "Completar registro de limpieza de mesadas": ("sector", "Fiambrería"),
        "Notificar daños en la superficie de la mesada al encargado": ("superficie", "Mesadas de trabajo - Fiambrería"),
    },
    "Limpieza Fiambrería - Piletas de lavado": {
        "Limpiar piletas de lavado": ("superficie", "Piletas de lavado - Fiambrería"),
        "Retirar residuos sólidos antes del lavado": ("superficie", "Piletas de lavado - Fiambrería"),
        "Desinfectar pileta luego del lavado de utensilios": ("superficie", "Piletas de lavado - Fiambrería"),
        "Verificar buen funcionamiento del desagüe": ("superficie", "Piletas de lavado - Fiambrería"),
        "Limpiar grifería y accesorios de la pileta": ("superficie", "Piletas de lavado - Fiambrería"),
        "Verificar disponibilidad de jabón y elementos de higiene de manos": ("superficie", "Piletas de lavado - Fiambrería"),
        "Completar registro de limpieza de piletas": ("sector", "Fiambrería"),
        "Reportar obstrucciones en el desagüe al encargado": ("superficie", "Piletas de lavado - Fiambrería"),
    },
    "Limpieza Rotisería - Cocina": {
        "Limpiar cocina": ("equipo", "Cocina"),
        "Desarmar y limpiar rejillas y hornallas": ("equipo", "Cocina"),
        "Verificar cierre correcto de llaves de gas al finalizar la limpieza": ("equipo", "Cocina"),
        "Limpiar perillas y panel de control de la cocina": ("equipo", "Cocina"),
        "Verificar ausencia de residuos grasos acumulados": ("equipo", "Cocina"),
        "Limpieza profunda mensual de la cocina": ("equipo", "Cocina"),
        "Completar registro de limpieza de la cocina": ("sector", "Rotisería"),
        "Verificar funcionamiento correcto de los quemadores": ("equipo", "Cocina"),
    },
    "Limpieza Rotisería - Horno": {
        "Limpiar horno": ("equipo", "Horno"),
        "Retirar residuos sólidos del horno con trapo": ("equipo", "Horno"),
        "Retirar y lavar rejillas del horno": ("equipo", "Horno"),
        "Enjuagar y secar completamente el horno": ("equipo", "Horno"),
        "Verificar estado de la puerta y burletes del horno": ("equipo", "Horno"),
        "Verificar temperatura de funcionamiento del horno": ("equipo", "Horno"),
        "Completar registro de limpieza del horno": ("sector", "Rotisería"),
        "Notificar desperfectos del horno al encargado": ("equipo", "Horno"),
    },
    "Limpieza Rotisería - Fritador": {
        "Limpiar fritador": ("equipo", "Fritador"),
        "Verificar temperatura del fritador antes de la limpieza": ("equipo", "Fritador"),
        "Eliminar aceite usado en recipiente adecuado": ("equipo", "Fritador"),
        "Desarmar y lavar partes desmontables del fritador": ("equipo", "Fritador"),
        "Secar completamente antes de volver a cargar aceite": ("equipo", "Fritador"),
        "Verificar estado del aceite antes de cada uso": ("equipo", "Fritador"),
        "Completar registro de limpieza del fritador": ("sector", "Rotisería"),
        "Notificar humo u olores anormales durante el uso": ("equipo", "Fritador"),
    },
    "Limpieza Rotisería - Campana y extractor": {
        "Limpiar campana y extractor": ("equipo", "Campana y extractor"),
        "Aplicar desengrasante y enjuagar completamente": ("equipo", "Campana y extractor"),
        "Secar campana y extractor luego de la limpieza": ("equipo", "Campana y extractor"),
        "Verificar y limpiar el filtro del extractor": ("equipo", "Campana y extractor"),
        "Verificar tiraje correcto del extractor": ("equipo", "Campana y extractor"),
        "Limpieza profunda mensual de ductos de extracción": ("equipo", "Campana y extractor"),
        "Completar registro de limpieza de campana y extractor": ("sector", "Rotisería"),
        "Notificar acumulación excesiva de grasa en el filtro": ("equipo", "Campana y extractor"),
    },
    "Limpieza Rotisería - Mesadas y piletas": {
        "Limpiar mesadas de trabajo": ("superficie", "Mesadas de trabajo - Rotisería"),
        "Limpiar piletas de lavado": ("superficie", "Piletas de lavado - Rotisería"),
        "Limpiar útiles": ("sector", "Rotisería"),
        "Desinfectar mesada luego de cada cambio de producto": ("superficie", "Mesadas de trabajo - Rotisería"),
        "Retirar residuos sólidos antes del lavado de piletas": ("superficie", "Piletas de lavado - Rotisería"),
        "Verificar disponibilidad de jabón y elementos de higiene de manos": ("superficie", "Piletas de lavado - Rotisería"),
        "Limpieza semanal profunda de mesadas y piletas": ("sector", "Rotisería"),
        "Completar registro de limpieza de mesadas, piletas y útiles": ("sector", "Rotisería"),
    },
}


def generar_tareas(db) -> list[Tarea]:
    planes = {p.nombre: p for p in db.scalars(select(PlanLimpieza)).all()}
    sectores = {s.nombre: s for s in db.scalars(select(Sector)).all()}
    superficies = {s.nombre: s for s in db.scalars(select(Superficie)).all()}
    equipos = {}
    for e in db.scalars(select(Equipo)).all():
        # "Horno" existe una vez por sector (Elaboración y Rotisería): se
        # desambigua con el sector del equipo.
        equipos[(e.nombre, e.sector_id)] = e

    tareas = []
    for nombre_plan, lista_tareas in TAREAS_POR_PLAN.items():
        plan = planes.get(nombre_plan)
        if not plan:
            continue
        relaciones_plan = RELACIONES.get(nombre_plan, {})
        for datos in lista_tareas:
            tipo, nombre_entidad = relaciones_plan[datos["nombre"]]
            sector_id = superficie_id = equipo_id = None
            if tipo == "sector":
                sector_id = sectores[nombre_entidad].id
            elif tipo == "superficie":
                superficie_id = superficies[nombre_entidad].id
            elif tipo == "equipo":
                sector_del_plan = sectores[SECTOR_DEL_PLAN[nombre_plan]]
                equipo = equipos.get((nombre_entidad, sector_del_plan.id))
                if equipo is None:
                    # fallback: único equipo con ese nombre en toda la base
                    equipo = next(e for (n, _), e in equipos.items() if n == nombre_entidad)
                equipo_id = equipo.id

            tareas.append(
                Tarea(
                    nombre=datos["nombre"],
                    descripcion=datos["descripcion"],
                    frecuencia=datos["frecuencia"],
                    prioridad=datos["prioridad"],
                    foto_obligatoria=datos["foto_obligatoria"],
                    accion_correctiva=datos["accion_correctiva"],
                    procedimiento=datos.get("procedimiento"),
                    plan_limpieza_id=plan.id,
                    sector_id=sector_id,
                    superficie_id=superficie_id,
                    equipo_id=equipo_id,
                )
            )
    return tareas
 
 
def main():
    db = SessionLocal()
    try:
        tareas = generar_tareas(db)
        if not tareas:
            print("No hay planes de limpieza cargados. Correr antes scripts.seed_planes_limpieza.")
            return
 
        db.add_all(tareas)
        db.commit()
 
        print(f"Se insertaron {len(tareas)} tareas.")
    finally:
        db.close()
 
 
if __name__ == "__main__":
    main()
 
