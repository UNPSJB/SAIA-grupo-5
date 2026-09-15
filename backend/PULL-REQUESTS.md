# Resumen de cambios (feature/plan_limpieza)

## Sector
- Módulo nuevo con CRUD completo (`models`, `schemas`, `router`, `services`, `exceptions`, `constants`).

## PlanLimpieza
- Por ahora solo existe el modelo (`nombre`, `descripcion`, `sector_id`), referenciado desde `Sector.planes`. Le faltaba la columna `id` (primary key), se agregó.

## Equipo
- Se agregó `sector_id` (FK a `sectores.id`, nullable) y la relación `sector`, necesarios para que `Sector.equipos` funcione. Es nullable para no romper la creación de equipos existentes que todavía no tienen sector asignado.

## Fix: la app no levantaba (import circular)
Al integrar `Sector`, `Equipo` y `PlanLimpieza` (se referencian entre sí), aparecía `ImportError: cannot import name 'Sector' from partially initialized module` al arrancar.

- Se resolvió dejando las referencias cruzadas entre modelos como `TYPE_CHECKING` (solo para tipos, no se ejecutan en runtime, ver nota abajo).
- Se agregó `src/all_models.py`: un módulo que importa los 5 modelos de la app para que SQLAlchemy los registre antes de armar las relaciones. Se importa al principio de `main.py` y de los scripts de `scripts/` que tocan estos modelos (`seed_equipos.py`, `seed_sectores.py`).
- Faltaba también `src/plan_limpieza/__init__.py`, se agregó.

## Scripts de seed
- `scripts/seed_sectores.py`: nuevo, carga 15 sectores (tenía un import roto de `UnidadMedida` que no aplicaba a `Sector`, y solo 7 nombres — corregido y ampliado).
- `scripts/seed_equipos.py`: actualizado para importar `all_models` y no romper. **Pendiente:** todavía no asigna `sector_id` real a los equipos generados (quedan sin sector hasta que se haga esa mejora).
---

# TYPE_CHECKING 

- `backend/src/main.py` Es una constante especial de Python que es False al ejecutar el programa, pero True para las herramientas que revisan los tipos de datos.

##### ¿Para qué sirve?
Evita importaciones circulares: Ocurre cuando dos archivos se necesitan mutuamente. Poner los tipos dentro de un bloque if TYPE_CHECKING: rompe ese ciclo.
