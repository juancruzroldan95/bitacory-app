# Convex guidelines

## Functions

- Use `internalQuery` / `internalMutation` / `internalAction` for private functions; `query` / `mutation` / `action` for public ones.
- Always include argument validators (`v.*`) for every function.
- Always add `"use node";` at the top of files that use Node.js built-ins. Never mix `"use node"` with queries or mutations — put actions needing Node in a separate file.
- `fetch()` is available in the default Convex runtime; `"use node"` is not needed just for fetch.
- Never use `ctx.db` inside actions.

## Calling functions

- Use `ctx.runQuery`, `ctx.runMutation`, `ctx.runAction` with a `FunctionReference` (from `api` or `internal`), never pass the function directly.
- Only call an action from another action if you need to cross runtimes (V8 → Node). Otherwise extract shared logic into a plain async helper.
- Minimize action→query/mutation hops to avoid race conditions.
- When calling a function in the same file via `ctx.runQuery`/`ctx.runMutation`, add an explicit return type annotation to avoid TypeScript circularity errors.

## Queries

- Never use `.filter()`. Define an index in the schema and use `.withIndex()`.
- Never use `.collect()` unless bounded; prefer `.take(n)` or `.paginate()`.
- Never use `.collect().length` to count — maintain a denormalized counter instead.
- Use `.unique()` when exactly one document is expected.
- Convex queries do not support `.delete()`. To bulk-delete, batch with `.take(n)` and call `ctx.db.delete()` per row.
- For processing more docs than fit in one transaction, use `.take(n)` then `ctx.scheduler.runAfter(0, ...)` to continue.

## Mutations

- `ctx.db.patch` — shallow merge (throws if doc missing).
- `ctx.db.replace` — full replace (throws if doc missing).

## Schema

- Always define schema in `convex/schema.ts`.
- Include all index fields in the index name (e.g. `"by_field1_and_field2"`).
- Index fields must be queried in the same order they are defined.
- Do not store unbounded arrays inside documents — create a child table with a foreign key instead.
- Separate high-churn fields (heartbeats, typing indicators) into a dedicated table.

## Auth

- Always use `getAuthUserId(ctx)` from `@convex-dev/auth/server` — not `ctx.auth.getUserIdentity()`.
- Never accept a userId as a function argument for authorization; always derive it server-side.
- `auth.config.ts` must exist for auth to work; without it `ctx.auth.getUserIdentity()` always returns null.

## TypeScript

- Use `Id<"tableName">` from `./_generated/dataModel` for document ID types — not plain `string`.
- Use `Doc<"tableName">` for full document types.
- Use `QueryCtx`, `MutationCtx`, `ActionCtx` from `./_generated/server` for context types. Never use `any`.

## Scheduling / crons

- Use only `crons.interval` or `crons.cron` — not `crons.hourly`, `crons.daily`, or `crons.weekly`.
- Pass a `FunctionReference` to cron methods, not the function directly.
- Export the `crons` object as default from `convex/crons.ts`.

## File storage

- `ctx.storage.getUrl(id)` returns a signed URL or `null` if the file doesn't exist.
- Do not use the deprecated `ctx.storage.getMetadata`. Query `_storage` via `ctx.db.system.get` instead.
- Convex storage uses `Blob` objects — convert to/from `Blob` when reading or writing.

## Pagination

```ts
export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return ctx.db.query("table").order("desc").paginate(args.paginationOpts);
  },
});
// Returns: { page, isDone, continueCursor }
```

## Full-text search

```ts
const results = await ctx.db
  .query("messages")
  .withSearchIndex("search_body", (q) =>
    q.search("body", "hello hi").eq("channel", "#general")
  )
  .take(10);
```
