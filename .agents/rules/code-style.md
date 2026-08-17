# Estilo de código y guías de desarrollo

Este documento define los estándares de codificación, patrones de diseño de componentes y convenciones para mantener consistencia y escalabilidad en todo el repositorio.

## 1. Custom hooks e integración con Convex

Nos apoyamos fuertemente en custom hooks para abstraer la lógica compleja de los componentes React.

### Datos de Convex (regla estricta)

**Toda** interacción con `api.functions.*` debe estar encapsulada en un custom hook dentro de la carpeta `/hooks`. Está estrictamente prohibido importar hooks de Convex (`useQuery`, `useMutation`, `useAction`) directamente en componentes de UI o páginas.

```ts
// ✅ Correcto — lógica de Convex encapsulada en un hook
// src/hooks/useNotes.ts
export const useNotes = () => {
  const notes = useQuery(api.functions.notes.list);
  const create = useMutation(api.functions.notes.create);
  const remove = useMutation(api.functions.notes.remove);
  return { notes, create, remove };
};

// En el componente:
const { notes, create } = useNotes(); // ✅
```

```ts
// ❌ Incorrecto — importar Convex hooks directamente en un componente
const NotesPage = () => {
  const notes = useQuery(api.functions.notes.list); // ❌ prohibido
};
```

**Por qué**: Esto abstrae el contrato con el backend. Los componentes simplemente llaman a `const { notes } = useNotes()`, manteniéndose ignorantes de la infraestructura de Convex subyacente. Hace el refactoring y los tests infinitamente más fáciles.

### Hooks de utilidad

La lógica de ciclo de vida de React que no involucra al backend también debe aislarse en hooks utilitarios standalone.

- **Ejemplo**: `useLocalStorage` encapsula la API `localStorage` del browser, manteniendo el `JSON.parse` y `setItem` fuera de los componentes de UI y exponiendo una API limpia `[value, setValue]`.

## 2. Diseño de componentes (Smart vs. Dumb)

Seguimos el patrón **Contenedor/Presentador** (o Smart/Dumb) para separar limpiamente el manejo de datos del renderizado de UI.

### Componentes "Dumb" (Presentacionales)

- Se enfocan puramente en **cómo se ven las cosas**.
- Reciben datos y callbacks exclusivamente a través de `props`.
- Raramente tienen estado propio (salvo estado de UI menor como hover, toggle, o un acordeón abierto).
- **Nunca** importan hooks de Convex ni Contextos directamente.

```tsx
// components/NoteCard.tsx — componente dumb
interface NoteCardProps {
  title: string;
  updatedAt: number;
  onDelete: () => void;
}

const NoteCard = ({ title, updatedAt, onDelete }: NoteCardProps) => (
  <div className="rounded-xl border p-4">
    <h3 className="font-medium">{title}</h3>
    <time>{formatDate(updatedAt)}</time>
    <Button variant="ghost" onClick={onDelete}>Eliminar</Button>
  </div>
);
```

### Componentes "Smart" (Contenedores)

- Se enfocan en **cómo funcionan las cosas** (fetching de datos, manipulación de estado).
- Importan y usan custom hooks de Convex o Contextos.
- Pasan los datos obtenidos hacia abajo a los componentes "Dumb" como props.
- Mantienen el JSX mínimo, delegando el renderizado complejo a componentes presentacionales.

```tsx
// pages/NotesPage.tsx — componente smart
const NotesPage = () => {
  const { notes, create, remove } = useNotes();

  return (
    <div>
      {notes?.map((note) => (
        <NoteCard
          key={note._id}
          title={note.title}
          updatedAt={note.updatedAt}
          onDelete={() => remove({ noteId: note._id })}
        />
      ))}
    </div>
  );
};
```

## 3. Estilos y componentes de UI

El proyecto usa **Tailwind CSS v4** combinado con **shadcn/ui** para estilos y primitivos de componentes.

### Tailwind CSS v4

Tailwind se usa exclusivamente para layout, espaciado, colores y diseño responsivo a través de clases de utilidad. Evitar escribir CSS/SCSS custom o usar estilos inline salvo que sea absolutamente necesario.

