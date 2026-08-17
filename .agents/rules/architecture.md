# Arquitectura

Este documento describe los patrones arquitectónicos de alto nivel para la aplicación Bitacory. Está diseñado para ser escalable, predecible y fácil de mantener a medida que el proyecto crece.

## 1. Estructura de carpetas

El repositorio está organizado por feature y responsabilidad técnica para asegurar una separación limpia de incumbencias:

```text
/
├── convex/                                 # Backend completo (Convex)
│   ├── functions/                          # Queries, mutations y actions por dominio
│   │   ├── notes.ts
│   │   ├── sessions.ts
│   │   ├── messages.ts
│   │   ├── agent.ts                        # "use node" — lógica de IA y streaming
│   │   ├── profiles.ts
│   │   └── crons.ts
│   ├── schema.ts                           # Definición de tablas y tipos de Convex
│   ├── auth.ts                             # Configuración de @convex-dev/auth
│   └── convex.config.ts                    # Registro de componentes (agent, rag)
│
└── src/                                    # Frontend (React + Vite)
    ├── assets/                             # Imágenes, SVGs y otros recursos estáticos
    ├── components/                         # Componentes de UI reutilizables
    │   ├── ui/                             # Primitivos de shadcn/ui (Button, Dialog, etc.)
    │   └── guards/                         # AuthGuard, GuestGuard — protección de rutas declarativa
    ├── contexts/                           # Objetos de Context (*Context.tsx) y sus Providers (*Provider.tsx)
    ├── hooks/                              # Custom hooks (accesores de contexto, wrappers de Convex, utilidades)
    ├── layouts/                            # Wrappers de layout (LandingLayout, AuthLayout, AppLayout)
    │   ├── LandingLayout.tsx               # Shell de la landing: Header público + Footer
    │   ├── AuthLayout.tsx                  # Shell mínimo centrado para páginas de auth
    │   └── AppLayout.tsx                   # Shell autenticado: Sidebar + área principal
    ├── pages/                              # Componentes de ruta de nivel superior (vistas)
    │   ├── landing/                        # Páginas de la landing pública
    │   │   └── LandingPage.tsx
    │   ├── auth/                           # Páginas de autenticación
    │   │   └── LoginPage.tsx
    │   └── app/                            # Páginas de la aplicación autenticada
    │       ├── notes/
    │       │   ├── NotesPage.tsx
    │       │   └── NoteEditorPage.tsx
    │       └── chat/
    │           ├── SessionsPage.tsx
    │           └── SessionPage.tsx
    ├── types/                              # Definiciones de tipos TypeScript centralizadas
    ├── utils/                              # Funciones utilitarias puras y helpers sin estado
    ├── App.tsx                             # Árbol de providers global y shell de la app
    ├── config.ts                           # Mapeo de variables de entorno
    ├── constants.ts                        # Constantes globales y enums de la aplicación
    ├── main.tsx                            # Entry point: monta el root de React 19
    └── routes.tsx                          # Configuración de rutas centralizada (React Router v7)
```

## 2. Gestión de configuración

La configuración y los secretos están estrictamente separados de la lógica de los componentes. Esto garantiza que los cambios de entorno no requieran buscar variables dispersas por el árbol de componentes.

### Variables de entorno (`config.ts`)

En lugar de acceder a `import.meta.env.*` directamente dentro de los componentes, todas las variables de entorno se mapean a objetos de configuración tipados en `src/config.ts`.

```ts
// src/config.ts
export const convexConfig = {
  url: import.meta.env.VITE_CONVEX_URL,
};
```

- **Beneficio**: Si cambia el nombre de una variable o necesita un valor de fallback, hay exactamente un único lugar para actualizarlo.

### Constantes de la aplicación (`constants.ts`)

Los valores hardcodeados, enums de layout y magic strings viven en `src/constants.ts`.

```ts
// src/constants.ts
export const THEME = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

export const SIDEBAR = {
  DEFAULT_WIDTH: 260,
} as const;
```

