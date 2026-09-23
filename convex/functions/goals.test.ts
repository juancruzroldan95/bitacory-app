import { expect, test, describe } from "vitest";
import { api } from "../_generated/api";
import { makeT } from "../../testUtils";

async function seedUser(t: ReturnType<typeof makeT>) {
  return t.run((ctx) => ctx.db.insert("users", {}));
}

async function seedGoal(
  t: ReturnType<typeof makeT>,
  userId: Awaited<ReturnType<typeof seedUser>>,
  title = "Objetivo de prueba",
  milestones = ["Paso 1", "Paso 2"],
) {
  return t.run((ctx) =>
    ctx.db.insert("goals", {
      userId,
      title,
      description: "Descripción de prueba",
      category: "Emocional",
      status: "in_progress",
      milestones: milestones.map((m, index) => ({
        id: `m-${index}`,
        title: m,
        completed: false,
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  );
}

// ---------------------------------------------------------------------------
// goals.list
// ---------------------------------------------------------------------------

describe("goals.list", () => {
  test("returns empty array when unauthenticated", async () => {
    const t = makeT();
    const result = await t.query(api.functions.goals.list, {});
    expect(result).toEqual([]);
  });

  test("returns goals for the authenticated user", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    await seedGoal(t, userId, "Meta 1");
    await seedGoal(t, userId, "Meta 2");

    const goals = await t.withIdentity({ subject: userId }).query(api.functions.goals.list, {});
    expect(goals).toHaveLength(2);
  });

  test("does not return goals belonging to another user", async () => {
    const t = makeT();
    const userA = await seedUser(t);
    const userB = await seedUser(t);
    await seedGoal(t, userA, "Meta de A");

    const goalsOfB = await t.withIdentity({ subject: userB }).query(api.functions.goals.list, {});
    expect(goalsOfB).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// goals.get
// ---------------------------------------------------------------------------

describe("goals.get", () => {
  test("returns null when unauthenticated", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const goalId = await seedGoal(t, userId);

    const result = await t.query(api.functions.goals.get, { goalId });
    expect(result).toBeNull();
  });

  test("returns goal when authenticated as owner", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const goalId = await seedGoal(t, userId, "Mi Meta");

    const goal = await t.withIdentity({ subject: userId }).query(api.functions.goals.get, { goalId });
    expect(goal).not.toBeNull();
    expect(goal?.title).toBe("Mi Meta");
  });

  test("returns null when goal belongs to another user", async () => {
    const t = makeT();
    const userA = await seedUser(t);
    const userB = await seedUser(t);
    const goalId = await seedGoal(t, userA);

    const goal = await t.withIdentity({ subject: userB }).query(api.functions.goals.get, { goalId });
    expect(goal).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// goals.create
// ---------------------------------------------------------------------------

describe("goals.create", () => {
  test("throws when unauthenticated", async () => {
    const t = makeT();
    await expect(
      t.mutation(api.functions.goals.create, {
        title: "Nueva meta",
      }),
    ).rejects.toThrow("Not authenticated");
  });

  test("creates goal with initial milestones for authenticated user", async () => {
    const t = makeT();
    const userId = await seedUser(t);

    const goalId = await t.withIdentity({ subject: userId }).mutation(api.functions.goals.create, {
      title: "Gestionar ansiedad laboral",
      description: "Aprender a frenar ante el desborde",
      category: "Emocional",
      milestones: ["Paso A", "Paso B"],
    });

    const created = await t.run((ctx) => ctx.db.get(goalId));
    expect(created?.title).toBe("Gestionar ansiedad laboral");
    expect(created?.status).toBe("in_progress");
    expect(created?.milestones).toHaveLength(2);
    expect(created?.milestones[0].completed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// goals.update
// ---------------------------------------------------------------------------

describe("goals.update", () => {
  test("throws when unauthenticated", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const goalId = await seedGoal(t, userId);

    await expect(
      t.mutation(api.functions.goals.update, {
        goalId,
        title: "Nuevo título",
      }),
    ).rejects.toThrow("Not authenticated");
  });

  test("throws when modifying goal of another user", async () => {
    const t = makeT();
    const userA = await seedUser(t);
    const userB = await seedUser(t);
    const goalId = await seedGoal(t, userA);

    await expect(
      t.withIdentity({ subject: userB }).mutation(api.functions.goals.update, {
        goalId,
        title: "Hack",
      }),
    ).rejects.toThrow("Goal not found");
  });

  test("updates goal fields when authenticated as owner", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const goalId = await seedGoal(t, userId);

    await t.withIdentity({ subject: userId }).mutation(api.functions.goals.update, {
      goalId,
      title: "Título actualizado",
      status: "paused",
    });

    const updated = await t.run((ctx) => ctx.db.get(goalId));
    expect(updated?.title).toBe("Título actualizado");
    expect(updated?.status).toBe("paused");
  });
});

// ---------------------------------------------------------------------------
// goals.toggleMilestone
// ---------------------------------------------------------------------------

describe("goals.toggleMilestone", () => {
  test("toggles milestone and marks goal completed when all milestones done", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const goalId = await seedGoal(t, userId, "Meta con 2 pasos", ["Paso 1", "Paso 2"]);

    // Complete first milestone (m-0)
    await t.withIdentity({ subject: userId }).mutation(api.functions.goals.toggleMilestone, {
      goalId,
      milestoneId: "m-0",
    });

    let goal = await t.run((ctx) => ctx.db.get(goalId));
    expect(goal?.milestones[0].completed).toBe(true);
    expect(goal?.milestones[0].completedAt).toBeDefined();
    expect(goal?.status).toBe("in_progress");

    // Complete second milestone (m-1) -> all completed
    await t.withIdentity({ subject: userId }).mutation(api.functions.goals.toggleMilestone, {
      goalId,
      milestoneId: "m-1",
    });

    goal = await t.run((ctx) => ctx.db.get(goalId));
    expect(goal?.milestones[1].completed).toBe(true);
    expect(goal?.status).toBe("completed");

    // Untoggle first milestone -> reverts to in_progress
    await t.withIdentity({ subject: userId }).mutation(api.functions.goals.toggleMilestone, {
      goalId,
      milestoneId: "m-0",
    });

    goal = await t.run((ctx) => ctx.db.get(goalId));
    expect(goal?.milestones[0].completed).toBe(false);
    expect(goal?.status).toBe("in_progress");
  });

  test("throws when milestone ID does not exist", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const goalId = await seedGoal(t, userId);

    await expect(
      t.withIdentity({ subject: userId }).mutation(api.functions.goals.toggleMilestone, {
        goalId,
        milestoneId: "inexistente",
      }),
    ).rejects.toThrow("Milestone not found");
  });
});

// ---------------------------------------------------------------------------
// goals.addMilestone & removeMilestone
// ---------------------------------------------------------------------------

describe("goals.addMilestone and removeMilestone", () => {
  test("adds a new milestone to an existing goal", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const goalId = await seedGoal(t, userId, "Meta", ["Paso 1"]);

    await t.withIdentity({ subject: userId }).mutation(api.functions.goals.addMilestone, {
      goalId,
      title: "Paso agregado",
    });

    const goal = await t.run((ctx) => ctx.db.get(goalId));
    expect(goal?.milestones).toHaveLength(2);
    expect(goal?.milestones[1].title).toBe("Paso agregado");
  });

  test("removes a milestone from an existing goal", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const goalId = await seedGoal(t, userId, "Meta", ["Paso 1", "Paso 2"]);

    await t.withIdentity({ subject: userId }).mutation(api.functions.goals.removeMilestone, {
      goalId,
      milestoneId: "m-0",
    });

    const goal = await t.run((ctx) => ctx.db.get(goalId));
    expect(goal?.milestones).toHaveLength(1);
    expect(goal?.milestones[0].id).toBe("m-1");
  });
});

// ---------------------------------------------------------------------------
// goals.remove and note unlinking
// ---------------------------------------------------------------------------

describe("goals.remove", () => {
  test("removes goal and unlinks associated notes", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const goalId = await seedGoal(t, userId);

    const noteId = await t.run((ctx) =>
      ctx.db.insert("notes", {
        userId,
        title: "Nota vinculada",
        body: "Reflexión",
        goalId,
        updatedAt: Date.now(),
      }),
    );

    await t.withIdentity({ subject: userId }).mutation(api.functions.goals.remove, { goalId });

    const deletedGoal = await t.run((ctx) => ctx.db.get(goalId));
    expect(deletedGoal).toBeNull();

    const updatedNote = await t.run((ctx) => ctx.db.get(noteId));
    expect(updatedNote?.goalId).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// notes.getByGoalId
// ---------------------------------------------------------------------------

describe("notes.getByGoalId", () => {
  test("returns notes linked to the goal for the authenticated user", async () => {
    const t = makeT();
    const userId = await seedUser(t);
    const goalId = await seedGoal(t, userId);

    await t.run((ctx) =>
      ctx.db.insert("notes", {
        userId,
        title: "Nota 1",
        body: "Texto 1",
        goalId,
        updatedAt: Date.now(),
      }),
    );
    await t.run((ctx) =>
      ctx.db.insert("notes", {
        userId,
        title: "Nota 2",
        body: "Texto 2",
        updatedAt: Date.now(),
      }),
    );

    const linkedNotes = await t
      .withIdentity({ subject: userId })
      .query(api.functions.notes.getByGoalId, { goalId });

    expect(linkedNotes).toHaveLength(1);
    expect(linkedNotes[0].title).toBe("Nota 1");
  });
});
