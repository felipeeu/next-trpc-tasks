import { z } from "zod";
import { beforeEach, describe, expect, test } from "bun:test";
import { createCaller } from "~/server/api/root";
import { TRPCError } from "@trpc/server";

const caller = createCaller({
  headers: new Headers(),
});

beforeEach(async () => {
  const tasks = await caller.task.list();

  for (const task of tasks) {
    await caller.task.delete({ id: task.id });
  }
});

describe("task router", () => {
  test("returns an empty list when there are no tasks", async () => {
    const tasks = await caller.task.list();

    expect(tasks).toEqual([]);
  });

  test("creates a task and includes it in the list", async () => {
    const input = {
      title: "Review documentation",
      description: "Review the tRPC setup",
    };

    const task = await caller.task.create(input);

    expect(task).toMatchObject(input);
    expect(z.string().uuid().safeParse(task.id).success).toBe(true);
    expect(task.createdAt).toBeInstanceOf(Date);

    const tasks = await caller.task.list();

    expect(tasks).toHaveLength(1);
    expect(tasks).toContainEqual(task);
  });

test("rejects a whitespace-only title without creating a task", async () => {
  const result = await caller.task
    .create({ title: "   " })
    .catch((error: unknown) => error);

  expect(result).toBeInstanceOf(TRPCError);
  expect(result).toMatchObject({
    code: "BAD_REQUEST",
  });

  expect(await caller.task.list()).toEqual([]);
});

  test("updates a task while preserving its id and creation date", async () => {
    const original = await caller.task.create({
      title: "Original title",
      description: "Original description",
    });

    const updated = await caller.task.update({
      id: original.id,
      title: "Updated title",
      description: "Updated description",
    });

    expect(updated).toEqual({
      id: original.id,
      title: "Updated title",
      description: "Updated description",
      createdAt: original.createdAt,
    });

    const tasks = await caller.task.list();

    expect(tasks).toEqual([updated]);
  });

  test("deletes a task while preserving the others", async () => {
    const first = await caller.task.create({
      title: "First task",
    });

    const second = await caller.task.create({
      title: "Second task",
    });

    const deleted = await caller.task.delete({ id: first.id });

    expect(deleted).toEqual(first);

    const tasks = await caller.task.list();

    expect(tasks).toEqual([second]);
  });

test("returns NOT_FOUND when updating a nonexistent task", async () => {
  const result = await caller.task
    .update({
      id: crypto.randomUUID(),
      title: "Updated title",
    })
    .catch((error: unknown) => error);

  expect(result).toBeInstanceOf(TRPCError);
  expect(result).toMatchObject({
    code: "NOT_FOUND",
    message: "Tarefa não encontrada.",
  });

  expect(await caller.task.list()).toEqual([]);
});

test("returns a task by its id", async () => {
  const created = await caller.task.create({
    title: "Task to edit",
    description: "Original description",
  });

  const task = await caller.task.getById({ id: created.id });

  expect(task).toEqual(created);
});

test("returns NOT_FOUND when retrieving a nonexistent task", async () => {
  const result = await caller.task
    .getById({ id: crypto.randomUUID() })
    .catch((error: unknown) => error);

  expect(result).toBeInstanceOf(TRPCError);
  expect(result).toMatchObject({
    code: "NOT_FOUND",
  });
});
});