```tsx
// ✅ Correcto — clases de Tailwind
<div className="flex items-center gap-4 rounded-xl border p-6">

// ❌ Incorrecto — estilos inline o CSS custom en el componente
<div style={{ display: "flex", padding: "24px" }}>
```

### shadcn/ui

shadcn/ui se usa para primitivos de componentes accesibles (Dialogs, Selects, Buttons, etc.). Estos componentes son **propiedad del codebase** (viven en `src/components/ui/`) y pueden modificarse libremente, a diferencia de una dependencia inmutable.

```tsx
// ✅ Correcto — usar primitivos de shadcn/ui
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

// ❌ Incorrecto — crear componentes de UI básicos desde cero
<button className="bg-teal-500 text-white px-4 py-2 rounded">
```

### Sistema de diseño: tokens de Bitacory

El sistema de diseño de Bitacory usa tokens definidos en `src/index.css` siguiendo el sistema de colores OKLCH. Ver `design.md` para la especificación completa del sistema de diseño (paleta, tipografía, elevación, etc.).

## 4. TypeScript: tipos y anotaciones

Para prevenir dependencias circulares y mantener el codebase limpio, los tipos de TypeScript deben gestionarse estrictamente.

### Tipos centralizados (`/types`)

Todos los interfaces de dominio, formas de respuesta de la API y tipos compartidos de la aplicación deben declararse en el directorio `/types`.

```ts
// src/types/notes.ts
export interface NoteWithPendingEdit {
  _id: Id<"notes">;
  title: string;
  body: string;
  pendingAiEdit?: string;
}
```

### Props de componentes

Los interfaces de props pueden permanecer en el mismo archivo que el componente si son específicos de ese componente. Si las props se comparten entre múltiples archivos, moverlas a `/types`.

```tsx
// Bien — props específicas del componente en el mismo archivo
interface NoteCardProps {
  title: string;
  onDelete: () => void;
}
const NoteCard = ({ title, onDelete }: NoteCardProps) => { ... };
```

### Tipos de Convex

Los tipos generados por Convex (`Id<"notes">`, `Doc<"sessions">`, etc.) se importan directamente desde `convex/_generated/dataModel`. No redefinir estos tipos manualmente.

```ts
import type { Id, Doc } from "../../convex/_generated/dataModel";
// o con alias:
import type { Id } from "@convex/_generated/dataModel";
```

## 5. Convenciones de nombres

| Artefacto | Convención | Ejemplo |
|---|---|---|
| Componentes React | PascalCase | `NoteCard.tsx`, `SessionPage.tsx` |
| Hooks | camelCase con prefijo `use` | `useNotes.ts`, `useTheme.ts` |
| Archivos de hooks | `.ts` (sin `.tsx`) | `useNotes.ts` — los hooks no retornan JSX |
| Constantes globales | UPPER_SNAKE_CASE | `MAX_NOTE_LENGTH`, `THEME` |
| Tipos e Interfaces | PascalCase | `AuthUser`, `MessagePayload` |
| Archivos de tipos | camelCase | `notes.ts`, `auth.ts` |
| Archivos de contexto | PascalCase con sufijo `Context` o `Provider` | `ThemeContext.tsx`, `ThemeProvider.tsx` |
| Archivos de utilidad | camelCase | `formatDate.ts`, `cn.ts` |
| Archivos de página | PascalCase con sufijo `Page` | `NotesPage.tsx`, `LoginPage.tsx` |

**Regla clave**: Los hooks son lógica pura y **deben** terminar en `.ts` (nunca `.tsx`), ya que no retornan JSX.

## 6. Estilo de código y patrones de sintaxis

### Arrow functions para componentes

Estandarizamos el uso de **Arrow Functions** para definir componentes React y hooks, en lugar de declaraciones tradicionales `function`.

```tsx
// ✅ Correcto — arrow function
const UserProfile = ({ user }: Props) => {
  return <div>{user.name}</div>;
};

// ❌ Incorrecto — function declaration
function UserProfile({ user }: Props) {
  return <div>{user.name}</div>;
}
```

