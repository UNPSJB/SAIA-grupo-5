# Resumen de cambios (feature/plan_limpieza)

## Sector
- Módulo nuevo con CRUD completo (`models`, `schemas`, `router`, `services`, `exceptions`, `constants`).
- `nombre` (único), `activo` (baja lógica).
- Relación 1-N con `Equipo` y N-N con `PlanLimpieza` (vía tabla intermedia `sector_plan_limpieza`).

## PlanLimpieza
- CRUD completo.
- `nombre` (obligatorio), `descripcion` (opcional), `activo` (baja lógica).
- `DELETE` es baja lógica si el plan todavía tiene `Tarea`/`Equipo` asociados, chequeo directo por relación (`db_plan.tareas`/`db_plan.equipos`), sin depender de que la base tire una excepción de integridad.
- `GET /planes-limpieza/?sector_id=N`: filtra por sector, vía join contra la relación N-N. La respuesta incluye `sectores: [{id, nombre}]` anidados (el resto de los schemas — create/update/delete — quedan minimal, sin esa lista).

## Tarea
- CRUD completo.
- `nombre`, `descripcion` (opcional), `frecuencia` (obligatoria), `plan_limpieza_id` (FK obligatoria a `PlanLimpieza`).
- `frecuencia`: `Frecuencia(int, Enum)` — valor = cantidad de días entre repeticiones (DIARIA=1, SEMANAL=7, QUINCENAL=15, MENSUAL=30). Columna `Integer` (no `Enum` de SQLAlchemy) para poder usarla directo en cálculos de fecha, con un `CheckConstraint` generado desde el propio enum para no perder la validación en la base.
- `ultima_generacion` (date, nullable): estado operacional — cuándo se generó la última `TareaOcurrencia` para esta tarea (no es parte del snapshot).
- `DELETE` es hard-delete (no tiene `activo`), cuando se mergee con `elemento_limpieza` debería realizarse baja lógica para no perder el historial de consumo del elemento de limpieza.
- `GET /tareas/?plan_id=N`: filtra por plan de limpieza.

## TareaOcurrencia
- CRUD (create, list, get, completar, delete — sin `PUT` genérico).
- Implementa el patrón Memento/Snapshot: copia `tarea_nombre_snap`, `tarea_descripcion_snap`, `frecuencia_snap`, `plan_nombre_snap` al momento de generarse. **Deliberadamente sin FK hacia `Tarea`** — editar o borrar una `Tarea` no afecta ocurrencias ya generadas.
- `operario_id` sin FK real todavía (el modelo `Operario` no existe en el proyecto).
- `PUT /{id}/completar`: setea `operario_id`, `estado=Completada`, `fecha_completado=hoy` (no un update genérico, no tiene sentido editar snapshot libremente).
- `GET /tareas-ocurrencia/pendientes`: lista solo las de `estado=Pendiente`.
- `POST /tareas-ocurrencia/generar-manual`: dispara la generación automática sin esperar al cron (solo para desarrollo — el proyecto no tiene auth todavía, queda abierto igual que el resto de las rutas).

## Generación automática de ocurrencias
- `generar_ocurrencias_pendientes(db)` en `tareas_ocurrencia/services.py`: recorre todas las `Tarea`, compara `(hoy - ultima_generacion).days >= frecuencia` (una sola fórmula sirve para las 4 frecuencias gracias a que `Frecuencia` es numérica), genera la `TareaOcurrencia` correspondiente y actualiza `ultima_generacion`. No hace `commit()` — queda a cargo de quien la llama, para que sea testeable sin depender de una sesión ya comiteada.
- `src/scheduler/scheduler.py`: `BackgroundScheduler` de APScheduler, cron diario a las 00:05 (`misfire_grace_time=3600`). Se arranca/apaga en el `lifespan` de `main.py`.
- Dependencias nuevas: `APScheduler==3.11.3`, `tzlocal==5.4.4` (agregadas a `requirements.txt`).
- **Pendiente / a discutir:** no se revisó si el entorno de despliegue real va a correr con múltiples workers — con este approach (scheduler en el mismo proceso), correr `uvicorn --workers > 1` generaría ocurrencias duplicadas. Hoy no encontré ningún indicio de esa configuración en el repo (sin Dockerfile, sin `--workers`), pero conviene confirmarlo antes de producción.

## Equipo
- Se agregaron `sector_id` (FK a `Sector`, nullable) y `plan_limpieza_id` (FK a `PlanLimpieza`, **obligatoria**).
- `sector_id` nullable para no romper equipos sin sector asignado todavía (no hay ruta para asociar equipo↔sector todavía, queda para otra iteración).

## Fix de arranque: import circular entre Sector, Equipo y PlanLimpieza
Al integrar los tres modelos (se referencian entre sí) aparecía `ImportError: cannot import name 'X' from partially initialized module`.
- Se resolvió dejando las referencias cruzadas entre modelos como `TYPE_CHECKING` (solo tipos, no se ejecutan en runtime — ver nota abajo).
- `src/all_models.py`: importa los modelos de la app para que SQLAlchemy los registre antes de armar las relaciones. Se importa en `main.py` y en los scripts de `scripts/` que tocan estos modelos.

## Bugs encontrados y corregidos durante el desarrollo
- `sector/services.py`: `crear_sector` hacía `Sector(**Sector.model_dump())` (la clase del modelo, sin `.model_dump()`) en vez de `sector.model_dump()` (el parámetro) — tiraba `AttributeError` en cualquier alta.
- `tarea/services.py`: `listar_tareas` armaba el filtro por `plan_id` en una variable `query`, pero el `return` ejecutaba `select(Tarea)` de cero — el filtro nunca se aplicaba. De paso tenía un `.join(Tarea)` inválido (join de la tabla contra sí misma) que iba a romper apenas se corrigiera lo anterior.

## Scripts de seed
- `seed_planes_limpieza.py` (nuevo): 8 planes de limpieza.
- `seed_tareas.py` (nuevo): ~2-3 tareas por plan, usando los planes ya cargados.
- `seed_tareas_ocurrencia.py` (nuevo): 2 ocurrencias por tarea (una pasada completada, una de hoy pendiente).
- `seed_sectores.py`: ahora asocia 1-3 planes de limpieza a cada sector (relación N-N).
- `seed_equipos.py`: ahora asigna `plan_limpieza_id` (antes rompía por ser obligatoria) y `sector_id` real.
- `seed_all.py` (nuevo): corre todos los scripts de seed en el orden que exigen sus dependencias. Pensado para base vacía.

## Pendiente / fuera de alcance de este PR
- Ruta para asociar equipos existentes a un sector.
- Modelo `ElementoLimpieza` (relación N-N con `Tarea`, comentada en el modelo hasta que se defina).
- Modelo `Operario` (hoy `TareaOcurrencia.operario_id` es una columna simple sin FK real).
- Tests automatizados (el proyecto no tiene pytest configurado todavía).

---

# TYPE_CHECKING 

- `backend/src/equipos/models.py` Es una constante especial de Python que es False al ejecutar el programa, pero True para las herramientas que revisan los tipos de datos.

##### ¿Para qué sirve?
Evita importaciones circulares: Ocurre cuando dos archivos se necesitan mutuamente. Poner los tipos dentro de un bloque if TYPE_CHECKING: rompe ese ciclo.
