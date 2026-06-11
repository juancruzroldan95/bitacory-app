# Plan: Notes + AI Workspace (Bitacory Refactor)

## Context

Bitacory is currently a ChatGPT-style chat clone. This refactor transforms it into a **journal-first therapeutic workspace**: notes are the primary artifact, the AI is a collaborator invited into notes on demand, and a two-panel split layout gives equal weight to writing and conversation. The existing chat infrastructure (sessions, messages, agent, RAG) is fully preserved — notes are additive.

---

## Architecture Overview

```
AppLayout (sidebar + main)
  Sidebar: NavNotes (new) + NavMain (extended) + NavSessions (unchanged) + NavUser
  Main:
    /notes            → WorkspacePage → NotesIndexPage  (left panel) + GlobalChatPanel (right)
    /notes/:noteId    → WorkspacePage → NoteEditorPage  (left panel) + GlobalChatPanel (right)
    /chat             → HomePage          (unchanged, full-width)
    /chat/:sessionId  → SessionPage       (unchanged, full-width)
```

The workspace always renders both panels. Either can collapse to full-screen via Framer Motion width animation. The right (chat) panel always stays mounted to preserve the `useUIMessages` subscription.

---

## New Dependencies to Install

```
@tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/markdown
framer-motion
```

---

## Phase 1 — Schema + Backend

### 1. `convex/schema.ts`
Add `notes` table to `applicationTables`:

```ts
notes: defineTable({
  userId: v.id("users"),
  title: v.string(),
  body: v.string(),                          // markdown string
  tags: v.optional(v.array(v.string())),     // max 10, enforced in mutation
  updatedAt: v.number(),
  pendingAiEdit: v.optional(v.object({
    proposedBody: v.string(),
    prompt: v.string(),
    generatedAt: v.number(),
  })),
})
  .index("by_user", ["userId"])
  .index("by_user_updatedAt", ["userId", "updatedAt"])
  .searchIndex("search_notes", {
    searchField: "body",
    filterFields: ["userId"],
  }),
```

After editing, run `npx convex dev` to regenerate `_generated/api.d.ts`.

### 2. `convex/functions/notes.ts` — new file

Public queries/mutations following the exact pattern of `sessions.ts`:

| Export | Type | Args | Notes |
|--------|------|------|-------|
| `list` | query | `{}` | ordered by `updatedAt` desc, `take(200)` |
| `get` | query | `{ noteId }` | ownership check, returns null if not owner |
| `search` | query | `{ query: string }` | `withSearchIndex("search_notes")` |
| `getByIds` | internalQuery | `{ noteIds: v.array(v.id("notes")) }` | fetches up to 5 notes for agent context |
| `create` | mutation | `{ title, body, tags? }` | sets `updatedAt: Date.now()` |
| `update` | mutation | `{ noteId, title?, body?, tags? }` | patches + sets `updatedAt` |
| `remove` | mutation | `{ noteId }` | ownership check |
| `savePendingAiEdit` | internalMutation | `{ noteId, proposedBody, prompt }` | called from agent tool |
| `clearPendingAiEdit` | mutation | `{ noteId }` | patches `{ pendingAiEdit: undefined }` |

### 3. `convex/functions/messages.ts`
Extend `send` mutation args:
```ts
noteIds: v.optional(v.array(v.id("notes"))),
```
Pass `noteIds` to `ctx.scheduler.runAfter(0, internal.functions.agent.generateResponse, { ..., noteIds })`.

