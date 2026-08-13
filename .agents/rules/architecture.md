# Architecture

This document outlines the high-level architectural patterns for our React application, specifically designed for a project utilizing Convex as its backend. It is designed to be scalable, predictable, and easy to maintain as the project grows.

## 1. High-Level File Structure
The repository is organized by feature and technical concern to ensure a clean separation of responsibilities:

```text
/src
├── assets/         # Static assets like images, SVGs, and fonts
├── components/     # Reusable presentational UI components and guards
│   └── ui/         # shadcn/ui primitive components
├── contexts/       # React Context API providers and definitions
├── hooks/          # Custom React hooks (including Convex wrappers)
├── layouts/        # Layout wrappers (App, Auth, Landing)
├── pages/          # Top-level route components representing views
├── types/          # Centralized TypeScript domain definitions
├── utils/          # Pure utility functions and stateless helpers
├── App.tsx         # Global provider tree and app shell
├── config.ts       # Centralized environment variable mapping
├── constants.ts    # Global application constants and enums
├── index.tsx       # Application entry point and baseline configuration
└── routes.tsx      # Centralized routing configuration
```

## 2. Configuration Management

Configuration and secrets are strictly separated from component logic. This ensures that environment changes don't require hunting down variables deep inside component trees.

### Environment Variables (`config.ts`)
Instead of accessing `import.meta.env.*` (or `process.env`) directly inside components, all environment variables are mapped to typed configuration objects in `src/config.ts`. 
- **Benefit**: This centralizes all environment checks. If an environment variable name changes, or if you need to add fallback values, you only update it in one single file.
- **Pattern**: A `firebaseConfig` or `auth0Config` object explicitly maps external keys securely.

### Application Constants (`constants.ts`)
Hardcoded values, layout enums, magic strings, and color palettes are kept in `src/constants.ts`.
- **Benefit**: Prevents typos across the app and ensures UI consistency (e.g., using `BS_THEME.LIGHT` instead of the magic string `"light"`).

## 3. Routing and Layouts

The application employs a routing structure based on lazy loading and layout wrapping to optimize performance and enforce structural consistency.

### Lazy Loading Pages
Pages are not imported synchronously at the top of the routes file. Instead, they are lazily loaded using a dynamic import strategy (e.g., `@loadable/component` or `React.lazy`). This ensures that the browser only downloads the JavaScript bundle for a specific page when the user navigates to it, significantly improving the initial application load time.

### Nested Layout Pattern
Instead of rendering pages directly at the root route level, the application uses specific **Layout Components** depending on the application area. We define three primary layouts:
- `AppLayout`: The main application shell (e.g., Sidebar, Navbar) for authenticated users.
- `AuthLayout`: A minimal UI shell for authentication pages (Login, Register).
- `LandingLayout`: A dedicated shell for public-facing marketing or landing pages.
- **Pages** are passed as `children` (or rendered via `<Outlet />`) inside these layouts. This prevents redundant code across pages and ensures a seamless transition when navigating between pages that share the same layout.

## 4. State Management

This project strictly separates UI/Application state from Server/Data state, removing the need for redundant client-side state management libraries like Redux.

### Server State: Convex Architecture
Because Convex provides a real-time, reactive backend, it handles server state for us.
- **Data Fetching & Mutations**: Convex's built-in capabilities replace traditional API polling or massive client-side caches.
- **Strict Separation**: We treat the Convex backend as the single source of truth for persistent data.

### Client UI State: Context API & Local State
- **Context API (`src/contexts/`)**: Used exclusively for static or slowly-changing global UI state. Examples include Theme (Light/Dark mode) or global layout settings.
  - **Pattern**: A Context object is created, managed by a Provider component, and accessed via a custom hook.
- **Local State (`useState`)**: Used for transient UI state localized to a specific component.

## 5. Authentication & Guards

Authentication is handled via a specialized Provider and Guard architecture to securely manage user sessions and protect private routes.

### Route Guards (`src/components/guards/`)
Instead of checking if a user is authenticated inside every single page component, we use **Guard Components** (e.g., `<AuthGuard>`).
- A Guard acts as a Higher-Order Component (HOC) or layout wrapper in the routing configuration.
- If a user attempts to access a protected route without being authenticated, the Guard intercepts the render and redirects them to the login page.
- This keeps pages purely focused on displaying content rather than verifying permissions.

## 6. App Initialization & Provider Tree

The root of the application cleanly separates the absolute baseline configuration from the React dependency tree.

### Entry Point (`index.tsx`)
This file acts as the absolute baseline configuration. It mounts the React 18 root to the DOM, imports global styling (SCSS), vendor scripts, and sets up the base `BrowserRouter`.

### Global Provider Tree (`App.tsx`)
This component acts as the **App Shell**. It is responsible for building the dependency tree required by the rest of the application.
- **Nested Providers**: It stacks all global contexts (e.g., `ConvexProvider`, `HelmetProvider`, `ThemeProvider`, `AuthProvider`). This is a classic React pattern for injecting dependency contexts down the component tree.
- **Suspense Boundary**: It wraps the application in a `Suspense` boundary with a global `Loader` fallback. This catches any lazy-loaded routes and displays a loading spinner while the chunk is downloaded.
- **Route Consumer**: It consumes the route configuration array using `useRoutes` and renders the resulting component tree at the bottom of the provider stack.

## 7. Internationalization (i18n)

The architecture supports a scalable internationalization pattern, even if not immediately implemented across all views.

### Global i18n Instance
A dedicated `src/i18n.ts` file is configured (e.g., using `i18next` and `react-i18next`). It initializes a global translation instance.
- **Provider Injection**: By importing this directly into `App.tsx` (or injecting its provider), the entire React tree gains access to translation context.
- **Usage Pattern**: UI components avoid hardcoded strings. Instead, they use hooks like `const { t } = useTranslation();` and render `{t('Welcome back')}`, ensuring the UI is ready for multi-language support from day one.