- **Beneficio**: Previene typos en toda la app y garantiza consistencia en la UI.

## 3. Routing y layouts

La aplicación está dividida en **tres zonas de enrutado** completamente independientes, cada una con su propio layout shell. React Router v7 con rutas basadas en objetos orquesta estas zonas de forma declarativa.

### Las tres zonas

```
/              → Zona pública (Landing)
/auth/...      → Zona de autenticación
/app/...       → Zona de la aplicación (autenticada)
```

```
BrowserRouter
└── routes.tsx
    ├── "/"             → LandingLayout → LandingPage
    ├── "/auth"         → AuthLayout (GuestGuard)
    │   └── "/auth/login"   → LoginPage
    └── "/app"          → AppLayout (AuthGuard)
        ├── "/app/notes"           → NotesPage
        ├── "/app/notes/:noteId"   → NoteEditorPage
        ├── "/app/chat"            → SessionsPage
        └── "/app/chat/:sessionId" → SessionPage
```

### Lazy loading de páginas (code splitting)

Las páginas **nunca se importan de forma sincrónica** al inicio del archivo de rutas. Se cargan de forma diferida usando `React.lazy()`, la API nativa de React para code splitting.

Vite divide automáticamente cada `import()` dinámico en un chunk de JavaScript separado. El browser solo descarga el chunk de una página cuando el usuario navega a ella, mejorando significativamente el tiempo de carga inicial.

```tsx
// ✅ Correcto — cada página es un import dinámico → chunk separado
const LandingPage   = lazy(() => import("@/pages/landing/LandingPage").then(m => ({ default: m.LandingPage })));
const LoginPage     = lazy(() => import("@/pages/auth/LoginPage").then(m => ({ default: m.LoginPage })));
const NotesPage     = lazy(() => import("@/pages/app/notes/NotesPage").then(m => ({ default: m.NotesPage })));
const NoteEditorPage = lazy(() => import("@/pages/app/notes/NoteEditorPage").then(m => ({ default: m.NoteEditorPage })));
const SessionsPage  = lazy(() => import("@/pages/app/chat/SessionsPage").then(m => ({ default: m.SessionsPage })));
const SessionPage   = lazy(() => import("@/pages/app/chat/SessionPage").then(m => ({ default: m.SessionPage })));

// ❌ Incorrecto — imports sincrónicos → todo el código va al bundle inicial
import { NotesPage }     from "@/pages/app/notes/NotesPage";
import { NoteEditorPage } from "@/pages/app/notes/NoteEditorPage";
```

**Los layouts y guards se importan sincrónicamente** ya que son necesarios para renderizar cualquier ruta y no tienen peso significativo de bundle.

#### Paths estáticamente analizables

Los import paths deben ser literales explícitos por ruta, nunca construidos dinámicamente a partir de variables. Esto permite que Vite analice el grafo de módulos en build time y trace exactamente qué archivos incluir en cada chunk.

```tsx
// ✅ Correcto — Vite ve cada path como literal
const NotesPage = lazy(() => import("@/pages/app/notes/NotesPage").then(...));

// ❌ Incorrecto — Vite no puede analizar el path, puede ampliar el bundle
const getPage = (name: string) => lazy(() => import(`@/pages/${name}`));
```

#### Boundary de Suspense

El `<Suspense>` en `App.tsx` envuelve el árbol de rutas completo. Cuando el usuario navega a una página nueva, React muestra el fallback de Suspense mientras el chunk se descarga, sin desmontar el layout actual. El shell de la app (Sidebar, layouts) permanece visible durante la navegación.

```tsx
// src/App.tsx
const App = () => {
  const content = useRoutes(routes);
  return (
    <ThemeProvider>
      <Toaster />
      <Suspense fallback={<PageLoader />}>  {/* ← captura todos los lazy chunks */}
        {content}
      </Suspense>
    </ThemeProvider>
  );
};
```

