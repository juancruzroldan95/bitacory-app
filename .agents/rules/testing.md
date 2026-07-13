---
trigger: always_on
---

# Testing

## Setup

Two Vitest projects are configured in `vitest.config.ts`:

| Project | Glob | Runtime | Use for |
|---------|------|---------|---------|
| `convex` | `convex/**/*.test.ts` | `edge-runtime` | Convex queries, mutations, internal functions |
| `frontend` | all other `*.test.ts` | `jsdom` | React hooks, components, pure utilities |

```bash
npx vitest                                      # all tests
npx vitest --project convex                     # backend only
npx vitest --project frontend                   # frontend only
npx vitest convex/functions/sessions.test.ts    # single file
```

## Convex backend tests

### Test harness

`testUtils.ts` exports `makeT()`, which calls `convex-test` with the project schema. Each test creates its own isolated `t` instance — no shared state between tests.

```ts
import { makeT } from "../../testUtils";
const t = makeT();
```

**Running functions:**
```ts
t.query(api.functions.sessions.list, {})
t.mutation(api.functions.sessions.rename, { sessionId, title: "New" })
t.mutation(internal.functions.sessions.updateSummary, { ... })  // internal functions work too
t.run((ctx) => ctx.db.get(sessionId))  // raw database access for setup/assertions
```

**Authenticated calls:**
```ts
t.withIdentity({ subject: userId }).query(...)
t.withIdentity({ subject: userId }).mutation(...)
```
`subject` is the user's `_id` from the `users` table (an `Id<"users">` cast to string). Unauthenticated = call `t.query/t.mutation` without `.withIdentity()`.

### Seed helpers

Define `seedX` functions at the top of each test file. Keep them minimal — only the fields the tests actually care about.

```ts
async function seedUser(t: ReturnType<typeof makeT>) {
  return t.run((ctx) => ctx.db.insert("users", {}));
}

async function seedSession(
  t: ReturnType<typeof makeT>,
  userId: Awaited<ReturnType<typeof seedUser>>,
  title = "Test Session",
) {
  return t.run((ctx) =>
    ctx.db.insert("sessions", { userId, title, agentThreadId: "agent-thread-stub" }),
  );
}
```

## Test design: Equivalent Class Partitioning

For each function under test, identify the **input space partitions** and write one representative test per partition. Don't write tests that exercise the same behavior twice.

### Partitions to always cover

**Authentication boundary** — unauthenticated is always a distinct partition:
- `unauthenticated` → returns empty/null or throws
- `authenticated as owner` → happy path
- `authenticated as non-owner` → returns empty/null or throws

**Existence boundary** — when the function looks up a record by ID:
- record exists + belongs to caller → succeeds
- record exists but belongs to another user → treated as not found (same behavior as "missing" — don't leak existence)
- record does not exist → same error as above

**State transitions** — for mutations that change data:
- initial write (no prior state)
- overwrite (prior state exists, must be fully replaced)

### Example partition map

For `sessions.rename`:

| Partition | Input | Expected |
|-----------|-------|----------|
| unauthenticated | no identity | throws "Not authenticated" |
| wrong owner | authenticated as userB, session owned by userA | throws "Session not found" |
| happy path | authenticated as owner | `session.title` updated in DB |

### What not to test

- Convex runtime behavior (`ctx.db.insert` actually persists, indexes work) — the framework guarantees these.
- `actions` that call external APIs (AI SDK, RAG) — stub or skip; test the mutations they schedule instead.
- The generated `api` object shape — it's auto-generated.

## File structure

Place test files in the same directory as the module under test:

```
convex/functions/sessions.ts
convex/functions/sessions.test.ts   ← tests for sessions.ts
convex/functions/notes.ts
convex/functions/notes.test.ts
```

## describe / test naming

Group by function name with `describe`, name tests by the partition they represent:

```ts
describe("sessions.rename", () => {
  test("throws when unauthenticated", ...)
  test("throws when the session belongs to another user", ...)
  test("renames the session", ...)
})
```

Test names should complete the sentence _"it [name]"_ — describe the observable outcome, not implementation details.
