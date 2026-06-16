# Architecture

## Frontend Layer Model

```
┌──────────────────────────────────────────────┐
│  Pages  (src/pages/)                         │
│  Route entry points. Orchestrate hooks,      │
│  handle navigation, render page layout.      │
├──────────────────────────────────────────────┤
│  Components  (src/components/)               │
│  UI building blocks. Receive data/callbacks  │
│  via props or call hooks directly. No Convex │
│  API imports allowed here.                   │
├──────────────────────────────────────────────┤
│  Hooks  (src/hooks/)                         │
│  One file per backend entity/table.          │
│  The ONLY layer that may import from         │
│  convex/react or @/convex/_generated/api.    │
├──────────────────────────────────────────────┤
│  Convex API  (convex/_generated/)            │
│  Auto-generated. Never hand-edited.          │
└──────────────────────────────────────────────┘
```

**Core rule:** only `src/hooks/*.ts` files may import from `convex/react` or `@/convex/_generated/api`. Pages and components get all data and mutations through hooks.

## Hook Conventions

One file per entity/table. All queries, mutations, and subscriptions for a given entity live together.

| File | Entity | Exports |
|------|--------|---------|
| `src/hooks/useSessions.ts` | `sessions` table | `useSessions()`, `useSession(sessionId)` |
| `src/hooks/useMessages.ts` | messages (agent) | `useMessages(sessionId)`, `useSendMessage()` |
| `src/hooks/useNotes.ts` | `notes` table | `useNotes()`, `useNote(noteId)` |
| `src/hooks/useProfile.ts` | `profiles` table | `useProfile()` |

**Naming:** list hook = entity name (`useSessions`), single-record hook = singular (`useSession`), standalone mutations = action name (`useSendMessage`).

## Data Flow Examples

### Creating and starting a session (HomeComposer)
```
HomeComposer
  → useSessions().createSession({ title })    → sessions.create  (Convex mutation)
  → useSendMessage()({ sessionId, content })  → messages.send    (Convex mutation)
  → navigate("/chat/:sessionId")
```

### Editing a note (NoteEditorPage)
```
NoteEditorPage
  → useNote(noteId)                           → notes.get        (live subscription)
  → useNote().updateNote(...)                 → notes.update     (mutation)
```

### AI note edit proposal flow
```
Agent (server)
  proposeNoteEdit tool → notes.savePendingAiEdit (internal mutation)

NoteEditorPage
  → useNote().note.pendingAiEdit             → accept/reject banner shown
  → useNote().clearPendingAiEdit()           → notes.clearPendingAiEdit (mutation)
  → useNote().updateNote({ body: proposed }) → notes.update (mutation, on accept)
```

## Convex Backend Layout

One file per entity in `convex/functions/`. Functions that call Node.js APIs or the AI SDK live in a separate `"use node"` file.

```
convex/
  schema.ts          # All table definitions + indexes
  auth.ts            # convexAuth providers + loggedInUser query
  convex.config.ts   # Component registrations (agent, rag)
  functions/
    sessions.ts      # Public + internal CRUD for sessions table
    messages.ts      # list (streaming) + send + getMessagesForSummary (internal)
    notes.ts         # Public CRUD + search + internal AI-edit helpers
    profiles.ts      # Profile read/write + avatar storage
    agent.ts         # "use node" — therapyAgent, generateResponse, generateThreadSummary, deleteAgentThread
```

### Public vs. internal functions

- `query` / `mutation` / `action` — callable from the frontend via the generated `api` object.
- `internalQuery` / `internalMutation` / `internalAction` — callable only from other backend functions via `internal`. Use these for anything the client must never call directly (e.g., `savePendingAiEdit`, `getById`, `generateResponse`).

### The `"use node"` boundary

`convex/functions/agent.ts` is the only file with `"use node"`. It holds everything that requires Node.js or the AI SDK (`@convex-dev/agent`, `@ai-sdk/openai`, `ai`). **Never** put `query` or `mutation` in a `"use node"` file — they don't run in that runtime.

### Auth pattern

Every public function that touches user data must start with:
```ts
const userId = await getAuthUserId(ctx);
if (!userId) return []; // or throw new Error("Not authenticated")
```
Never accept a `userId` argument from the client — always derive it server-side.

### Scheduled work

Side effects that shouldn't block the mutation (AI response generation, RAG indexing, agent thread cleanup) are scheduled with `ctx.scheduler.runAfter(0, internal.functions.xxx, args)`. This keeps mutations fast and lets the side effect retry independently.

### Session summary + RAG pipeline

After each AI response, `generateResponse` schedules `generateThreadSummary` (both in `agent.ts`). That action calls `gpt-4o-mini` to extract `{ title, summary, themes }`, patches the session via `sessions.updateSummary`, then indexes the summary text into RAG under the user's namespace. Subsequent `generateResponse` calls search RAG to inject relevant past session context into the system prompt.