#### Preload on hover

Para rutas de navegación frecuente, se puede disparar la descarga del chunk antes de que el usuario haga click, simplemente al pasar el mouse sobre el link del sidebar:

```tsx
// Preload del chunk de NotesPage cuando el usuario hace hover sobre el link
const preloadNotes = () => import("@/pages/app/notes/NotesPage");

<SidebarLink
  to="/app/notes"
  onMouseEnter={preloadNotes}  // descarga el chunk en hover
>
  Notas
</SidebarLink>
```

### Configuración de rutas (`src/routes.tsx`)

Las rutas se definen como un array de objetos tipados con `RouteObject`. Layouts y guards se importan sincrónicamente; las páginas se definen con `lazy()` al inicio del archivo:

```tsx
// src/routes.tsx
import { lazy, Suspense } from "react";
import { RouteObject, Navigate } from "react-router-dom";
import { LandingLayout } from "@/layouts/LandingLayout";
import { AuthLayout }    from "@/layouts/AuthLayout";
import { AppLayout }     from "@/layouts/AppLayout";
import { AuthGuard }     from "@/components/guards/AuthGuard";
import { GuestGuard }    from "@/components/guards/GuestGuard";

// ── Páginas: lazy-loaded (un chunk por página) ────────────────────────────
const LandingPage    = lazy(() => import("@/pages/landing/LandingPage").then(m => ({ default: m.LandingPage })));
const LoginPage      = lazy(() => import("@/pages/auth/LoginPage").then(m => ({ default: m.LoginPage })));
const NotesPage      = lazy(() => import("@/pages/app/notes/NotesPage").then(m => ({ default: m.NotesPage })));
const NoteEditorPage = lazy(() => import("@/pages/app/notes/NoteEditorPage").then(m => ({ default: m.NoteEditorPage })));
const SessionsPage   = lazy(() => import("@/pages/app/chat/SessionsPage").then(m => ({ default: m.SessionsPage })));
const SessionPage    = lazy(() => import("@/pages/app/chat/SessionPage").then(m => ({ default: m.SessionPage })));
// ─────────────────────────────────────────────────────────────────────────

export const routes: RouteObject[] = [
  // ── Zona 1: Landing pública ──────────────────────────────────────────────
  {
    path: "/",
    element: <LandingLayout />,
    children: [
      { index: true, element: <LandingPage /> },
    ],
  },

  // ── Zona 2: Autenticación ─────────────────────────────────────────────────
  {
    path: "/auth",
    element: (
      <GuestGuard>
        <AuthLayout />
      </GuestGuard>
    ),
    children: [
      { path: "login", element: <LoginPage /> },
    ],
  },

  // ── Zona 3: App autenticada ───────────────────────────────────────────────
  {
    path: "/app",
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/app/notes" replace /> },
      { path: "notes",           element: <NotesPage /> },
      { path: "notes/:noteId",   element: <NoteEditorPage /> },
      { path: "chat",            element: <SessionsPage /> },
      { path: "chat/:sessionId", element: <SessionPage /> },
    ],
  },
];
```

### Los tres layouts

Las páginas **nunca** se renderizan directamente en el nivel raíz de las rutas. Siempre están envueltas por su layout correspondiente, que renderiza las páginas hijas vía `<Outlet />`.

---

#### `LandingLayout` — Zona pública

Shell para la landing page pública. Compone un `Header` de navegación pública y un `Footer`, con `<Outlet />` en el medio para el contenido de cada página. Diseñado para escalar: al agregar nuevas rutas bajo `/`, simplemente se suman como `children` sin modificar el layout.

```tsx
// src/layouts/LandingLayout.tsx
export const LandingLayout = () => (
  <div className="flex min-h-screen flex-col">
    <LandingHeader />
    <main className="flex-1">
      <Outlet />
    </main>
    <LandingFooter />
  </div>
);
```

