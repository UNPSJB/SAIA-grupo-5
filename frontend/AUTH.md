# Autenticación y permisos (frontend)

Ver también `backend/AUTH.md` para cómo funciona del lado del servidor (tokens, endpoints de `/auth`, los flags `operar`/`administrar`).

## Resumen

El access token vive **solo en memoria** (estado de React), nunca en `localStorage`/`sessionStorage` — se pierde al recargar la página a propósito, y se recupera automáticamente al arrancar usando el refresh token, que vive en una cookie httpOnly que maneja el browser (el JS de la app nunca la toca directamente). Igual que en el backend, no hay un solo rol: `currentUser.administrar` y `currentUser.operar` son dos flags independientes.

## `AuthContext` / `useAuth`

- `frontend/src/context/AuthContext.tsx` — el `AuthProvider` que guarda el estado real.
- `frontend/src/hooks/useAuth.ts` — hook que expone ese contexto (tira error si se usa fuera del provider).

Lo que expone:

```ts
interface AuthContextType {
    currentUser: User | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (loginData: LoginData) => Promise<boolean>;
    logout: () => Promise<void>;
    api: AxiosInstance;   // cliente axios ya con los interceptors de auth aplicados
}
```

El access token en sí **no se expone** en el contexto — es estado interno del provider. Todo lo que necesita autenticar requests usa `api` (el cliente axios que devuelve el contexto), no arma el header a mano.

## Login

`frontend/src/feature/auth/Login.tsx` es solo el formulario (usuario/contraseña) — llama a `login()` del contexto y no sabe nada de tokens. La lógica real está en `AuthContext.login`:

- `POST {API}/auth/token` con `FormData` (username, password) y `withCredentials: true` (para que el browser acepte la cookie del refresh token que devuelve el backend).
- Guarda el `access_token` de la respuesta en estado (memoria).
- Busca los datos completos del usuario (`GET /personal/{user_id}`) y los guarda en `currentUser`.
- `Login.tsx` redirige a `/` solo porque re-renderiza cuando `isAuthenticated` pasa a `true` (`<Navigate to="/" replace />`), no hay un `navigate()` explícito.

## Persistencia de sesión (F5 / cerrar y volver a abrir)

Como el access token vive en memoria, al recargar la página se pierde — pero `AuthProvider` corre esto al montar:

```ts
useEffect(() => {
  const validateUser = async () => {
    const res = await api.get('/auth/validate-user', { withCredentials: true });
    setToken(res.data.access_token);
    await fetchCurrentUser(res.data.user_id, res.data.access_token);
  };
  validateUser();
}, []);
```

Esto funciona porque la cookie httpOnly del refresh token se manda sola con `withCredentials: true` — si es válida, el backend devuelve un access token nuevo y la sesión sigue sin pedir contraseña de nuevo. Si falla (cookie vencida o inexistente), queda `isAuthenticated: false` y el usuario termina en el login.

## Cliente HTTP e interceptors

- `frontend/src/libs/axios.ts` — instancia base de axios (`baseURL`, `withCredentials: true`), sin lógica de auth.
- Los interceptors se agregan **dentro de `AuthContext.tsx`** (no en `axios.ts`), porque necesitan acceso al estado `token` actual:
  - **Request**: agrega `Authorization: Bearer {token}` a cada request (salvo login/refresh).
  - **Response**: si una request da `401`/`403` y todavía no se reintentó, llama a `PUT /auth/token` (refresh, usando la cookie), actualiza el token y reintenta la request original **una sola vez** (flag `_retry` evita loops). Si el refresh también falla, limpia la sesión (equivale a un logout).

## Protección de rutas: dos capas

**`frontend/src/layouts/AuthLayout.tsx`** — el gate general. Si `!isAuthenticated`, redirige a `/iniciar-sesion`. Se usa una sola vez, envolviendo todo el árbol de rutas autenticadas.

**`frontend/src/components/ProtectedRoute.tsx`** — gate más fino, para sub-árboles puntuales. Hoy solo se usa la prop `requireAdmin`:

```tsx
if (requireAdmin && !currentUser?.administrar) {
    return <Navigate to="/no-autorizado" replace />;
}
```

**Importante:** `requireAdmin` chequea únicamente `administrar`. `operar` no gatea ninguna ruta hoy — solo se usa para mostrar/ocultar cosas en la UI (ver abajo). Si en algún momento necesitan una ruta que requiera `operar`, `ProtectedRoute` no lo soporta todavía, habría que agregarle esa prop.

(`ProtectedRoute` también acepta `allowedRoles` para chequear por `currentUser.role_name`, pero no se usa en ningún lado del router actual — quedó ahí sin uso, no asuman que está activo en alguna ruta.)

### Cómo se combinan en la práctica (`frontend/src/router.tsx`)

```tsx
{
  element: <AuthLayout />,              // hay que estar logueado para entrar acá
  children: [{
    path: '/',
    element: <App />,                   // Nav + <Outlet/>
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'equipos',
        children: [
          { index: true, element: <EquiposPage /> },              // cualquier logueado ve la lista
          {
            element: <ProtectedRoute requireAdmin />,               // solo admin
            children: [
              { path: 'new', element: <NuevoEquipoPage /> },
              { path: ':id/edit', element: <EditarEquipoPage /> },
            ],
          },
        ],
      },
      {
        path: 'personal',
        element: <ProtectedRoute requireAdmin />,                   // TODO el módulo, incluido el listado
        children: [
          { index: true, element: <PersonalListPage /> },
          { path: 'new', element: <NuevaPersonaPage /> },
          { path: ':id/edit', element: <EditarPersonaPage /> },
        ],
      },
    ],
  }],
}
```

`equipos`/`insumos` siguen el mismo patrón (lista abierta a cualquier logueado, `new`/`edit` protegidos). `personal` gatea el módulo entero, incluido el listado — coincide con el backend, donde `GET /personal/` también exige `administrar` (ver `backend/AUTH.md`).

Para un módulo nuevo: si toda la escritura es admin-only y la lectura es para cualquier logueado (el caso más común), copiar el patrón de `equipos`/`insumos`. Si el módulo entero es admin-only, copiar el patrón de `personal`.

## Mostrar/ocultar cosas en la UI

Con `useAuth()` y `currentUser?.administrar` / `currentUser?.operar`, no con rutas:

```tsx
// Nav.tsx — link a "Personal" solo visible para admins
{currentUser?.administrar && (
  <BSNav.Link as={NavLink} to="/personal">Personal</BSNav.Link>
)}
```

```tsx
// Equipos/pages/ListPage.tsx (mismo patrón en Insumos) — columna de acciones y botón "Nuevo" solo para admin
const columns = currentUser?.administrar
    ? [...baseColumns, { name: "Acciones", cell: (row) => (/* Editar/Eliminar */) }]
    : baseColumns;
```

**Ojo con la asimetría**: `operar` hoy solo se usa para mostrar una badge en `Nav.tsx` ("Operario") — no oculta ni muestra ningún botón o columna todavía. No asuman que tiene el mismo peso que `administrar` en la UI actual.

## Logout

```ts
const logout = async () => {
    try {
        await api.delete('/auth/token', { withCredentials: true }); // le pide al backend que invalide el refresh
    } finally {
        setToken(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
    }
};
```

Limpia la sesión en el frontend **aunque falle** la llamada al backend. No hay un `navigate()` explícito después — `AuthLayout` redirige solo en el próximo render, al ver `isAuthenticated: false`. Se dispara desde el botón de logout en `Nav.tsx`.
