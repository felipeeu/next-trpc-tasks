"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { api } from "~/trpc/react";

export function TaskList() {
  const [data, query] = api.task.listPaginated.useSuspenseInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const sentinelRef = useRef<HTMLDivElement>(null);

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
      await utils.task.invalidate();

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

  const tasks = data.pages.flatMap((page) => page.items);

  const {
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
  } = query;

  const canLoadMore =
    hasNextPage && !isFetching && !isFetchNextPageError && !isPending;

  useEffect(() => {
    const element = sentinelRef.current;

    if (!element || !canLoadMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          observer.disconnect();
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [canLoadMore, fetchNextPage]);

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
      <div ref={sentinelRef} aria-hidden="true" className="h-1" />

      {isFetchingNextPage && (
        <p role="status" className="text-gray-600">
          Carregando mais tarefas...
        </p>
      )}

      {isFetchNextPageError && (
        <p role="alert" className="text-red-700">
          Não foi possível carregar mais tarefas. Tente novamente.
        </p>
      )}

      {hasNextPage && (
        <button
          type="button"
          disabled={isFetching || isPending}
          onClick={() => void fetchNextPage()}
          className="rounded-lg border px-4 py-2 disabled:opacity-50"
        >
          {isFetchNextPageError ? "Tentar novamente" : "Carregar mais"}
        </button>
      )}

      {!hasNextPage && tasks.length > 0 && (
        <p className="text-sm text-gray-500">
          Todas as tarefas foram carregadas.
        </p>
      )}
    </div>
  );
}