Rutas actuales bajo este layout:

| Ruta | Componente |
|---|---|
| `/` | `LandingPage` |

Rutas futuras posibles: `/pricing`, `/about`, `/blog`, etc. — solo se agregan como `children` en `routes.tsx`.

---

#### `AuthLayout` — Zona de autenticación

Shell mínimo, centrado, sin distracciones para los formularios de autenticación. Sin sidebar, sin navbar de app. Solo el contenido del formulario centrado en la pantalla.

```tsx
// src/layouts/AuthLayout.tsx
export const AuthLayout = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="w-full max-w-md px-6 py-12">
      <Outlet />
    </div>
  </div>
);
```

Rutas bajo este layout (protegidas por `GuestGuard`):

| Ruta | Componente |
|---|---|
| `/auth/login` | `LoginPage` |

---

#### `AppLayout` — Zona autenticada

Shell completo de la aplicación autenticada. Compone el `Sidebar` de navegación con el área de contenido principal donde se renderizan las páginas vía `<Outlet />`. Protegido por `AuthGuard`.

```tsx
// src/layouts/AppLayout.tsx
export const AppLayout = () => (
  <div className="flex h-screen overflow-hidden bg-background">
    <Sidebar />
    <div className="flex flex-1 flex-col overflow-hidden">
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  </div>
);
```

Rutas bajo este layout (protegidas por `AuthGuard`):

| Ruta | Componente | Descripción |
|---|---|---|
| `/app/notes` | `NotesPage` | Lista de notas del usuario |
| `/app/notes/:noteId` | `NoteEditorPage` | Editor Tiptap de una nota individual |
| `/app/chat` | `SessionsPage` | Lista de sesiones de chat con el agente |
| `/app/chat/:sessionId` | `SessionPage` | Vista de chat individual con streaming |

### Responsabilidades de cada zona

| Zona | Prefijo | Layout | Guard | ¿Sidebar? |
|---|---|---|---|---|
| Landing pública | `/` | `LandingLayout` | — | No |
| Autenticación | `/auth` | `AuthLayout` | `GuestGuard` | No |
| App autenticada | `/app` | `AppLayout` | `AuthGuard` | **Sí** |


## 4. Gestión de estado

El proyecto separa estrictamente el estado de UI del estado del servidor, eliminando la necesidad de librerías de gestión de estado como Redux.

### Estado del servidor: Convex

Convex provee un backend reactivo en tiempo real que actúa como la única fuente de verdad para todos los datos persistentes.

- **Queries**: Suscripciones reactivas. Cuando un dato cambia en la base de datos, todos los componentes suscritos se actualizan automáticamente, sin polling ni caché manual.
- **Mutations**: Escrituras transaccionales a la base de datos.
- **Actions**: Operaciones que pueden llamar a servicios externos (OpenAI, etc.), corren en Node.js con `"use node"`.

**Regla fundamental**: Nunca acceder a `useQuery` o `useMutation` de Convex directamente desde componentes o páginas. Toda interacción con la API de Convex debe estar encapsulada en un custom hook dentro de `src/hooks/`. Ver Code Style — Sección 1.

### Estado de UI global: Context API

La Context API se usa exclusivamente para estado de UI global que cambia lentamente: tema (claro/oscuro), configuración del sidebar, preferencias de layout.

- **Patrón**: Un objeto Context define la forma, y un Provider Component gestiona el estado y renderiza `<Context.Provider>`.
- **Acceso**: Los componentes nunca llaman a `useContext` directamente — siempre acceden a través del custom hook correspondiente.

