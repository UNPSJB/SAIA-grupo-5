# Autenticación y permisos (backend)

## Resumen

Login con JWT (`PyJWT`, algoritmo `HS256`). No hay un solo rol "admin/operador" — `Persona` tiene dos flags booleanos independientes:

- `operar`: puede operar equipos/tareas.
- `administrar`: puede administrar (crear/editar/borrar entidades, ver el listado de personal, etc.).

Una persona puede tener uno, otro, los dos, o ninguno. El admin por default que se crea al arrancar la app (`admin1` / `admin`, ver `src/lifespan.py`) tiene `administrar=True` pero `operar=False` — **no asumir que "admin" implica "operar"**, son independientes.

## Login: los endpoints de `/auth`

Todo vive en `src/auth/` (`router.py`, `service.py`, `utils.py`, `dependencies.py`, `schemas.py`, `exceptions.py`).

| Endpoint | Qué hace |
|---|---|
| `POST /auth/token` | Login. Recibe usuario/contraseña (form OAuth2 estándar). Devuelve `access_token` en el body y setea el `refresh_token` como cookie httpOnly. |
| `PUT /auth/token` | Renueva el access token usando el refresh token de la cookie, sin pedir contraseña de nuevo. |
| `DELETE /auth/token` | Logout — borra la cookie del refresh token. |
| `GET /auth/validate-user` | Valida el access token actual y devuelve uno nuevo (requiere estar logueado). |

**Access token**: vida corta (`ACCESS_TOKEN_EXPIRE_MINUTES`, en `src/settings.py`), va en el header `Authorization: Bearer <token>` de cada request protegida.

**Refresh token**: vida larga (`REFRESH_TOKEN_EXPIRE_DAYS`), va en cookie httpOnly, solo sirve para pedir un access token nuevo por `PUT /auth/token`.

El payload del token (`sub`) lleva la `Persona` serializada, pero **no es la única fuente de verdad**: en cada request protegida, `get_current_persona` vuelve a buscar la persona en la base por `username` y revalida `persona.activo` — si desactivan a alguien después de emitido el token, ese token deja de servir en la próxima request, no hace falta esperar a que expire.

Contraseñas: hasheadas con `pwdlib` (Argon2 por default, `PasswordHash.recommended()`), nunca en texto plano en la base.

## `SECRET_KEY` / `REFRESH_SECRET_KEY` — configurar antes de correr el proyecto

`src/settings.py` define un fallback si estas variables no están en `.env`:

```python
SECRET_KEY = os.getenv("SECRET_KEY", "saia-dev-secret-key")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY", "saia-dev-refresh-secret-key")
```

**Ese fallback está escrito en el código fuente, público en el repo** — si tu `.env` no define estas dos variables, la app firma todos los tokens con ese string fijo, y cualquiera que haya visto el código puede fabricar un token válido de admin sin loguearse. Por eso cada uno tiene que tener sus propias claves en su `.env` local (el `.env` está en `.gitignore`, no se commitea).

**Cómo generar las tuyas** (parado en `backend/`, con el venv activado):

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Corré ese comando dos veces (una para cada clave — **tienen que ser distintas entre sí**) y agregá el resultado a tu `.env`:

```
SECRET_KEY="<lo que te dio el primer comando>"
REFRESH_SECRET_KEY="<lo que te dio el segundo comando>"
```

Si cambiás estas claves con la app corriendo, cualquier sesión activa (tokens ya emitidos con las claves viejas) deja de ser válida — no pasa nada, simplemente hay que volver a loguearse.

## Las 3 dependencias base (`src/auth/dependencies.py`)

```python
get_current_persona        # está logueado (cualquiera activo) -> devuelve la Persona
tiene_permiso_administrar  # además, persona.administrar == True (si no, 403)
tiene_permiso_operar       # además, persona.operar == True (si no, 403)
```

`tiene_permiso_administrar`/`tiene_permiso_operar` dependen a su vez de `get_current_persona` — primero valida que estés logueado, después el flag puntual.

## `PermissionedRouter`: permiso por default según el método HTTP

