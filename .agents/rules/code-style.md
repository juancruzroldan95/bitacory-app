# Code Style and Guidelines

This document outlines the coding standards, folder structure, and component design patterns to maintain consistency and scalability across the repository.

## 1. Custom Hooks & Convex Data Integration

We rely heavily on custom hooks to abstract complex logic out of our React components.

### Convex Data (Strict Rule)
- **Every** `api.functions.*` interaction must be wrapped in a custom hook inside the `/hooks` folder. It is strictly forbidden to import Convex hooks (like `useQuery` or `useMutation`) directly into UI components or pages. 
- **Why**: This abstracts the backend contract. Components should simply call `const { data } = useMessages()`, keeping them ignorant of the underlying Convex infrastructure, making refactoring and testing infinitely easier.

### Utility Hooks
- React lifecycle logic that doesn't involve the backend should also be isolated in standalone utility hooks.
- **Example**: `useLocalStorage` wraps the browser's `localStorage` API, keeping the `JSON.parse` and `setItem` logic out of the UI components and encapsulating it behind a clean `[value, setValue]` API.

## 2. Component Design (Smart vs. Dumb)

We follow the **Container/Presenter** (or Smart/Dumb) component pattern to cleanly separate data handling from UI rendering.

### "Dumb" (Presentational) Components
- Focus purely on how things look.
- Receive data and callbacks exclusively via `props`.
- Rarely have their own state (except for minor UI state like hover, toggle, or accordion open status).
- Never import Convex hooks or Contexts directly.

### "Smart" (Container) Components
- Focus on how things work (data fetching, state manipulation).
- Import and use custom Convex hooks or Contexts.
- Pass the fetched data down to "Dumb" components as props.
- Keep the JSX minimal, delegating complex rendering to presentational components.

## 3. Styling & UI Components

The project strictly uses **TailwindCSS** paired with **shadcn/ui** for styling and component primitives.
- **TailwindCSS**: Used exclusively for layout, spacing, colors, and responsive design via utility classes. Avoid writing raw CSS/SCSS or using inline styles.
- **shadcn/ui**: Used for accessible, unstyled component primitives (like Dialogs, Selects, Buttons) that are styled with Tailwind. These components are owned by the codebase (typically in `src/components/ui/`) rather than installed as an immutable dependency.

## 4. TypeScript Types (`/types` folder)

To prevent circular dependencies and clutter, TypeScript types must be strictly managed:
- **Centralized Types**: All domain interfaces, API response shapes, and shared application types must be declared in the `/types` directory.
- **Component Props**: Interfaces for component props can remain in the same file as the component if they are specific to that component. If props are shared across multiple files, move them to `/types`.

## 5. Naming Conventions

- **Components & Files**: Use **PascalCase** for React components and their filenames (e.g., `UserProfile.tsx`).
- **Hooks**: Use **camelCase** starting with "use" (e.g., `useTheme.ts`). Notice that hooks are pure logic and must end in `.ts` (pure TypeScript files), never `.tsx`, as they should not return JSX.
- **Constants**: Use **UPPER_SNAKE_CASE** for global constants (e.g., `SIDEBAR_THEME`, `MAX_RETRIES`).
- **Types/Interfaces**: Use **PascalCase** (e.g., `AuthUser`, `MessagePayload`).

## 6. Coding Style and Syntax Patterns

### Arrow Functions for Components
We standardize on using **Arrow Functions** for defining React components and hooks, rather than traditional `function` declarations.
- **Example**: 
  ```tsx
  const UserProfile = ({ user }: Props) => {
    return <div>{user.name}</div>;
  };
  ```
- **Why**: Arrow functions provide a concise syntax, make it easier to type React functional components, and are widely prevalent across this codebase.

### Pure Utility Functions (`/utils`)
Any pure logic that doesn't rely on React hooks or state (e.g., formatting dates, parsing JWT tokens) should be extracted as standalone functions in the `/utils` directory. This makes them easy to test in isolation without a React environment.

## 7. Imports (Relative vs. Absolute)

- **Absolute Imports / Path Aliases**: Preferred for cross-feature imports or importing from standard directories like `src/components` or `src/types`. Path aliases (e.g., `@/components/Button` or `~/hooks/useTheme`) keep imports clean and prevent messy, fragile paths like `../../../../components/Button`.
- **Relative Imports**: Only use relative imports for files within the same closely-related directory or domain feature (e.g., a component importing a sibling style file or a closely related sub-component like `./ButtonIcon`).

## 8. React Context Pattern

All React Contexts live in `src/contexts/` and follow a strict two-file pattern: the **Context file** defines the shape and default value, and a **hook file** in `src/hooks/` exposes it to consumers. Components must **never** call `useContext` directly — they always go through the hook.

### Step 1 — Create the Context file (`src/contexts/`)

There are two variants depending on whether a meaningful default value exists.

**Variant A — with a default value** (e.g. UI state like theme or sidebar):

```tsx
// src/contexts/ThemeContext.tsx
import React from "react";
import { BS_THEME } from "../constants";

const initialState = {
  bsTheme: BS_THEME.LIGHT,
  setBsTheme: (theme: string) => {},
};

const ThemeContext = React.createContext(initialState);

export default ThemeContext;
```

- Define an `initialState` object that matches the context's full shape (including no-op setters for callbacks).
- Pass `initialState` to `React.createContext()` so TypeScript can infer the type automatically — no explicit generic needed.

**Variant B — with a nullable default** (e.g. auth contexts that *require* a Provider):

```tsx
// src/contexts/JWTContext.tsx
import { createContext } from "react";
import { JWTContextType } from "../types/auth";

const AuthContext = createContext<JWTContextType | null>(null);

export default AuthContext;
```