```tsx
// contexts/ThemeProvider.tsx
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("system");
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Estado de UI local: `useState`

El estado transitorio y con scope de componente (dropdown abierto, hover, toggle de acordeón) usa `useState` directamente y nunca abandona el componente.

### Pirámide de gestión de estado

```
┌─────────────────────────────────────────────────────┐
│  Convex (servidor)                                   │
│  → Datos persistentes, autenticación, IA, streaming  │
├─────────────────────────────────────────────────────┤
│  Context API (global)                                │
│  → Tema, preferencias de UI, configuración de layout │
├─────────────────────────────────────────────────────┤
│  useState (local)                                    │
│  → Estado transitorio de componente                  │
└─────────────────────────────────────────────────────┘
```

## 5. Autenticación y guards

### Flujo de autenticación (Convex Auth)

La autenticación está gestionada por `@convex-dev/auth` — **no** por `ConvexProviderWithAuth`. El árbol de providers envuelve la app con `ConvexAuthProvider`. Los componentes acceden al estado de auth a través de `useConvexAuth()` para el estado (isAuthenticated, isLoading) y `useAuthActions()` para las acciones (signIn, signOut).

Proveedores configurados: Google OAuth + Resend (magic link).

```tsx
// main.tsx
root.render(
  <ConvexAuthProvider client={convex}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ConvexAuthProvider>
);
```

### Route Guards (`src/components/guards/`)

El control de acceso se maneja de forma declarativa a **nivel de la configuración de rutas**, no disperso por los componentes de página individuales. Los Guards son componentes wrapper que evalúan el estado de autenticación actual y redirigen usando `<Navigate />` de React Router cuando no se cumplen los criterios de acceso.

#### `AuthGuard`

Protege rutas privadas de usuarios no autenticados. Si un visitante no autenticado intenta acceder a una ruta protegida, es redirigido automáticamente a `/auth/login`.

```tsx
// src/components/guards/AuthGuard.tsx
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) return <Loader />;

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};
```

**La salvaguarda de `isLoading`**: En la carga inicial, Convex verifica de forma asíncrona el token de sesión existente. Mientras `isLoading` es `true`, el Guard muestra un estado de carga para prevenir redirecciones prematuras (flash-redirects a la pantalla de login) antes de que se resuelva el estado de sesión del usuario.

#### `GuestGuard`

Protege las pantallas públicas de autenticación de usuarios ya autenticados. Si un usuario autenticado navega a la ruta de login, es redirigido de vuelta a `/app/notes`.

```tsx
// src/components/guards/GuestGuard.tsx
const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) return <Loader />;

  if (isAuthenticated) {
    return <Navigate to="/app/notes" replace />;
  }

  return <>{children}</>;
};
```

#### Resumen de guards

| Guard | Condición de redirección | Destino | Uso típico |
|---|---|---|---|
| `AuthGuard` | `!isAuthenticated` | `/auth/login` | Rutas privadas: `/app/*` |
| `GuestGuard` | `isAuthenticated` | `/app/notes` | Rutas de invitado: `/auth/*` |

#### Cómo se aplican los guards en `routes.tsx`

Los guards envuelven el **elemento del layout**, protegiendo así el layout y todas sus rutas hijas anidadas con una sola declaración. Esto ya está ilustrado en detalle en la Sección 3. Ejemplo resumido:

```tsx
// src/routes.tsx

// AuthGuard protege toda la zona /app
{
  path: "/app",
  element: (
    <AuthGuard>
      <AppLayout />
    </AuthGuard>
  ),
  children: [
    { path: "notes", element: <NotesPage /> },
    // ...
  ],
}

// GuestGuard protege toda la zona /auth
{
  path: "/auth",
  element: (
    <GuestGuard>
      <AuthLayout />
    </GuestGuard>
  ),
  children: [
    { path: "login", element: <LoginPage /> },
  ],
}
```

## 6. Inicialización y árbol de providers

### Entry point (`main.tsx`)

La configuración absoluta de base: monta el root de React 19 en el DOM, importa los estilos globales de Tailwind, e inicializa `ConvexAuthProvider` y `BrowserRouter`.

#### Inicializar una sola vez, fuera del componente

El `ConvexReactClient` debe instanciarse **a nivel de módulo**, nunca dentro de un componente. Si se instancia dentro de un componente, se recrea en cada render, abriendo múltiples conexiones WebSocket con el backend.

```tsx
// src/main.tsx
import "./index.css";
import { convexConfig } from "@/config";

// ✅ Correcto — instancia única a nivel de módulo, URL desde config.ts
const convex = new ConvexReactClient(convexConfig.url);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConvexAuthProvider>
  </StrictMode>
);

// ❌ Incorrecto — nueva instancia en cada render
const App = () => {
  const convex = new ConvexReactClient(url); // abre una nueva conexión en cada render
  return <ConvexAuthProvider client={convex}>...</ConvexAuthProvider>;
};
```

La misma regla aplica a cualquier cliente singleton: SDKs de terceros, instancias de Web Workers, etc.

### Árbol de providers global (`App.tsx`)

`App.tsx` construye el árbol de dependencias. Los providers están ordenados de más externo (menos específico) a más interno (más específico):

```tsx
// src/App.tsx
const App = () => {
  const content = useRoutes(routes);
  return (
    <ThemeProvider>       {/* Tema claro/oscuro/sistema */}
      <Toaster />         {/* Sonner — notificaciones toast globales */}
      <Suspense fallback={<Loader />}>
        {content}         {/* Árbol de rutas renderizado */}
      </Suspense>
    </ThemeProvider>
  );
};
```

- `<Suspense>` captura cualquier chunk de ruta cargado con lazy loading y muestra un spinner mientras se descarga.
- `<Toaster />` de Sonner es un componente renderless que habilita las notificaciones globales.

## 7. Backend Convex

El backend vive íntegramente en `convex/`. Convex no impone una arquitectura de capas opinada; la organización es simple: un archivo por dominio dentro de `convex/functions/`.

### Schema (`convex/schema.ts`)

Define todas las tablas de la base de datos y sus tipos. Es la única fuente de verdad para la forma de los datos en el backend.

```
notes     → userId, title, body, tags, updatedAt, pendingAiEdit
sessions  → userId, title, agentThreadId, summary, themes
profiles  → userId, displayName, avatarId, therapySchedule
```

Las tablas de autenticación son generadas automáticamente por `@convex-dev/auth`.

### Organización de funciones

Cada archivo en `convex/functions/` corresponde a un dominio de la aplicación y puede exportar queries, mutations y actions:

| Archivo | Tipo | Responsabilidad |
|---|---|---|
| `notes.ts` | Query, Mutation | CRUD de notas, búsqueda full-text, AI edits pendientes |
| `sessions.ts` | Query, Mutation | CRUD de sesiones, creación de thread del agente |
| `messages.ts` | Query, Mutation | Listado paginado + streaming, envío de mensajes |
| `agent.ts` _(use node)_ | Action, internal | Lógica de IA: generación de respuesta, RAG, propuesta de edits |
| `profiles.ts` | Query, Mutation | Perfil de usuario, avatar, horario terapéutico |
| `crons.ts` | Cron | Generación proactiva de notas basada en horario terapéutico |

### Reglas por tipo de función Convex

- **Queries**: Solo lectura. Se suscriben en tiempo real desde el frontend. No pueden llamar servicios externos.
- **Mutations**: Escrituras a la base de datos. Atómicas y transaccionales.
- **Actions** (`"use node"`): Pueden llamar APIs externas (OpenAI). No tienen acceso directo a la base de datos — se comunican con ella vía `ctx.runQuery` y `ctx.runMutation`.
- **Internal functions** (`internal.*`): Solo accesibles desde otras funciones Convex, nunca desde el cliente.

### Componentes registrados (`convex/convex.config.ts`)

- **`agent`** (`@convex-dev/agent`): Gestión de threads de conversación, historial de mensajes y streaming.
- **`rag`** (`@convex-dev/rag`): Búsqueda híbrida (semántica + full-text) sobre resúmenes de sesiones para contexto del agente.
