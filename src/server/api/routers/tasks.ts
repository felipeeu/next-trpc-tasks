import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
}

type TaskStore = {
  tasks: Task[];
};

const globalForTasks = globalThis as typeof globalThis & {
  __nextTrpcTaskStore?: TaskStore;
};

// Mantém a mesma lista entre recarregamentos do servidor em desenvolvimento.
// A store continua restrita ao processo atual e é perdida quando ele reinicia.
const store = (globalForTasks.__nextTrpcTaskStore ??= {
  tasks: [],
});

const taskFields = {
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().optional(),
};
const taskIdSchema = z.object({
  id: z.string().uuid(),
});
const createTaskSchema = z.object(taskFields);

const updateTaskSchema = taskIdSchema.extend(taskFields);

const deleteTaskSchema = taskIdSchema;

const listPaginatedSchema = z.object({
  limit: z.number().int().min(1).max(50).default(10),
  cursor: z.number().int().min(0).nullish(),
});

export const taskRouter = createTRPCRouter({
  list: publicProcedure.query(() => store.tasks),
  create: publicProcedure.input(createTaskSchema).mutation(({ input }) => {
    const { title, description } = input;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      createdAt: new Date(),
    };

    store.tasks = [...store.tasks, newTask];

    return newTask;
  }),
  update: publicProcedure.input(updateTaskSchema).mutation(({ input }) => {
    const { id, title, description } = input;
    const index = store.tasks.findIndex((task) => task.id === id);
    const task = store.tasks[index];

    if (!task) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tarefa não encontrada.",
      });
    }

    const updatedTask: Task = {
      ...task,
      title,
      description,
    };

    store.tasks[index] = updatedTask;

    return updatedTask;
  }),
  delete: publicProcedure.input(deleteTaskSchema).mutation(({ input }) => {
    const { id } = input;
    const task = store.tasks.find((task) => task.id === id);

    if (!task) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tarefa não encontrada.",
      });
    }

    store.tasks = store.tasks.filter((task) => task.id !== id);

    return task;
  }),
  getById: publicProcedure.input(taskIdSchema).query(({ input }) => {
    const { id } = input;
    const task = store.tasks.find((task) => task.id === id);

    if (!task) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tarefa não encontrada.",
      });
    }

    return task;
  }),

  listPaginated: publicProcedure
    .input(listPaginatedSchema)
    .query(({ input }) => {
      const { limit } = input;
      // Um offset numérico mantém a paginação simples para a store em memória.
   
      const start = input.cursor ?? 0;

      const items = store.tasks.slice(start, start + limit);
      const nextPosition = start + items.length;

      return {
        items,
        nextCursor: nextPosition < store.tasks.length ? nextPosition : null,
      };
    }),
});
