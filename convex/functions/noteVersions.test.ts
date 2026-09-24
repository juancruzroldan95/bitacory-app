import { expect, test, describe } from "vitest";
import { api, internal } from "../_generated/api";
import { makeT } from "../../testUtils";

async function seedUser(t: ReturnType<typeof makeT>) {
  return t.run((ctx) => ctx.db.insert("users", {}));
}

async function seedNote(
  t: ReturnType<typeof makeT>,
  userId: Awaited<ReturnType<typeof seedUser>>,
  title = "Nota de prueba",
  body = "Cuerpo inicial escrito por el usuario",
) {
  return t.run((ctx) =>
    ctx.db.insert("notes", {
      userId,
      title,
      body,
      tags: ["reflexion"],
      updatedAt: Date.now(),
    }),
  );
}

async function seedSession(
  t: ReturnType<typeof makeT>,
  userId: Awaited<ReturnType<typeof seedUser>>,
  title = "Sesión de prueba",
) {
  return t.run((ctx) =>
    ctx.db.insert("sessions", {
      userId,
      title,
      agentThreadId: "thread-test-123",
    }),
  );
}

describe("noteVersions.listByNote", () => {
  test("returns empty array when unauthenticated", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const noteId = await seedNote(t, userId);

    const res = await t.query(api.functions.noteVersions.listByNote, { noteId });
    expect(res).toEqual([]);
  });

  test("returns empty array when note belongs to another user", async () => {
    const t = makeT();
    const userA = await seedUser(t);
    const userB = await seedUser(t);
    const noteId = await seedNote(t, userA);

    const res = await t
      .withIdentity({ subject: userB })
      .query(api.functions.noteVersions.listByNote, { noteId });
    expect(res).toEqual([]);
  });

  test("returns versions in descending order for owner", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const noteId = await seedNote(t, userId);

    await t.withIdentity({ subject: userId }).mutation(api.functions.noteVersions.createCheckpoint, {
      noteId,
      summary: "Primer hito",
    });

    await t.withIdentity({ subject: userId }).mutation(api.functions.noteVersions.createCheckpoint, {
      noteId,
      summary: "Segundo hito",
    });

    const versions = await t
      .withIdentity({ subject: userId })
      .query(api.functions.noteVersions.listByNote, { noteId });

    expect(versions).toHaveLength(2);
    expect(versions[0].summary).toBe("Segundo hito");
    expect(versions[1].summary).toBe("Primer hito");
  });
});

describe("noteVersions.listBySession", () => {
  test("returns empty array when unauthenticated", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const sessionId = await seedSession(t, userId);

    const res = await t.query(api.functions.noteVersions.listBySession, { sessionId });
    expect(res).toEqual([]);
  });

  test("returns empty array when session belongs to another user", async () => {
    const t = makeT();
    const userA = await seedUser(t);
    const userB = await seedUser(t);
    const sessionId = await seedSession(t, userA);

    const res = await t
      .withIdentity({ subject: userB })
      .query(api.functions.noteVersions.listBySession, { sessionId });
    expect(res).toEqual([]);
  });

  test("returns versions created in the session for owner", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const noteId = await seedNote(t, userId);
    const sessionId = await seedSession(t, userId);

    await t.mutation(internal.functions.notes.applyAiEdit, {
      noteId,
      userId,
      sessionId,
      action: "append",
      content: "Conclusión",
      summary: "Editado en sesión",
    });

    const versions = await t
      .withIdentity({ subject: userId })
      .query(api.functions.noteVersions.listBySession, { sessionId });

    expect(versions).toHaveLength(1);
    expect(versions[0].summary).toBe("Editado en sesión");
    expect(versions[0].sessionId).toBe(sessionId);
  });
});

