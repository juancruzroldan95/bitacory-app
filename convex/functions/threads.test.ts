import { expect, test, describe } from "vitest";
import { api, internal } from "../_generated/api";
import { makeT } from "../../testUtils";

async function seedUser(t: ReturnType<typeof makeT>) {
  return t.run((ctx) => ctx.db.insert("users", {}));
}

async function seedThread(
  t: ReturnType<typeof makeT>,
  userId: Awaited<ReturnType<typeof seedUser>>,
  title = "Test Thread",
) {
  return t.run((ctx) =>
    ctx.db.insert("threads", { userId, title, agentThreadId: "agent-thread-stub" }),
  );
}

// ---------------------------------------------------------------------------
// threads.list
// ---------------------------------------------------------------------------

describe("threads.list", () => {
  test("returns empty array when unauthenticated", async () => {
    const t = makeT();
    const result = await t.query(api.functions.threads.list, {});
    expect(result).toEqual([]);
  });

  test("returns threads for the authenticated user", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    await seedThread(t, userId, "First");
    await seedThread(t, userId, "Second");

    const threads = await t.withIdentity({ subject: userId }).query(api.functions.threads.list, {});
    expect(threads).toHaveLength(2);
  });

  test("returns threads in descending creation order", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    await seedThread(t, userId, "First");
    await seedThread(t, userId, "Second");

    const threads = await t.withIdentity({ subject: userId }).query(api.functions.threads.list, {});
    expect(threads[0].title).toBe("Second");
    expect(threads[1].title).toBe("First");
  });

  test("does not return threads belonging to other users", async () => {
    const t = makeT();
    const userA = await seedUser(t);
    const userB = await seedUser(t);
    await seedThread(t, userA);

    const threads = await t.withIdentity({ subject: userB }).query(api.functions.threads.list, {});
    expect(threads).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// threads.get
// ---------------------------------------------------------------------------

describe("threads.get", () => {
  test("returns null when unauthenticated", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const threadId = await seedThread(t, userId);

    const result = await t.query(api.functions.threads.get, { threadId });
    expect(result).toBeNull();
  });

  test("returns null when the thread belongs to another user", async () => {
    const t = makeT();
    const userA = await seedUser(t);
    const userB = await seedUser(t);
    const threadId = await seedThread(t, userA);

    const result = await t
      .withIdentity({ subject: userB })
      .query(api.functions.threads.get, { threadId });
    expect(result).toBeNull();
  });

  test("returns the thread when it belongs to the authenticated user", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const threadId = await seedThread(t, userId, "My Thread");

    const result = await t
      .withIdentity({ subject: userId })
      .query(api.functions.threads.get, { threadId });
    expect(result).not.toBeNull();
    expect(result?.title).toBe("My Thread");
    expect(result?._id).toBe(threadId);
  });
});

// ---------------------------------------------------------------------------
// threads.rename
// ---------------------------------------------------------------------------

describe("threads.rename", () => {
  test("throws when unauthenticated", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const threadId = await seedThread(t, userId);

    await expect(
      t.mutation(api.functions.threads.rename, { threadId, title: "New" }),
    ).rejects.toThrowError("Not authenticated");
  });

  test("throws when the thread belongs to another user", async () => {
    const t = makeT();
    const userA = await seedUser(t);
    const userB = await seedUser(t);
    const threadId = await seedThread(t, userA);

    await expect(
      t.withIdentity({ subject: userB }).mutation(api.functions.threads.rename, {
        threadId,
        title: "Hijacked",
      }),
    ).rejects.toThrowError("Thread not found");
  });

  test("renames the thread", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const threadId = await seedThread(t, userId, "Old Title");

    await t
      .withIdentity({ subject: userId })
      .mutation(api.functions.threads.rename, { threadId, title: "New Title" });

    const thread = await t.run((ctx) => ctx.db.get(threadId));
    expect(thread?.title).toBe("New Title");
  });
});

// ---------------------------------------------------------------------------
// threads.remove
// ---------------------------------------------------------------------------

describe("threads.remove", () => {
  test("throws when unauthenticated", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const threadId = await seedThread(t, userId);

    await expect(
      t.mutation(api.functions.threads.remove, { threadId }),
    ).rejects.toThrowError("Not authenticated");
  });

  test("throws when the thread belongs to another user", async () => {
    const t = makeT();
    const userA = await seedUser(t);
    const userB = await seedUser(t);
    const threadId = await seedThread(t, userA);

    await expect(
      t.withIdentity({ subject: userB }).mutation(api.functions.threads.remove, { threadId }),
    ).rejects.toThrowError("Thread not found");
  });

  test("deletes the thread from the database", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const threadId = await seedThread(t, userId);

    await t.withIdentity({ subject: userId }).mutation(api.functions.threads.remove, { threadId });

    const thread = await t.run((ctx) => ctx.db.get(threadId));
    expect(thread).toBeNull();
  });

  test("does not delete threads belonging to other users", async () => {
    const t = makeT();
    const userA = await seedUser(t);
    const userB = await seedUser(t);
    const threadId = await seedThread(t, userA);

    await expect(
      t.withIdentity({ subject: userB }).mutation(api.functions.threads.remove, { threadId }),
    ).rejects.toThrow();

    const thread = await t.run((ctx) => ctx.db.get(threadId));
    expect(thread).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// threads.updateSummary (internal mutation)
// ---------------------------------------------------------------------------

describe("threads.updateSummary", () => {
  test("patches the thread with summary, themes, and timestamp", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const threadId = await seedThread(t, userId, "Original Title");

    await t.mutation(internal.functions.threads.updateSummary, {
      threadId,
      title: "Updated Title",
      summary: "A meaningful summary",
      themes: ["anxiety", "work-life balance"],
    });

    const thread = await t.run((ctx) => ctx.db.get(threadId));
    expect(thread?.title).toBe("Updated Title");
    expect(thread?.summary).toBe("A meaningful summary");
    expect(thread?.themes).toEqual(["anxiety", "work-life balance"]);
    expect(thread?.summaryGeneratedAt).toBeTypeOf("number");
  });

  test("overwrites previous summary data", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const threadId = await seedThread(t, userId);

    await t.mutation(internal.functions.threads.updateSummary, {
      threadId,
      title: "First",
      summary: "First summary",
      themes: ["theme-a"],
    });

    await t.mutation(internal.functions.threads.updateSummary, {
      threadId,
      title: "Second",
      summary: "Second summary",
      themes: ["theme-b", "theme-c"],
    });

    const thread = await t.run((ctx) => ctx.db.get(threadId));
    expect(thread?.title).toBe("Second");
    expect(thread?.summary).toBe("Second summary");
    expect(thread?.themes).toEqual(["theme-b", "theme-c"]);
  });
});
