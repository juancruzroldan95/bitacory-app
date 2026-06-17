# Code Style

Conventions and patterns to follow consistently across the Bitacory codebase.
Always read the relevant skill files under `.gemini/skills/` before implementing backend or frontend features.

---

## Icons

**Always use [Lucide React](https://lucide.dev) for icons. Never use emojis in UI code.**

```tsx
// ✅ Correct
import { Brain, Heart, Sprout } from "lucide-react";
<Brain className="size-4" />

// ❌ Wrong
<span>🧠</span>
```

- Use the `size-4` / `size-5` Tailwind utilities (16px / 20px) as the default icon size.
- Pass `className` for sizing and color — never use the `size` or `color` props directly.
- Import only the icons you use; do not barrel-import from `lucide-react`.
- When representing a concept that maps to a tag (e.g. "ansiedad"), use the icon defined in `src/consts/tags.ts` — don't introduce a different icon for the same concept elsewhere.

---

## Constants & Enums

- Static lists (tags, categories, status values) live in `src/consts/` as TypeScript `const` arrays or objects — **not** as TypeScript `enum`.
- Export the array as the source of truth. Derive union types from it:

```ts
// src/consts/tags.ts
export const THERAPEUTIC_TAGS = [...] as const;
export type TagSlug = typeof THERAPEUTIC_TAGS[number]["slug"];
```

- Name files by what they contain: `tags.ts`, `routes.ts`, `limits.ts`.
- Always export a lookup map alongside the array for O(1) access by key.

---

## Frontend (React + Tailwind)

> Read `.gemini/skills/vercel-react-best-practices/SKILL.md` before building new components or hooks.

### Component rules

- One component per file. Filename = component name in PascalCase.
- No direct `api.*` imports in components or pages — all Convex calls go through hooks in `src/hooks/`.
- Use `src/components/ui/` (shadcn) for primitives (Button, Input, Dialog, etc.) before writing custom ones.
- Prefer composition over prop drilling: use React context only when data is needed across many levels.

### Tailwind

- Use Tailwind CSS v4 utility classes exclusively — no inline `style` props unless strictly necessary (e.g. dynamic values that can't be expressed as utilities).
- Group classes: layout → spacing → typography → colors → effects. Use `clsx` or `cn()` (`src/lib/utils.ts`) for conditional classes.
- Use design tokens (CSS variables) defined in `src/index.css` for colors — don't hardcode hex/HSL values in components.

### State & data fetching

- Server state lives in Convex (via hooks). Local UI state lives in `useState` / `useReducer`.
- Never store in local state what can be derived from Convex reactive queries.
- Optimistic updates: use Convex's built-in optimistic update API in hooks, not ad-hoc local mirrors.

### Routing

- Routes are declared in `src/routes.tsx` as a single object-based config (React Router v7 style).
- Navigate programmatically with `useNavigate`. Never manipulate `window.location` directly.

---

## Backend (Convex)

> Read `.gemini/skills/convex/SKILL.md` and `.gemini/skills/convex-quickstart/` before adding new Convex functions or schema changes.

### Function types

| Use case | Function type |
|----------|---------------|
| Client-readable query | `query` |
| Client-triggered write | `mutation` |
| Called only from other backend functions | `internalQuery` / `internalMutation` / `internalAction` |
| Needs Node.js / AI SDK | `action` in a `"use node"` file |

### Auth

Every public function that touches user data must derive the user server-side:

```ts
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("Not authenticated");
```

Never accept a `userId` argument from the client.

### Schema changes

- Always add new fields as `v.optional(...)` to avoid breaking existing documents.
- Add indexes for every field used in `.withIndex()` or `.withSearchIndex()` at schema definition time — never filter in JS what can be filtered by an index.
- After adding a `searchIndex`, use `ctx.db.query(...).withSearchIndex(...)` — not a JS `.filter()` over all documents.

### Scheduled work

Side effects (AI generation, RAG indexing, cleanup) must be scheduled with `ctx.scheduler.runAfter(0, internal.functions.xxx, args)` — never awaited inline inside a mutation.

### File naming

One file per entity in `convex/functions/`. Node.js-only logic stays in a dedicated `"use node"` file (currently `agent.ts`).

---

## TypeScript

- Avoid `any`. Prefer `unknown` and narrow with type guards.
- Use `satisfies` to validate object literals against a type without losing inference.
- Prefer explicit return types on all exported functions and hooks.
- No non-null assertions (`!`) unless provably safe — add a comment explaining why.

---

## File & Folder Conventions

```
src/
  consts/      # Static constant data (tags, limits, config values)
  components/  # UI components — no Convex imports
  hooks/       # One file per backend entity; all Convex interaction
  pages/       # Route entry points — orchestrate hooks, handle navigation
  lib/         # Pure utilities (cn, formatDate, etc.)
  types/       # Shared TypeScript types not tied to a single module
```

---

## Commits & PR hygiene

- One logical change per commit.
- Commit messages: imperative mood, present tense — `Add tag filtering to NotesPage`, not `Added tags`.