describe("noteVersions.createCheckpoint", () => {
  test("throws when unauthenticated", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const noteId = await seedNote(t, userId);

    await expect(
      t.mutation(api.functions.noteVersions.createCheckpoint, { noteId }),
    ).rejects.toThrow("Not authenticated");
  });

  test("throws when note belongs to another user", async () => {
    const t = makeT();
    const userA = await seedUser(t);
    const userB = await seedUser(t);
    const noteId = await seedNote(t, userA);

    await expect(
      t.withIdentity({ subject: userB }).mutation(api.functions.noteVersions.createCheckpoint, {
        noteId,
      }),
    ).rejects.toThrow("Note not found");
  });

  test("creates manual checkpoint with snapshot of current note", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const noteId = await seedNote(t, userId, "Mi Reflexión", "Texto original");

    const versionId = await t
      .withIdentity({ subject: userId })
      .mutation(api.functions.noteVersions.createCheckpoint, {
        noteId,
        summary: "Fin de escritura manual",
      });

    const version = (await t.run((ctx) => ctx.db.get(versionId))) as any;
    expect(version).not.toBeNull();
    expect(version?.title).toBe("Mi Reflexión");
    expect(version?.body).toBe("Texto original");
    expect(version?.author).toBe("user");
    expect(version?.actionType).toBe("manual_checkpoint");
    expect(version?.summary).toBe("Fin de escritura manual");
  });
});

describe("noteVersions.restore", () => {
  test("throws when unauthenticated", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const noteId = await seedNote(t, userId);
    const versionId = await t
      .withIdentity({ subject: userId })
      .mutation(api.functions.noteVersions.createCheckpoint, { noteId });

    await expect(
      t.mutation(api.functions.noteVersions.restore, { noteId, versionId }),
    ).rejects.toThrow("Not authenticated");
  });

  test("throws when note belongs to another user", async () => {
    const t = makeT();
    const userA = await seedUser(t);
    const userB = await seedUser(t);
    const noteId = await seedNote(t, userA);
    const versionId = await t
      .withIdentity({ subject: userA })
      .mutation(api.functions.noteVersions.createCheckpoint, { noteId });

    await expect(
      t.withIdentity({ subject: userB }).mutation(api.functions.noteVersions.restore, {
        noteId,
        versionId,
      }),
    ).rejects.toThrow("Note not found");
  });

  test("throws when version belongs to a different note", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const noteA = await seedNote(t, userId, "Nota A");
    const noteB = await seedNote(t, userId, "Nota B");
    const versionA = await t
      .withIdentity({ subject: userId })
      .mutation(api.functions.noteVersions.createCheckpoint, { noteId: noteA });

    await expect(
      t.withIdentity({ subject: userId }).mutation(api.functions.noteVersions.restore, {
        noteId: noteB,
        versionId: versionA,
      }),
    ).rejects.toThrow("Version not found");
  });

  test("restores note to previous version and creates pre-rollback snapshot", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const noteId = await seedNote(t, userId, "Titulo V1", "Cuerpo V1");

    // Create checkpoint of V1
    const v1Id = await t
      .withIdentity({ subject: userId })
      .mutation(api.functions.noteVersions.createCheckpoint, {
        noteId,
        summary: "Version 1",
      });

    // Update note to V2
    await t.withIdentity({ subject: userId }).mutation(api.functions.notes.update, {
      noteId,
      body: "Cuerpo modificado V2",
    });

    const noteBeforeRestore = (await t.run((ctx) => ctx.db.get(noteId))) as any;
    expect(noteBeforeRestore?.body).toBe("Cuerpo modificado V2");

    // Restore V1
    await t
      .withIdentity({ subject: userId })
      .mutation(api.functions.noteVersions.restore, { noteId, versionId: v1Id });

    // Note should have V1 body
    const noteAfterRestore = (await t.run((ctx) => ctx.db.get(noteId))) as any;
    expect(noteAfterRestore?.body).toBe("Cuerpo V1");

    // There should now be a rollback snapshot in noteVersions resguarding V2
    const versions = await t
      .withIdentity({ subject: userId })
      .query(api.functions.noteVersions.listByNote, { noteId });

    expect(versions).toHaveLength(2);
    expect(versions[0].actionType).toBe("restore_rollback");
    expect(versions[0].body).toBe("Cuerpo modificado V2");
  });
});

