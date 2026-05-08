# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start frontend (Vite) + backend (convex dev) in parallel
npm run dev:frontend # Vite only
npm run dev:backend  # Convex only
npm run build        # tsc -b && vite build
npm run lint         # ESLint
```

No test suite is configured.

## Architecture

**Bitácora** is a therapeutic journaling assistant. Users have chat-style sessions (threads) with an AI companion that responds in Argentine Spanish.

### Stack

- **Frontend:** React 19 + Vite + TypeScript, React Router v7 (object-based routes in `src/routes.tsx`), Tailwind CSS v4, shadcn/ui components
- **Backend:** Convex — handles database, auth, real-time subscriptions, and file storage
- **AI:** `@convex-dev/agent` component wrapping OpenAI `gpt-4o-mini`, with `@convex-dev/rag` for retrieval

### Convex backend layout

All backend logic lives in `convex/`:

- `schema.ts` — two app tables: `threads` (user sessions) and `profiles`. Auth tables come from `@convex-dev/auth`.
- `auth.ts` — `convexAuth` with Google + Resend (magic link) providers. Exports `loggedInUser` query.
- `convex.config.ts` — registers `agent` and `rag` Convex components.
- `functions/threads.ts` — CRUD for threads. Creating a thread also creates an agent thread via `createThread` from `@convex-dev/agent`.
- `functions/messages.ts` — `list` (paginated, uses `listUIMessages` + `syncStreams` for streaming) and `send` (saves the user message then schedules `generateResponse`).
- `functions/agent.ts` — `"use node"` file. Defines the `therapyAgent` and exposes `generateResponse` (streams AI response with `saveStreamDeltas: true`) and `deleteAgentThread`.

### Auth flow

`@convex-dev/auth` is used — **not** the standard `ConvexProviderWithAuth`. The client wraps the app with `ConvexAuthProvider`. All server functions call `getAuthUserId(ctx)` from `@convex-dev/auth/server` (not `ctx.auth.getUserIdentity()`).

### Frontend layout

```
main.tsx → ConvexAuthProvider + BrowserRouter → App.tsx → routes
  /auth/sign-in       → SignInPage (unauthenticated)
  /* (authenticated)  → AuthGuard → AppLayout (sidebar + <Outlet>)
      /chat           → ChatHomePage
      /chat/:threadId → ThreadPage
```

`AuthGuard` redirects unauthenticated users to `/auth/sign-in`. `AppLayout` uses `SidebarProvider` + `AppSidebar` with a full-height scrollable main area.

### Message streaming

The `messages.list` query accepts `streamArgs` (typed with `vStreamArgs`) and returns both paginated history and live stream deltas via `syncStreams`. The frontend subscribes to both, so in-progress AI responses render token-by-token.