Para no repetir `Depends(tiene_permiso_administrar)` a mano en cada endpoint se armó `src/auth/router_base.py`:

```python
class PermissionedRouter(APIRouter):
    """
    GET -> cualquier persona logueada.
    POST/PUT/PATCH/DELETE -> admin.
    """
```

**Uso normal**, en cualquier `router.py`: solo cambiar `APIRouter(...)` por `PermissionedRouter(...)`. El resto del archivo no cambia — no hace falta declarar ningún `Depends()` de permiso en cada función, el router ya lo aplica solo según el método HTTP:

```python
router = PermissionedRouter(prefix="/insumos", tags=["insumos"])

@router.get("/")       # automático: get_current_persona
def read_insumos(db: Session = Depends(get_db)): ...

@router.post("/")      # automático: tiene_permiso_administrar
def create_insumo(insumo: schemas.InsumoCreate, db: Session = Depends(get_db)): ...
```

**Cuando una ruta puntual necesita otra cosa** (la excepción, no la regla), se pisa con `dependencies=[...]` explícito en esa ruta. Un ejemplo de esto esta en: `src/personal/router.py`:

```python
# Excepción a la regla por default: el listado completo también requiere admin
# (en vez del "cualquier logueado" que le tocaría por ser GET).
@router.get("/", response_model=list[schemas.Persona], dependencies=[Depends(tiene_permiso_administrar)])
def read_personas(db: Session = Depends(get_db)):
    ...
```

## Cuando el permiso depende del dato, no solo de quién sos

Hay casos que **no se pueden resolver con un `Depends()` de router** — porque necesitan comparar el usuario logueado contra el recurso puntual que se está pidiendo (vía path param), y `dependencies=[...]` no tiene acceso a eso. El ejemplo real del proyecto es `GET /personal/{persona_id}`: cualquiera puede ver **su propio** registro, pero para ver el de **otra** persona hace falta ser admin.

```python
@router.get("/{persona_id}", response_model=schemas.Persona)
def read_persona(
    persona_id: int,
    db: Session = Depends(get_db),
    current_persona: models.Persona = Depends(get_current_persona),  # necesitamos el valor, no solo el chequeo
):
    if not current_persona.administrar and current_persona.id != persona_id:
        raise PermissionDenied()
    return services.leer_persona(db, persona_id)
```

Este patrón ("propio o admin") sirve de referencia para cualquier caso futuro parecido (ej. una persona editando sus propios datos, o viendo su propio historial de tareas). La clave: declarar `Depends(get_current_persona)` como parámetro de la función (no en el router) para tener el objeto `Persona` disponible y poder comparar `persona_id` contra `current_persona.id` adentro del cuerpo.

## Cómo auditar qué requiere qué

`scripts/audit_permisos.py` recorre las rutas reales de la app y arma una tabla:

```bash
python -m scripts.audit_permisos
```

```
POST     /auth/token                        -> (publico)
GET      /personal/                         -> ['administrar']
GET      /personal/{persona_id}             -> ['logueado (cualquiera)']
GET      /insumos/                          -> ['logueado (cualquiera)']
POST     /insumos/                          -> ['administrar']
...
```

**Punto ciego a tener en cuenta**: el script solo ve las dependencias declaradas (`dependencies=[...]` a nivel router o función). No ve lógica de permisos escrita *adentro* del cuerpo de una función, como el caso de `read_persona` de arriba — ese endpoint aparece como "logueado (cualquiera)" en la tabla, aunque en la práctica también filtra por dueño del recurso. Si agregan un caso similar, conviene dejarlo comentado en el código para que quien lea el router (o la tabla del audit) sepa que hay una regla extra no visible ahí.

## Credenciales de prueba

- **Admin**: `admin1` / `admin` (se crea solo al arrancar la app si no existe, ver `src/lifespan.py` — `operar=False`, `administrar=True`).
- **Operador**: los que carga `scripts/seed_personal.py` (contraseña `password123` para todos, usuario generado con Faker — mirar la tabla `personal` en la base para ver los usernames reales de esa corrida).
