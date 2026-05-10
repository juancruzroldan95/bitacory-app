# Frontend Architecture

## Overview

Bitacory's frontend is a React 19 + Vite SPA backed by Convex for real-time data. This document defines the layering rules and conventions that keep the codebase consistent.

## Layer Model

```
┌──────────────────────────────────────────────┐
│  Pages  (src/pages/)                         │
│  Route entry points. Orchestrate hooks,      │
│  handle navigation, render page layout.      │
├──────────────────────────────────────────────┤
│  Components  (src/components/)               │
│  UI building blocks. Consume hooks via       │
│  props or direct hook calls. No Convex API   │
│  imports allowed here.                       │
├──────────────────────────────────────────────┤
│  Hooks  (src/hooks/)                         │
│  One file per backend entity/table.          │
│  The only layer that may import from         │
│  convex/react or @/convex/_generated/api.    │
├──────────────────────────────────────────────┤
│  Convex API  (convex/_generated/)            │
│  Auto-generated from the backend schema.     │
│  Never hand-edited.                          │
└──────────────────────────────────────────────┘
```

## The Core Rule

> **Only `src/hooks/*.ts` files may import from `convex/react` or `@/convex/_generated/api`.**

Pages and components get all their data and mutations through hooks. This enforces a clean separation between UI and data access, makes each layer independently testable, and means you can find every Convex call by looking in one place.

## Hook Conventions

**One file per entity/table.** All queries, mutations, and subscriptions for a given entity live together:

| File | Entity | Exports |
|------|--------|---------|
| `src/hooks/useSessions.ts` | `sessions` table | `useSessions()`, `useSession(sessionId)` |
| `src/hooks/useMessages.ts` | messages (agent) | `useMessages(sessionId)`, `useSendMessage()` |
| `src/hooks/useProfile.ts` | `profiles` table | `useProfile()` |

**Naming:** hook functions are named after the entity they wrap — `useSessions` for the list, `useSession` for a single record. Secondary exports (standalone mutations, etc.) are named by action — `useSendMessage`.

## Hook Reference

### `useSessions()` — [src/hooks/useSessions.ts](../src/hooks/useSessions.ts)
List all sessions for the current user, plus all write mutations.
- `sessions` — live-updating array of sessions, `undefined` while loading
- `createSession(args)` — create a new session, returns `sessionId`
- `renameSession(args)` — rename a session by id
- `deleteSession(args)` — delete a session by id

### `useSession(sessionId)` — [src/hooks/useSessions.ts](../src/hooks/useSessions.ts)
Single session subscription for the chat view.
- `session` — the session document, `undefined` while loading, `null` if not found
- `deleteSession(args)` — delete this session

### `useMessages(sessionId)` — [src/hooks/useMessages.ts](../src/hooks/useMessages.ts)
Streaming message subscription for a session.
- `visibleMessages` — filtered, display-ready messages (excludes failed and empty)
- `isLoading` — true while the first page loads
- `isAgentStreaming` — true while the AI is actively streaming tokens
- `showTypingIndicator` — derived state for the typing indicator UI

### `useSendMessage()` — [src/hooks/useMessages.ts](../src/hooks/useMessages.ts)
Standalone send mutation. Used when a component needs to send a message before it has a message subscription (e.g. `HomeComposer` during session creation).

### `useProfile()` — [src/hooks/useProfile.ts](../src/hooks/useProfile.ts)
Current user's profile data and mutations.

## Data Flow Examples

### Creating and starting a session (HomeComposer)
```
HomeComposer
  → useSessions().createSession({ title })   → sessions.create  (Convex mutation)
  → useSendMessage()({ sessionId, content }) → messages.send    (Convex mutation)
  → navigate("/chat/:sessionId")
```

### Sending a message in an open session (ChatView)
```
ChatView
  → useSession(sessionId)                    → sessions.get     (live subscription)
  → useSendMessage()({ sessionId, content }) → messages.send    (Convex mutation)

MessageList (child)
  → useMessages(sessionId)                   → messages.list    (streaming subscription)
```

## Directory Structure

```
src/
  pages/          # Route entry points (lazy-loaded)
  components/
    chat/         # Chat UI (ChatView, MessageList, HomeComposer, …)
    sidebar/      # Sidebar UI (NavSessions, SessionItem, …)
    ui/           # shadcn/ui primitives
  hooks/          # All Convex data access
  layouts/        # AppLayout, AuthGuard
  routes.tsx      # React Router route config
```