- Use an explicit generic (`<JWTContextType | null>`) and pass `null` as the default.
- The `null` default signals that this context is meaningless outside its Provider — the hook (Step 2) must guard against it.

### Step 2 — Create the accessor hook (`src/hooks/`)

Every context must be wrapped in a custom hook. This is the **only** way components should access context values.

**For Variant A** (non-nullable default — no guard needed):

```ts
// src/hooks/useTheme.ts
import { useContext } from "react";
import ThemeContext from "../contexts/ThemeContext";

const useTheme = () => useContext(ThemeContext);

export default useTheme;
```

**For Variant B** (nullable default — guard required):

```ts
// src/hooks/useAuth.ts
import { useContext } from "react";
import AuthContext from "../contexts/JWTContext";

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context)
    throw new Error("AuthContext must be placed within AuthProvider");

  return context;
};

export default useAuth;
```

- The `if (!context) throw` guard provides a clear error message when a component is accidentally rendered outside the Provider tree.

### Usage in components

```tsx
// ✅ Correct — consume via the hook
import useTheme from "@/hooks/useTheme";

const MyComponent = () => {
  const { bsTheme, setBsTheme } = useTheme();
  // ...
};

// ❌ Wrong — never import the Context object directly into a component
import ThemeContext from "@/contexts/ThemeContext";
import { useContext } from "react";

const MyComponent = () => {
  const { bsTheme } = useContext(ThemeContext); // forbidden
};
```

### File naming & location summary

| Artifact | Location | Example |
|---|---|---|
| Context object | `src/contexts/FooContext.tsx` | `ThemeContext.tsx` |
| Accessor hook | `src/hooks/useFoo.ts` | `useTheme.ts` |
| Type definition | `src/types/` | `auth.ts` → `JWTContextType` |

## 9. Constants as Plain Objects (not TypeScript `enum`s)

This project uses **plain `UPPER_SNAKE_CASE` object literals** instead of TypeScript `enum`s to define sets of related constants. All constants live in `src/constants.ts`.

```ts
// ✅ Correct — plain object with UPPER_SNAKE_CASE key and name
export const SIDEBAR_THEME = {
  DARK: "dark",
  COLORED: "colored",
  LIGHT: "light",
};

// ❌ Wrong — TypeScript enum
enum SidebarTheme {
  Dark = "dark",
  Colored = "colored",
  Light = "light",
}
```

- **Why**: Plain objects are just JavaScript — they compile to nothing extra, work seamlessly with `typeof` / `keyof` utilities, and are easier to inspect at runtime than TypeScript enums (which generate IIFE wrappers).
- **Usage**: Always reference values through the object (e.g. `SIDEBAR_THEME.DARK`) rather than using the raw magic string `"dark"`. This prevents typos and makes renames a one-line change in `constants.ts`.
- **Dark-mode color palettes** follow the same pattern: `THEME_PALETTE_DARK` spreads `THEME_PALETTE_LIGHT` and overrides only the values that differ, avoiding repetition.

```ts
export const THEME_PALETTE_DARK = {
  ...THEME_PALETTE_LIGHT,   // reuse shared values
  white: "#293042",          // override only what changes
  "gray-100": "#3e4555",
  // ...
};
```

## 10. Route Guard Components

Access control is enforced at the **route configuration level**, not inside individual page components. Guard components (`src/components/guards/`) wrap a layout or page in the route tree and redirect declaratively.

```tsx
// src/components/guards/AuthGuard.tsx
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isInitialized } = useAuth();

  if (isInitialized && !isAuthenticated) {
    return <Navigate to="/auth/sign-in" />;
  }

  return <React.Fragment>{children}</React.Fragment>;
};
```

Guards are applied by **wrapping the layout** element in `routes.tsx`, not the individual child pages:

```tsx
// routes.tsx
{
  path: "private",
  element: (
    <AuthGuard>          // ← guard wraps the layout
      <DashboardLayout />
    </AuthGuard>
  ),
  children: [
    { path: "", element: <ProtectedPage /> },
  ],
}
```

Two guards exist:
| Guard | Redirects when… | Used for |
|---|---|---|
| `AuthGuard` | user is **not** authenticated | Private/dashboard routes |
| `GuestGuard` | user **is** authenticated | Auth pages (Sign In, Sign Up) |

- **Why**: Pages stay focused on rendering content. Auth logic lives in one place, and adding a new protected route is a one-line change in `routes.tsx`.

## 11. Typed Redux Hooks

Never import `useDispatch` or `useSelector` from `react-redux` directly. Use the project's pre-typed wrappers from `src/hooks/` instead — they carry the full `RootState` and `AppDispatch` types automatically.

```ts
// src/hooks/useAppDispatch.ts
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";

const useAppDispatch = () => useDispatch<AppDispatch>();

export default useAppDispatch;
```

```ts
// src/hooks/useAppSelector.ts
import { TypedUseSelectorHook, useSelector } from "react-redux";
import type { RootState } from "../redux/store";

const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default useAppSelector;
```

```ts
// ✅ Correct — use the typed wrappers
import useAppDispatch from "@/hooks/useAppDispatch";
import useAppSelector from "@/hooks/useAppSelector";

const dispatch = useAppDispatch();
const count = useAppSelector((state) => state.counter.value);

// ❌ Wrong — raw Redux hooks lose all type information
import { useDispatch, useSelector } from "react-redux";
```

- **Why**: Without these wrappers, dispatching thunks or reading state requires manual type casts on every call site. The wrappers encode the store shape once so every consumer gets autocomplete and type errors for free.
