import Link from "next/link";

export default function TaskNotFound() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-10">
        <p className="font-medium text-gray-500">Erro 404</p>
        <h1 className="text-2xl font-bold">Tarefa não encontrada</h1>
        <p className="text-gray-600">
          A tarefa informada não existe ou já foi excluída.
        </p>
        <Link href="/" className="inline-block text-blue-700 underline">
          Voltar para tarefas
        </Link>
      </div>
    </main>
  );
}
