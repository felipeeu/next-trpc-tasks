import Link from "next/link";
import { TaskList } from "~/app/_components/task-list";
import { api, HydrateClient } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  await api.task.listPaginated.prefetchInfinite({ limit: 10 });

  return (
    <HydrateClient>
      <main className="min-h-screen bg-gray-50 text-gray-900">
        <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
          <h1 className="text-3xl font-bold">Tarefas</h1>
          <Link
            href="/tasks/new"
            className="inline-block rounded-lg bg-blue-700 px-4 py-2 text-white"
          >
            Nova tarefa
          </Link>
          <TaskList />
        </div>
      </main>
    </HydrateClient>
  );
}
