"use client";

import Link from "next/link";
import { useState } from "react";

import { api } from "~/trpc/react";

export function TaskList() {
  const [tasks] = api.task.list.useSuspenseQuery();
  const utils = api.useUtils();

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { isPending, mutate, variables } = api.task.delete.useMutation({
    onMutate: () => {
      setFeedback(null);
    },
    onSuccess: async () => {
      await utils.task.list.invalidate();

      setFeedback({
        type: "success",
        message: "Tarefa excluída.",
      });
    },
    onError: (error) => {
      setFeedback({
        type: "error",
        message: error.message,
      });
    },
  });

  return (
    <div className="space-y-4">
      {feedback && (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          className={
            feedback.type === "error" ? "text-red-700" : "text-green-700"
          }
        >
          {feedback.message}
        </p>
      )}

      {tasks.length === 0 ? (
        <p className="text-gray-600">Nenhuma tarefa cadastrada.</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map(({ id, description, title, createdAt }) => (
            <li key={id} className="rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold">{title}</h2>

              {description && (
                <p className="mt-2 whitespace-pre-wrap text-gray-600">
                  {description}
                </p>
              )}
              <time
                dateTime={createdAt.toISOString()}
                className="mt-3 block text-sm text-gray-500"
              >
                Criada em{" "}
                {createdAt.toLocaleString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                })}
              </time>
              <div className="flex justify-between">
                <button
                  type="button"
                  disabled={isPending}
                  aria-label={`Excluir tarefa: ${title}`}
                  onClick={() => mutate({ id })}
                  className="mt-4 rounded border border-red-300 px-3 py-2 text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending && variables?.id === id
                    ? "Excluindo..."
                    : "Excluir"}
                </button>
                <Link
                  href={`/tasks/${id}/edit`}
                  className="mt-4 mr-4 inline-block text-blue-700 underline"
                >
                  Editar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