### 4. `convex/functions/agent.ts`
- Extend `generateResponse` args with `noteIds: v.optional(v.array(v.id("notes")))`.
- After the RAG search, fetch note content:
  ```ts
  let noteContext = "";
  if (args.noteIds?.length) {
    const notes = await ctx.runQuery(internal.functions.notes.getByIds, { noteIds: args.noteIds });
    noteContext = notes.map(n => `## Nota: "${n.title}"\n\n${n.body}`).join("\n\n---\n\n");
  }
  ```
- Update `buildSystemPromptWithMemory` → rename to `buildSystemPrompt(ragText, noteContext)`, appending notes context block if present.
- Register `proposeNoteEdit` tool inline in the `streamText` call:
  ```ts
  tools: {
    proposeNoteEdit: {
      description: "Propone una reescritura completa de una nota. Usá SOLO cuando el usuario lo pida explícitamente.",
      parameters: z.object({
        noteId: z.string(),
        proposedBody: z.string(),
        prompt: z.string(),
      }),
      execute: async ({ noteId, proposedBody, prompt }) => {
        await ctx.runMutation(internal.functions.notes.savePendingAiEdit, {
          noteId: noteId as Id<"notes">,
          proposedBody,
          prompt,
        });
        return "Edición propuesta guardada. El usuario podrá revisarla.";
      },
    },
  },
  maxSteps: 2,
  ```
- Import `z` from `"zod"` (already a transitive dep).

---

## Phase 2 — Hooks

### 5. `src/hooks/useNotes.ts` — new file
```ts
export function useNotes() {
  const notes = useQuery(api.functions.notes.list);
  const createNote = useMutation(api.functions.notes.create);
  const updateNote = useMutation(api.functions.notes.update);
  const removeNote = useMutation(api.functions.notes.remove);
  return { notes, createNote, updateNote, removeNote };
}

