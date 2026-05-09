# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start frontend (Vite) + backend (convex dev) in parallel
npm run dev:frontend # Vite only
npm run dev:backend  # Convex only
npm run build        # tsc -b && vite build
npm run lint         # ESLint
npx vitest           # Run all tests
npx vitest --project convex    # Convex backend tests only (edge-runtime)
npx vitest --project frontend  # Frontend tests only (jsdom)
npx vitest convex/functions/threads.test.ts  # Run a single test file
```

## Architecture

**Bitacory** is a therapeutic journaling assistant. Users have chat-style sessions (threads) with an AI companion that responds in Argentine Spanish.

### Stack

- **Frontend:** React 19 + Vite + TypeScript, React Router v7 (object-based routes in `src/routes.tsx`), Tailwind CSS v4, shadcn/ui components, Sonner (toasts), `react-markdown` + `remark-gfm` (AI message rendering)
- **Backend:** Convex — handles database, auth, real-time subscriptions, and file storage
- **AI:** `@convex-dev/agent` component wrapping OpenAI `gpt-4o-mini`, with `@convex-dev/rag` for retrieval

### Convex backend layout

All backend logic lives in `convex/`:

- `schema.ts` — two app tables: `threads` (userId, title, agentThreadId, summary, themes) and `profiles` (userId, displayName, avatarId). Auth tables come from `@convex-dev/auth`.
- `auth.ts` — `convexAuth` with Google + Resend (magic link) providers. Exports `loggedInUser` query.
- `convex.config.ts` — registers `agent` and `rag` Convex components.
- `functions/threads.ts` — CRUD for threads. Creating a thread also creates an agent thread via `createThread` from `@convex-dev/agent`. `remove` schedules `deleteAgentThread` cleanup.
- `functions/messages.ts` — `list` (paginated, uses `listUIMessages` + `syncStreams` for streaming) and `send` (saves the user message then schedules `generateResponse`).
- `functions/agent.ts` — `"use node"` file. Defines the `therapyAgent` (system prompt in Argentine Spanish) and exposes `generateResponse` (streams AI response with `saveStreamDeltas: true`) and `deleteAgentThread`.
- `functions/profiles.ts` — `get` (merged user + profile with avatar URL), `update` (displayName), `generateUploadUrl` (pre-signed avatar upload), `updateAvatar` (store storageId).

### Auth flow

`@convex-dev/auth` is used — **not** the standard `ConvexProviderWithAuth`. The client wraps the app with `ConvexAuthProvider`. All server functions call `getAuthUserId(ctx)` from `@convex-dev/auth/server` (not `ctx.auth.getUserIdentity()`).

### Frontend layout

```
main.tsx → ConvexAuthProvider + BrowserRouter → App.tsx → routes
  /auth/login         → LoginPage (unauthenticated)
  /* (authenticated)  → AuthGuard → AppLayout (sidebar + <Outlet>)
      /chat           → ChatHomePage
      /chat/:threadId → ThreadPage → ChatView
```

`AuthGuard` (`src/AuthGuard.tsx`) redirects unauthenticated users to `/auth/login`. `AppLayout` uses `SidebarProvider` + `AppSidebar` with a full-height scrollable main area.

### Custom hooks

All domain logic is encapsulated in `src/hooks/`:

- `useThread.ts` — query + rename mutation for a single thread
- `useThreadList.ts` — list query + create/remove mutations
- `useMessages.ts` — paginated history + live streaming via `useUIMessages`
- `useProfile.ts` — profile query + update/avatar upload mutations
- `useResolvedTheme.ts` — resolves `"system"` to `"dark"` or `"light"` via `matchMedia`

### Message streaming

The `messages.list` query accepts `streamArgs` (typed with `vStreamArgs`) and returns both paginated history and live stream deltas via `syncStreams`. The frontend subscribes to both via `useUIMessages`, so in-progress AI responses render token-by-token.

### Testing

Vitest is configured with two projects (`vitest.config.ts`):
- `convex` — runs `convex/**/*.test.ts` in `edge-runtime`; uses `convex-test` with identity mocking to test auth-gated mutations
- `frontend` — runs all other test files in `jsdom`
