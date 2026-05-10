import { expect, test, describe } from "vitest";
import { api, internal } from "../_generated/api";
import { makeT } from "../../testUtils";

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

// ---------------------------------------------------------------------------
// sessions.list
// ---------------------------------------------------------------------------

describe("sessions.list", () => {
  test("returns empty array when unauthenticated", async () => {
    const t = makeT();
    const result = await t.query(api.functions.sessions.list, {});
    expect(result).toEqual([]);
  });

  test("returns sessions for the authenticated user", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    await seedSession(t, userId, "First");
    await seedSession(t, userId, "Second");

    const sessions = await t.withIdentity({ subject: userId }).query(api.functions.sessions.list, {});
    expect(sessions).toHaveLength(2);
  });

  test("returns sessions in descending creation order", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    await seedSession(t, userId, "First");
    await seedSession(t, userId, "Second");

    const sessions = await t.withIdentity({ subject: userId }).query(api.functions.sessions.list, {});
    expect(sessions[0].title).toBe("Second");
    expect(sessions[1].title).toBe("First");
  });

  test("does not return sessions belonging to other users", async () => {
    const t = makeT();
    const userA = await seedUser(t);
    const userB = await seedUser(t);
    await seedSession(t, userA);

    const sessions = await t.withIdentity({ subject: userB }).query(api.functions.sessions.list, {});
    expect(sessions).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// sessions.get
// ---------------------------------------------------------------------------

describe("sessions.get", () => {
  test("returns null when unauthenticated", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const sessionId = await seedSession(t, userId);

    const result = await t.query(api.functions.sessions.get, { sessionId });
    expect(result).toBeNull();
  });

  test("returns null when the session belongs to another user", async () => {
    const t = makeT();
    const userA = await seedUser(t);
    const userB = await seedUser(t);
    const sessionId = await seedSession(t, userA);

    const result = await t
      .withIdentity({ subject: userB })
      .query(api.functions.sessions.get, { sessionId });
    expect(result).toBeNull();
  });

  test("returns the session when it belongs to the authenticated user", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const sessionId = await seedSession(t, userId, "My Session");

    const result = await t
      .withIdentity({ subject: userId })
      .query(api.functions.sessions.get, { sessionId });
    expect(result).not.toBeNull();
    expect(result?.title).toBe("My Session");
    expect(result?._id).toBe(sessionId);
  });
});

// ---------------------------------------------------------------------------
// sessions.rename
// ---------------------------------------------------------------------------

describe("sessions.rename", () => {
  test("throws when unauthenticated", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const sessionId = await seedSession(t, userId);

    await expect(
      t.mutation(api.functions.sessions.rename, { sessionId, title: "New" }),
    ).rejects.toThrowError("Not authenticated");
  });

  test("throws when the session belongs to another user", async () => {
    const t = makeT();
    const userA = await seedUser(t);
    const userB = await seedUser(t);
    const sessionId = await seedSession(t, userA);

    await expect(
      t.withIdentity({ subject: userB }).mutation(api.functions.sessions.rename, {
        sessionId,
        title: "Hijacked",
      }),
    ).rejects.toThrowError("Session not found");
  });

  test("renames the session", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const sessionId = await seedSession(t, userId, "Old Title");

    await t
      .withIdentity({ subject: userId })
      .mutation(api.functions.sessions.rename, { sessionId, title: "New Title" });

    const session = await t.run((ctx) => ctx.db.get(sessionId));
    expect(session?.title).toBe("New Title");
  });
});

// ---------------------------------------------------------------------------
// sessions.remove
// ---------------------------------------------------------------------------

describe("sessions.remove", () => {
  test("throws when unauthenticated", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const sessionId = await seedSession(t, userId);

    await expect(
      t.mutation(api.functions.sessions.remove, { sessionId }),
    ).rejects.toThrowError("Not authenticated");
  });

  test("throws when the session belongs to another user", async () => {
    const t = makeT();
    const userA = await seedUser(t);
    const userB = await seedUser(t);
    const sessionId = await seedSession(t, userA);

    await expect(
      t.withIdentity({ subject: userB }).mutation(api.functions.sessions.remove, { sessionId }),
    ).rejects.toThrowError("Session not found");
  });

  test("deletes the session from the database", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const sessionId = await seedSession(t, userId);

    await t.withIdentity({ subject: userId }).mutation(api.functions.sessions.remove, { sessionId });

    const session = await t.run((ctx) => ctx.db.get(sessionId));
    expect(session).toBeNull();
  });

  test("does not delete sessions belonging to other users", async () => {
    const t = makeT();
    const userA = await seedUser(t);
    const userB = await seedUser(t);
    const sessionId = await seedSession(t, userA);

    await expect(
      t.withIdentity({ subject: userB }).mutation(api.functions.sessions.remove, { sessionId }),
    ).rejects.toThrow();

    const session = await t.run((ctx) => ctx.db.get(sessionId));
    expect(session).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// sessions.updateSummary (internal mutation)
// ---------------------------------------------------------------------------

describe("sessions.updateSummary", () => {
  test("patches the session with summary, themes, and timestamp", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const sessionId = await seedSession(t, userId, "Original Title");

    await t.mutation(internal.functions.sessions.updateSummary, {
      sessionId,
      title: "Updated Title",
      summary: "A meaningful summary",
      themes: ["anxiety", "work-life balance"],
    });

    const session = await t.run((ctx) => ctx.db.get(sessionId));
    expect(session?.title).toBe("Updated Title");
    expect(session?.summary).toBe("A meaningful summary");
    expect(session?.themes).toEqual(["anxiety", "work-life balance"]);
    expect(session?.summaryGeneratedAt).toBeTypeOf("number");
  });

  test("overwrites previous summary data", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const sessionId = await seedSession(t, userId);

    await t.mutation(internal.functions.sessions.updateSummary, {
      sessionId,
      title: "First",
      summary: "First summary",
      themes: ["theme-a"],
    });

    await t.mutation(internal.functions.sessions.updateSummary, {
      sessionId,
      title: "Second",
      summary: "Second summary",
      themes: ["theme-b", "theme-c"],
    });

    const session = await t.run((ctx) => ctx.db.get(sessionId));
    expect(session?.title).toBe("Second");
    expect(session?.summary).toBe("Second summary");
    expect(session?.themes).toEqual(["theme-b", "theme-c"]);
  });
});
