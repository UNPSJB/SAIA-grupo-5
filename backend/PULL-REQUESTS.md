# Resumen de cambios (feature/plan_limpieza)

## Sector
- Módulo nuevo con CRUD completo (`models`, `schemas`, `router`, `services`, `exceptions`, `constants`).
- `nombre` (único), `activo` (baja lógica).
- Relaciones: 1-N con `Equipo`, N-N con `PlanLimpieza` (tabla intermedia `sector_plan_limpieza`) y N-N con `Superficie` (tabla intermedia `sector_superficie`).

## Superficie
- Módulo nuevo, mismo patrón CRUD que `Sector`.
- `nombre` (único), `tipo_contacto` (string libre, sin enum ni validación asociada), `activo`.
- Relaciones: N-N con `Sector` (`sector_superficie`) y N-N con `PlanLimpieza` (`superficie_plan_limpieza`).

## PlanLimpieza
- CRUD completo.
- `nombre` (obligatorio), `descripcion` (opcional), `activo` (baja lógica).
- Relaciones: N-N con `Sector`, N-N con `Superficie`, 1-N con `Tarea`, 1-N con `Equipo`.
- `DELETE` es baja lógica si el plan todavía tiene `Tarea`/`Equipo` asociados, chequeo directo por relación (`db_plan.tareas`/`db_plan.equipos`), sin depender de que la base tire una excepción de integridad.
- `GET /planes-limpieza/?sector_id=N`: filtra por sector, vía join contra la relación N-N. La respuesta incluye `sectores: [{id, nombre}]` anidados (el resto de los schemas — create/update/delete — quedan minimal, sin esa lista).

## Tarea
- CRUD completo.
- Atributos: `nombre`, `descripcion` (opcional), `frecuencia` (obligatoria), `prioridad` (enum alta/media/baja), `foto_obligatoria` (bool), `accion_correctiva` (texto opcional), `plan_limpieza_id` (FK obligatoria a `PlanLimpieza`), `activo` (baja lógica).
- `frecuencia`: `Frecuencia(int, Enum)` — valor = cantidad de días entre repeticiones (DIARIA=1, SEMANAL=7, QUINCENAL=15, MENSUAL=30). Columna `Integer` (no `Enum` de SQLAlchemy) para poder usarla directo en cálculos de fecha, con un `CheckConstraint` generado desde el propio enum para no perder la validación en la base.
- `ultima_generacion` (date, nullable): estado operacional — cuándo se generó la última `TareaOcurrencia` para esta tarea (no es parte del snapshot).
- `DELETE` es baja lógica (no hard-delete).
- `GET /tareas/?plan_id=N`: filtra por plan de limpieza.

## TareaOcurrencia
- CRUD (create, list, get, completar, delete — sin `PUT` genérico).
- Implementa el patrón Memento/Snapshot: copia `tarea_nombre_snap`, `tarea_descripcion_snap`, `frecuencia_snap`, `prioridad_snap`, `foto_obligatoria_snap`, `accion_correctiva_snap` y `plan_nombre_snap` al momento de generarse. **Deliberadamente sin FK hacia `Tarea`** — editar o borrar una `Tarea` no afecta ocurrencias ya generadas.
- `operario_id` sin FK real todavía (el modelo `Operario` no existe en el proyecto).
- `PUT /{id}/completar`: setea `operario_id`, `estado=Completada`, `fecha_completado=hoy` (no un update genérico, no tiene sentido editar snapshot libremente).
- `GET /tareas-ocurrencia/pendientes`: lista solo las de `estado=Pendiente`.
- `POST /tareas-ocurrencia/generar-manual`: dispara la generación automática sin esperar al cron (solo para desarrollo — el proyecto no tiene auth todavía, queda abierto igual que el resto de las rutas).
- Se agregaron `tarea_id_origen`/`plan_id_origen` (Integer plano, sin FK ni relationship a propósito — son de correlación, no de integridad referencial) para poder cruzar contra la `Tarea` viva sin romper el desacople del historial.

## Checklist del día
- `GET /planes-limpieza/{plan_id}/checklist?fecha=` (nested route, tiene sentido acá porque el checklist es inherentemente de un plan puntual): es un **query directo** sobre `TareaOcurrencia` (`plan_id_origen == plan_id AND fecha == fecha`) — devuelve `list[TareaOcurrenciaResponse]`, el mismo schema que se usa para historial. No arma items "virtuales" en memoria ni existe un schema `ChecklistItem` separado.
- Esto es posible porque la generación es proactiva (ver abajo) — para cuando se pide el checklist, la ocurrencia del día ya debería existir. Si una `Tarea` se creó por una vía que no pasó por el hook, ese día no va a aparecer en el checklist — limitación conocida y aceptada, no resuelta acá.
- Valida que el `plan_id` exista (`leer_plan_limpieza`) antes de armar el checklist — 404 si no, en vez de devolver `[]` silenciosamente (consistente con `GET /planes-limpieza/{id}`, a diferencia de los filtros por query param como `sector_id`, que sí devuelven lista vacía para un id inexistente).

