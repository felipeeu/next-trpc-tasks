import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
}

let tasks: Task[] = [];

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

export const taskRouter = createTRPCRouter({
  list: publicProcedure.query(() => tasks),
  create: publicProcedure.input(createTaskSchema).mutation(({ input }) => {
    const { title, description } = input;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      createdAt: new Date(),
    };

    tasks = [...tasks, newTask];

    return newTask;
  }),
  update: publicProcedure.input(updateTaskSchema).mutation(({ input }) => {
    const { id, title, description } = input;
    const index = tasks.findIndex((task) => task.id === id);
    const task = tasks[index];

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

    tasks[index] = updatedTask;

    return updatedTask;
  }),
  delete: publicProcedure.input(deleteTaskSchema).mutation(({ input }) => {
    const { id } = input;
    const task = tasks.find((task) => task.id === id);

    if (!task) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tarefa não encontrada.",
      });
    }

    tasks = tasks.filter((task) => task.id !== id);

    return task;
  }),
});