**Por qué**: Las arrow functions proveen sintaxis concisa, son más fáciles de tipar como componentes funcionales de React, y son el patrón predominante en este codebase.

### Funciones utilitarias puras (`/utils`)

Cualquier lógica pura que no dependa de hooks o estado de React (formatear fechas, generar slugs, manipular strings) debe extraerse como función standalone en el directorio `/utils`. Esto facilita testearlas en aislamiento sin un entorno de React.

```ts
// src/utils/formatDate.ts
export const formatDate = (timestamp: number): string =>
  new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(timestamp);
```

### Exportaciones nombradas sobre exportaciones default

Preferir exportaciones nombradas para mejorar la rastreabilidad del codebase y evitar renombrados accidentales.

```ts
// ✅ Correcto — exportación nombrada
export const useNotes = () => { ... };

// ❌ Evitar — default export (más difícil de rastrear, se puede importar con cualquier nombre)
export default function useNotes() { ... }
```

**Excepción**: Los componentes de página (`pages/`) y layouts pueden usar `export default` si el framework lo requiere, pero los hooks y utilidades siempre usan exportaciones nombradas.

## 7. Imports: relativos vs. absolutos

- **Imports con alias** (`@/`): Preferidos para imports entre features o desde directorios estándar como `src/components`, `src/hooks`, `src/types`. Mantienen los imports limpios y previenen paths frágiles como `../../../../components/Button`.
- **Imports relativos**: Solo para archivos dentro del mismo directorio o domain feature estrechamente relacionado (por ejemplo, un componente importando un sub-componente hermano `./NoteCardActions`).

```ts
// ✅ Correcto — alias para imports cross-feature
import { useNotes } from "@/hooks/useNotes";
import { Button } from "@/components/ui/button";
import type { NoteWithPendingEdit } from "@/types/notes";

// ✅ Correcto — relativo para siblings directos
import { NoteCardActions } from "./NoteCardActions";

// ❌ Incorrecto — paths relativos profundos
import { Button } from "../../../components/ui/button";
```

El alias `@/` debe estar configurado en `tsconfig.app.json` y `vite.config.ts`.

## 8. Patrón de React Context

Todos los contextos de React viven en `src/contexts/` y siguen un patrón estricto de dos archivos: el **archivo de Context** define la forma y el valor por defecto, y el **hook accesor** en `src/hooks/` lo expone a los consumidores. Los componentes **nunca** deben llamar a `useContext` directamente — siempre acceden a través del hook.

### Paso 1 — Crear el archivo de Context (`src/contexts/`)

Existen dos variantes dependiendo de si hay un valor por defecto con sentido.

**Variante A — con valor por defecto** (ej: estado de UI como tema o sidebar):

```tsx
// src/contexts/ThemeContext.tsx
import { createContext } from "react";
import { THEME } from "@/constants";

interface ThemeContextValue {
  theme: string;
  setTheme: (theme: string) => void;
}

const initialState: ThemeContextValue = {
  theme: THEME.SYSTEM,
  setTheme: () => {},
};

const ThemeContext = createContext<ThemeContextValue>(initialState);

export default ThemeContext;
```

- Define un objeto `initialState` que coincide con la forma completa del contexto (incluyendo setters no-op para los callbacks).
- Pásale `initialState` a `createContext()` para que TypeScript infiera el tipo automáticamente — no se necesita un genérico explícito.

**Variante B — con default nullable** (ej: contextos que *requieren* un Provider):

```tsx
// src/contexts/AuthContext.tsx
import { createContext } from "react";
import type { AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | null>(null);

export default AuthContext;
```

- Usa un genérico explícito (`<AuthContextType | null>`) y pasa `null` como default.
- El default `null` señala que este contexto no tiene sentido fuera de su Provider — el hook (Paso 2) debe protegerse contra esto.

### Paso 2 — Crear el hook accesor (`src/hooks/`)

