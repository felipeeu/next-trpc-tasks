import Link from "next/link";

import { CreateTaskForm } from "~/app/_components/create-task-form";

export default function NewTaskPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
        <Link href="/" className="text-blue-700 underline">
          Voltar para tarefas
        </Link>

        <h1 className="text-3xl font-bold">Nova tarefa</h1>

        <CreateTaskForm />
      </div>
    </main>
  );
}
