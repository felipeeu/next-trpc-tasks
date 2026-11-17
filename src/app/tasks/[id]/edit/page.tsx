import { TRPCError } from "@trpc/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { EditTaskForm } from "~/app/_components/edit-task-form";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!z.string().uuid().safeParse(id).success) {
    notFound();
  }

  const task = await api.task.getById({ id }).catch((error: unknown) => {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      notFound();
    }

    throw error;
  });

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
        <Link href="/" className="text-blue-700 underline">
          Voltar para tarefas
        </Link>

        <h1 className="text-3xl font-bold">Editar tarefa</h1>

        <EditTaskForm key={task.id} task={task} />
      </div>
    </main>
  );
}