Cada contexto debe estar encapsulado en un custom hook. Esta es la **única** forma en que los componentes deben acceder a los valores del contexto.

**Para Variante A** (default no-nullable — sin guard):

```ts
// src/hooks/useTheme.ts
import { useContext } from "react";
import ThemeContext from "@/contexts/ThemeContext";

export const useTheme = () => useContext(ThemeContext);
```

**Para Variante B** (default nullable — guard requerido):

```ts
// src/hooks/useAuth.ts
import { useContext } from "react";
import AuthContext from "@/contexts/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context)
    throw new Error("AuthContext debe estar dentro de AuthProvider");

  return context;
};
```

- El guard `if (!context) throw` provee un mensaje de error claro cuando un componente se renderiza accidentalmente fuera del árbol del Provider.

### Uso en componentes

```tsx
// ✅ Correcto — acceder a través del hook
import { useTheme } from "@/hooks/useTheme";

const MyComponent = () => {
  const { theme, setTheme } = useTheme();
  // ...
};

// ❌ Incorrecto — nunca importar el Context directamente en un componente
import ThemeContext from "@/contexts/ThemeContext";
import { useContext } from "react";

const MyComponent = () => {
  const { theme } = useContext(ThemeContext); // prohibido
};
```

### Resumen de ubicación de archivos

| Artefacto | Ubicación | Ejemplo |
|---|---|---|
| Objeto Context | `src/contexts/FooContext.tsx` | `ThemeContext.tsx` |
| Hook accesor | `src/hooks/useFoo.ts` | `useTheme.ts` |
| Definición de tipo | `src/types/` | `auth.ts` → `AuthContextType` |

## 9. Constantes como objetos planos (no `enum` de TypeScript)

Este proyecto usa **literales de objeto `UPPER_SNAKE_CASE` planos** en lugar de `enum`s de TypeScript para definir conjuntos de constantes relacionadas. Todas las constantes viven en `src/constants.ts`.

```ts
// ✅ Correcto — objeto plano con clave UPPER_SNAKE_CASE
export const THEME = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

// ❌ Incorrecto — TypeScript enum
enum Theme {
  Light = "light",
  Dark = "dark",
  System = "system",
}
```

**Por qué**: Los objetos planos son JavaScript puro — se compilan sin overhead extra, funcionan perfectamente con los utilities `typeof` / `keyof`, y son más fáciles de inspeccionar en runtime que los enums de TypeScript (que generan wrappers IIFE).

**Uso**: Siempre referenciar los valores a través del objeto (`THEME.DARK`) en lugar de usar el magic string `"dark"`. Esto previene typos y hace que los renombrados sean un cambio de una línea en `constants.ts`.

```ts
// ✅ Correcto
if (theme === THEME.DARK) { ... }

// ❌ Incorrecto — magic string
if (theme === "dark") { ... }
```

## 10. Componentes Guard de rutas

El control de acceso se aplica a **nivel de la configuración de rutas**, no dentro de los componentes de página individuales. Los componentes Guard (`src/components/guards/`) envuelven un layout o página en el árbol de rutas y redirigen de forma declarativa.

```tsx
// src/components/guards/AuthGuard.tsx
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  return <>{children}</>;
};
```

Los guards se aplican **envolviendo el elemento del layout** en `routes.tsx`, no las páginas hijas individuales:

```tsx
// routes.tsx
{
  path: "/",
  element: (
    <AuthGuard>          // ← el guard envuelve el layout
      <AppLayout />
    </AuthGuard>
  ),
  children: [
    { path: "notes", element: <NotesPage /> },
  ],
}
```

Dos guards disponibles:

| Guard | Redirige cuando… | Usado para |
|---|---|---|
| `AuthGuard` | el usuario **no** está autenticado | Rutas privadas/autenticadas |
| `GuestGuard` | el usuario **ya está** autenticado | Páginas de auth (Login) |

**Por qué**: Las páginas se enfocan en renderizar contenido. La lógica de auth vive en un único lugar, y agregar una nueva ruta protegida es un cambio de una línea en `routes.tsx`.