export function useNote(noteId: Id<"notes">) {
  const note = useQuery(api.functions.notes.get, { noteId });
  const updateNote = useMutation(api.functions.notes.update);
  const clearPendingAiEdit = useMutation(api.functions.notes.clearPendingAiEdit);
  return { note, updateNote, clearPendingAiEdit };
}
```

### 6. `src/hooks/useGlobalSession.ts` — new file
Reuses `useSessions()`. Returns the most recent session ID (or creates one named "Mi espacio" if none exist). This is the chat session shown in the workspace right panel.

```ts
export function useGlobalSession(): Id<"sessions"> | null {
  const { sessions, createSession } = useSessions();
  const [sessionId, setSessionId] = useState<Id<"sessions"> | null>(null);

  useEffect(() => {
    if (sessions === undefined) return;
    if (sessions.length > 0) {
      setSessionId(sessions[0]._id);
    } else {
      createSession({ title: "Mi espacio" }).then(setSessionId);
    }
  }, [sessions]);

  return sessionId;
}
```

---

## Phase 3 — Design Tokens + Editor Component

### 7. `index.html`
Add `Lora` to the existing Google Fonts `<link>` href:
```
&family=Lora:ital,wght@0,400..700;1,400..700
```

### 8. `src/index.css`
Inside `@theme inline {}`, add:
```css
--font-serif: "Lora", ui-serif, Georgia, serif;
```

### 9. `src/components/notes/NoteEditor.tsx` — new file
Tiptap editor with `StarterKit`, `Placeholder`, and `@tiptap/markdown` extension.
- Initializes content from `note.body` (markdown string).
- On `onUpdate`: `editor.storage.markdown.getMarkdown()` → debounced `updateNote` call (500ms debounce via `useRef<ReturnType<typeof setTimeout>>` + `clearTimeout`).
- Editor wrapper div uses `className="font-serif"`.
- Editor content area: `prose prose-sm max-w-none focus:outline-none min-h-[300px] px-8 py-6 leading-relaxed`.
- Reinitializes when `noteId` changes (use `key={noteId}` on the editor wrapper or call `editor.commands.setContent(note.body)` in a `useEffect`).

### 10. `src/components/notes/AiEditSuggestionCard.tsx` — new file
Rendered in `NoteEditorPage` when `note.pendingAiEdit` is truthy.

```tsx
<AnimatePresence>
  {note.pendingAiEdit && (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      className="border border-border rounded-2xl bg-card shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-3 border-b border-border flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Sugerencia de Bitacory</span>
        <span className="text-xs text-muted-foreground/60">{note.pendingAiEdit.prompt}</span>
      </div>
      {/* Prose preview — same serif font, read-only */}
      <div className="font-serif px-8 py-6 prose prose-sm max-w-none text-foreground/80 max-h-72 overflow-y-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.pendingAiEdit.proposedBody}</ReactMarkdown>
      </div>
      {/* Actions */}
      <div className="px-6 py-4 border-t border-border flex gap-3">
        <Button onClick={handleApply}>Aplicar</Button>
        <Button variant="ghost" onClick={handleDiscard}>Mantener la mía</Button>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

`handleApply`: calls `updateNote({ noteId, body: note.pendingAiEdit.proposedBody })` + `clearPendingAiEdit({ noteId })`.
`handleDiscard`: calls only `clearPendingAiEdit({ noteId })`.

### 11. `src/components/notes/MentionPicker.tsx` — new file
Small dropdown, shown when `showMentionPicker` is true. Renders filtered note list (from `useNotes()`), max 6 items. Each item is a button; selecting one calls `onSelect(note)`. Framer Motion `AnimatePresence` fade + scale-in. Keyboard: Arrow up/down + Enter. Absolute positioned above the Textarea.

---

## Phase 4 — Extend Existing Chat Components

### 12. `src/components/chat/MessageComposer.tsx`
Add props:
```ts
mentionedNotes?: Array<{ _id: Id<"notes">; title: string }>;
onMentionAdd?: (note: { _id: Id<"notes">; title: string }) => void;
onMentionRemove?: (noteId: Id<"notes">) => void;
```

In `onChange`:
```ts
const match = value.match(/@(\w*)$/);
setShowMentionPicker(!!match);
setMentionQuery(match?.[1] ?? "");
```

When a note is picked: strip the `@query` fragment from `input`, append `@NoteTitle ` as cosmetic token, call `onMentionAdd`.

Render mentioned note chips above the Textarea (inside the rounded container):
```tsx
{mentionedNotes?.map(n => (
  <span key={n._id} className="inline-flex items-center gap-1 text-xs bg-muted rounded-md px-2 py-0.5">
    <FileText className="h-3 w-3" />
    {n.title}
    <button onClick={() => onMentionRemove?.(n._id)}><X className="h-3 w-3" /></button>
  </span>
))}
```

`MentionPicker` renders as `position: absolute` above the composer (use a `relative` wrapper on the outer div).

### 13. `src/components/chat/ChatView.tsx`
Add optional props:
```ts
mentionedNotes?: Array<{ _id: Id<"notes">; title: string }>;
onMentionAdd?: (note: { _id: Id<"notes">; title: string }) => void;
onMentionRemove?: (noteId: Id<"notes">) => void;
```

Update `handleSend`:
```ts
await sendMessage({
  sessionId,
  content,
  noteIds: mentionedNotes?.map(n => n._id),
});
// after success:
onMentionRemove && mentionedNotes?.forEach(n => onMentionRemove(n._id));
```

Pass the three props through to `<MessageComposer>`.

---

## Phase 5 — Pages

### 14. `src/pages/NotesIndexPage.tsx` — new file
Empty state: centered text "Seleccioná una nota o creá una nueva" + a "Nueva nota" button that calls `createNote` and navigates to `/notes/:noteId`.

### 15. `src/pages/NoteEditorPage.tsx` — new file
- Reads `noteId` from `useParams()`.
- Uses `useNote(noteId)`.
- Renders: note title `<input>` (auto-save via debounce) + `<NoteEditor>` + `<AiEditSuggestionCard>` (conditional).
- Title input uses `font-serif` text, borderless style, larger text size.
- Shows back-to-notes button (mobile only).

### 16. `src/pages/WorkspacePage.tsx` — new file
Owns panel collapse state. Renders:
```tsx
<div className="flex flex-1 min-h-0 overflow-hidden">
  <AnimatePresence initial={false}>
    {!editorCollapsed && (
      <motion.div
        key="editor"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: editorWidth, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="flex flex-col min-h-0 border-r border-border overflow-hidden"
        style={{ flexShrink: 0 }}
      >
        <Outlet />
      </motion.div>
    )}
  </AnimatePresence>

  {!chatCollapsed && (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <GlobalChatPanel
        mentionedNotes={mentionedNotes}
        onMentionAdd={handleMentionAdd}
        onMentionRemove={handleMentionRemove}
        onToggleEditor={() => setEditorCollapsed(v => !v)}
      />
    </div>
  )}
</div>
```

`editorWidth` defaults to `"50%"` but can be a resizable value (v1: fixed). `mentionedNotes` state lives here and is passed to `GlobalChatPanel`.

### 17. `src/components/notes/GlobalChatPanel.tsx` — new file
Thin wrapper:
```tsx
export function GlobalChatPanel({ mentionedNotes, onMentionAdd, onMentionRemove, onToggleEditor }) {
  const sessionId = useGlobalSession();
  if (!sessionId) return <LoadingSpinner />;
  return (
    <ChatView
      sessionId={sessionId}
      mentionedNotes={mentionedNotes}
      onMentionAdd={onMentionAdd}
      onMentionRemove={onMentionRemove}
    />
  );
}
```

---

## Phase 6 — Navigation + Routes

### 18. `src/components/sidebar/NavNotes.tsx` — new file
Mirrors `NavSessions.tsx`:
- Uses `useNotes()`.
- Group header: "Notas" label + "+" button that creates a note and navigates.
- Each item: `SidebarMenuButton` linking to `/notes/:noteId`, active detection via `useParams().noteId`.
- Date grouping (Today / Esta semana / Antes): computed from `note.updatedAt` using `Date` arithmetic.
- Hover actions: rename (inline edit) + delete (with confirmation).

### 19. `src/components/sidebar/NavMain.tsx`
Add one item to `MENU_ITEMS`:
```ts
{ id: "new-note", title: "Nueva nota", icon: NotebookPen, action: handleNewNote },
```
`handleNewNote`: calls `createNote({ title: "Nueva nota", body: "", updatedAt: Date.now() })`, navigates to `/notes/:newId`. Requires `useNotes()` import.

### 20. `src/components/sidebar/AppSidebar.tsx`
Add `<NavNotes />` between `<NavMain />` and `<NavSessions />`. One import, one JSX line.

### 21. `src/routes.tsx`
Add inside the `AuthGuard` children array (alongside `/chat` entries):
```ts
{
  path: "/notes",
  element: <Suspense fallback={null}><WorkspacePage /></Suspense>,
  children: [
    { index: true, element: <Suspense fallback={null}><NotesIndexPage /></Suspense> },
    { path: ":noteId", element: <Suspense fallback={null}><NoteEditorPage /></Suspense> },
  ],
},
```
Update `/` redirect from `/chat` → `/notes`.

---

## Critical Files Modified

| File | Change |
|------|--------|
| `convex/schema.ts` | Add `notes` table |
| `convex/functions/notes.ts` | **New** — full CRUD |
| `convex/functions/messages.ts` | Add `noteIds` arg to `send` |
| `convex/functions/agent.ts` | Add note context injection + `proposeNoteEdit` tool |
| `src/routes.tsx` | Add `/notes` routes, update `/` redirect |
| `src/components/chat/ChatView.tsx` | Add mention props, pass `noteIds` to `sendMessage` |
| `src/components/chat/MessageComposer.tsx` | Add `@mention` detection + chips UI |
| `src/components/sidebar/AppSidebar.tsx` | Add `<NavNotes />` |
| `src/components/sidebar/NavMain.tsx` | Add "Nueva nota" item |
| `index.html` | Add Lora to Google Fonts |
| `src/index.css` | Add `--font-serif` token |

## New Files

```
convex/functions/notes.ts
src/hooks/useNotes.ts
src/hooks/useGlobalSession.ts
src/pages/NotesIndexPage.tsx
src/pages/NoteEditorPage.tsx
src/pages/WorkspacePage.tsx
src/components/notes/NoteEditor.tsx
src/components/notes/AiEditSuggestionCard.tsx
src/components/notes/MentionPicker.tsx
src/components/notes/GlobalChatPanel.tsx
src/components/sidebar/NavNotes.tsx
```

---

## Verification

1. `npx convex dev` — schema deploys without errors; `notes` table visible in Convex dashboard.
2. `npm run dev` — app starts; `/` redirects to `/notes`.
3. Create a note from sidebar → navigates to `/notes/:noteId`, Tiptap editor renders with serif font.
4. Type in editor → auto-saves (check Convex dashboard for note updates after 500ms pause).
5. In the right chat panel, type `@` → MentionPicker appears with note titles.
6. Select a note → chip appears in composer, send a message → AI responds with note context.
7. Ask AI "Mejorar esta nota" with note attached → `pendingAiEdit` appears on note doc → `AiEditSuggestionCard` slides in below editor → click "Aplicar" → editor updates with AI content.
8. Collapse either panel → Framer Motion width transition, other panel fills width.
9. Run `npx vitest --project convex` — existing session tests still pass.
