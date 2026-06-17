# GEMINI.md

This file provides guidance to Gemini, Antigravity, and other AI coding assistants when working with code in this repository.

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
npx vitest convex/functions/sessions.test.ts  # Run a single test file
```

## Architecture

**Bitacory** is a therapeutic journaling assistant. Users write notes in a Tiptap editor and chat with an AI companion (Argentine Spanish) that can reference and propose edits to those notes.

### Stack

- **Frontend:** React 19 + Vite + TypeScript, React Router v7 (object-based routes in `src/routes.tsx`), Tailwind CSS v4, shadcn/ui components, Sonner (toasts), `react-markdown` + `remark-gfm` (AI message rendering), Framer Motion (panel animations)
- **Backend:** Convex — database, auth, real-time subscriptions, file storage
- **AI:** `@convex-dev/agent` wrapping OpenAI `gpt-4o-mini`, `@convex-dev/rag` for hybrid search over session summaries

### Convex backend layout

All backend logic lives in `convex/`:

- `schema.ts` — three app tables: `notes` (userId, title, body, tags, updatedAt, pendingAiEdit), `sessions` (userId, title, agentThreadId, summary, themes), `profiles` (userId, displayName, avatarId). Auth tables from `@convex-dev/auth`.
- `auth.ts` — `convexAuth` with Google + Resend (magic link) providers. Exports `loggedInUser` query.
- `convex.config.ts` — registers `agent` and `rag` Convex components.
- `functions/notes.ts` — CRUD for notes plus `search` (full-text), `getByIds` (internal), `savePendingAiEdit` / `clearPendingAiEdit` for AI-proposed edits.
- `functions/sessions.ts` — CRUD for sessions. Creating a session also creates an agent thread via `@convex-dev/agent`. `remove` schedules `deleteAgentThread` cleanup.
- `functions/messages.ts` — `list` (paginated, uses `listUIMessages` + `syncStreams` for streaming) and `send` (saves user message then schedules `generateResponse`, accepts optional `noteIds`).
- `functions/agent.ts` — `"use node"` file. Defines `therapyAgent` (system prompt in Argentine Spanish). `generateResponse` injects RAG context + attached note contents into the system prompt, then streams with a `proposeNoteEdit` tool. `generateThreadSummary` runs after each response, indexes the session summary into RAG. `deleteAgentThread` cleans up on session removal.
- `functions/profiles.ts` — `get`, `update`, `generateUploadUrl`, `updateAvatar`.

### Auth flow

`@convex-dev/auth` is used — **not** `ConvexProviderWithAuth`. The client wraps with `ConvexAuthProvider`. All server functions call `getAuthUserId(ctx)` from `@convex-dev/auth/server`.

### Frontend layout

```
main.tsx → ConvexAuthProvider + BrowserRouter → App.tsx → routes
  /                   → redirect to /notes
  /auth/login         → LoginPage (unauthenticated)
  /* (authenticated)  → AuthGuard → AppLayout (sidebar + <Outlet>)
      /notes          → NotesPage (list of notes)
      /notes/:noteId  → NoteEditorPage (Tiptap editor for a single note)
      /chat           → SessionsPage (session list)
      /chat/:sessionId → SessionPage → ChatView (individual chat session)
```

### Custom hooks

All domain logic is encapsulated in `src/hooks/` — no direct `api.*` imports in components or pages.

- `useSessions.ts` — exports `useSessions` (list + create/rename/delete) and `useSession` (single session)
- `useMessages.ts` — paginated history + live streaming via `useUIMessages`; `send` accepts optional `noteIds`
- `useNotes.ts` — exports `useNotes` (list + create/update/remove) and `useNote` (single note + AI edit ops)
- `useProfile.ts` — profile query + update/avatar upload mutations
- `useResolvedTheme.ts` — resolves `"system"` to `"dark"` or `"light"` via `matchMedia`

### Note @mentions and AI edits

The `MessageComposer` in `ChatView` supports `@note` mentions (autocomplete from the notes list). Mentioned notes are passed as `noteIds` to `messages.send`, which forwards them to `generateResponse`. The agent injects the note bodies into its system prompt and may call `proposeNoteEdit` when asked. The proposed edit is saved to `notes.pendingAiEdit`; the `NoteEditorPage` shows an accept/reject banner.

### Message streaming

`messages.list` accepts `streamArgs` (typed with `vStreamArgs`) and returns paginated history plus live stream deltas via `syncStreams`. The frontend subscribes via `useUIMessages`, so in-progress AI responses render token-by-token.

### Testing

Vitest is configured with two projects (`vitest.config.ts`):

- `convex` — runs `convex/**/*.test.ts` in `edge-runtime`; uses `convex-test` with identity mocking to test auth-gated mutations
- `frontend` — runs all other test files in `jsdom`

## Skills

Project-scoped skills live in `.gemini/skills/`. Always check this directory before doing independent research on a topic covered by a skill. Read the `SKILL.md` inside each skill directory for a quick reference, and the `rules/` subdirectory for detailed rule files with code examples.

Available skills:

| Skill | Description |
|---|---|
| `vercel-react-best-practices` | 70 React/Vite performance rules from Vercel Engineering (bundle splitting, re-render optimization, event listeners, etc.) |
| `convex` | Convex general usage patterns |
| `convex-create-component` | How to create a Convex component |
| `convex-migration-helper` | Data migration patterns for Convex |
| `convex-performance-audit` | Convex query/mutation performance audit rules |
| `convex-quickstart` | Convex project bootstrapping |
| `convex-setup-auth` | Auth setup with `@convex-dev/auth` |
| `web-design-guidelines` | UI/UX design best practices |