## Generación automática de ocurrencias
- `generar_ocurrencias_pendientes(db)` en `tareas_ocurrencia/services.py`: recorre las `Tarea` con `activo=True` (una tarea dada de baja deja de generar ocurrencias nuevas), compara `(hoy - ultima_generacion).days >= frecuencia` (una sola fórmula sirve para las 4 frecuencias gracias a que `Frecuencia` es numérica), genera la `TareaOcurrencia` correspondiente y actualiza `ultima_generacion`. Es idempotente (correrla más de una vez el mismo día no duplica). No hace `commit()` — queda a cargo de quien la llama.
- Cada `Tarea` del loop corre en su propio `try/except`: si falla la generación de una tarea puntual, se loguea (`logger.exception`) y se sigue con las demás, en vez de cortar toda la corrida.
- Se dispara de forma síncrona al final de `crear_tarea` y `modificar_tarea` (en `tarea/services.py`), no solo desde el cron — dado el volumen chico del proyecto (decenas de tareas), correrla en el mismo request es aceptable, no hace falta background task. No se enganchó en alta/edición de `PlanLimpieza` ni en "reactivación" de `Tarea`/`PlanLimpieza`: no cambian qué tareas corresponden hoy, y esas dos features de reactivación no existen todavía en el proyecto.
- `src/scheduler/scheduler.py`: `BackgroundScheduler` de APScheduler, cron diario a las **07:00** (`misfire_grace_time=3600`). Se arranca/apaga en el `lifespan` de `main.py`.
- Dependencias nuevas: `APScheduler==3.11.3`, `tzlocal==5.4.4` (agregadas a `requirements.txt`).
- Multi-worker: no es un problema a resolver en este proyecto (corre en un solo proceso/worker).

## Equipo
- Atributos: `nombre`, `categoria`, `ubicacion`, `estado` (bool), `sector_id` (FK a `Sector`, nullable), `plan_limpieza_id` (FK a `PlanLimpieza`, nullable).
- `sector_id` y `plan_limpieza_id` nullable para poder cargar un equipo sin sector o sin plan asignado todavía (no hay ruta dedicada para asociarlos después, queda para otra iteración).

## Fix de arranque: import circular entre Sector, Equipo y PlanLimpieza
Al integrar los tres modelos (se referencian entre sí) aparecía `ImportError: cannot import name 'X' from partially initialized module`.
- Se resolvió dejando las referencias cruzadas entre modelos como `TYPE_CHECKING` (solo tipos, no se ejecutan en runtime — ver nota abajo).
- `src/all_models.py`: importa los modelos de la app para que SQLAlchemy los registre antes de armar las relaciones. Se importa en `main.py` y en los scripts de `scripts/` que tocan estos modelos.

## Scripts de seed
- `seed_planes_limpieza.py`, `seed_sectores.py`, `seed_superficies.py`, `seed_equipos.py`, `seed_tareas.py`, `seed_tareas_ocurrencia.py`: pueblan cada entidad respetando sus relaciones y FKs obligatorias.
- `seed_all.py`: corre todos los scripts en el orden que exigen sus dependencias. Pensado para base vacía.
- Datos de seed reescritos para ser fieles a casos reales de POES (guías de referencia AR/UY) en vez de datos genéricos.

## Frontend
- Pantallas de alta/edición/listado para Sectores, Superficies, Planes de Limpieza y Equipos, siguiendo el mismo patrón entre sí (formulario compartido + página por ruta).
- Sección Tareas con un patrón deliberadamente distinto: selector de plan de limpieza + tabs por frecuencia + tarjetas coloreadas por prioridad; alta/edición vía modal (no páginas separadas) con refresco en vivo (sin recargar la página) en vez de navegación.

## Pendiente / fuera de alcance de este PR
- Modelo `ElementoLimpieza` (relación N-N con `Tarea`, comentada en el modelo hasta que se defina).
- Modelo `Operario` (hoy `TareaOcurrencia.operario_id` es una columna simple sin FK real).
- Tests automatizados (el proyecto no tiene pytest configurado todavía).

---

# TYPE_CHECKING 

- `backend/src/equipos/models.py` Es una constante especial de Python que es False al ejecutar el programa, pero True para las herramientas que revisan los tipos de datos.

##### ¿Para qué sirve?
Evita importaciones circulares: Ocurre cuando dos archivos se necesitan mutuamente. Poner los tipos dentro de un bloque if TYPE_CHECKING: rompe ese ciclo.