describe("notes.applyAiEdit", () => {
  test("throws when note belongs to another user", async () => {
    const t = makeT();
    const userA = await seedUser(t);
    const userB = await seedUser(t);
    const noteId = await seedNote(t, userA);
    const sessionId = await seedSession(t, userB);

    await expect(
      t.mutation(internal.functions.notes.applyAiEdit, {
        noteId,
        userId: userB,
        sessionId,
        action: "append",
        content: "Hack",
        summary: "Intento no autorizado",
      }),
    ).rejects.toThrow("Note not found or unauthorized");
  });

  test("appends content, creates snapshot of prior state, and updates note", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const noteId = await seedNote(t, userId, "Ideas", "Idea 1\nIdea 2");
    const sessionId = await seedSession(t, userId);

    const res = await t.mutation(internal.functions.notes.applyAiEdit, {
      noteId,
      userId,
      sessionId,
      action: "append",
      content: "### Conclusiones\n- Punto A",
      summary: "Se agregaron conclusiones de la sesión",
    });

    expect(res.success).toBe(true);

    const updatedNote = (await t.run((ctx) => ctx.db.get(noteId))) as any;
    expect(updatedNote?.body).toBe("Idea 1\nIdea 2\n\n### Conclusiones\n- Punto A");

    // Verify snapshot in noteVersions holds the state BEFORE the edit
    const snapshot = (await t.run((ctx) => ctx.db.get(res.previousVersionId))) as any;
    expect(snapshot?.body).toBe("Idea 1\nIdea 2");
    expect(snapshot?.author).toBe("ai");
    expect(snapshot?.actionType).toBe("ai_edit");
    expect(snapshot?.summary).toBe("Se agregaron conclusiones de la sesión");
    expect(snapshot?.sessionId).toBe(sessionId);
  });

  test("replaces body when action is replace", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const noteId = await seedNote(t, userId, "Borrador", "Texto desordenado");
    const sessionId = await seedSession(t, userId);

    const res = await t.mutation(internal.functions.notes.applyAiEdit, {
      noteId,
      userId,
      sessionId,
      action: "replace",
      content: "# Texto ordenado y limpio",
      summary: "Reescritura completa",
    });

    expect(res.success).toBe(true);

    const updatedNote = (await t.run((ctx) => ctx.db.get(noteId))) as any;
    expect(updatedNote?.body).toBe("# Texto ordenado y limpio");

    const snapshot = (await t.run((ctx) => ctx.db.get(res.previousVersionId))) as any;
    expect(snapshot?.body).toBe("Texto desordenado");
  });
});

describe("notes.remove cascade", () => {
  test("deletes associated versions when a note is removed", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const noteId = await seedNote(t, userId);

    await t.withIdentity({ subject: userId }).mutation(api.functions.noteVersions.createCheckpoint, {
      noteId,
      summary: "Checkpoint",
    });

    const versionsBefore = await t.run((ctx) =>
      ctx.db
        .query("noteVersions")
        .withIndex("by_noteId", (q) => q.eq("noteId", noteId))
        .collect(),
    );
    expect(versionsBefore).toHaveLength(1);

    await t.withIdentity({ subject: userId }).mutation(api.functions.notes.remove, { noteId });

    const noteAfter = await t.run((ctx) => ctx.db.get(noteId));
    expect(noteAfter).toBeNull();

    const versionsAfter = await t.run((ctx) =>
      ctx.db
        .query("noteVersions")
        .withIndex("by_noteId", (q) => q.eq("noteId", noteId))
        .collect(),
    );
    expect(versionsAfter).toHaveLength(0);
  });
});
