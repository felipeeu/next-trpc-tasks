"use client";

import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect } from "react";

export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { reset: resetQueryErrors } = useQueryErrorResetBoundary();

  useEffect(() => {
    console.error(error);
  }, [error]);

  function handleRetry() {
    resetQueryErrors();
    reset();
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-10">
        <h1 className="text-2xl font-bold">
          Não foi possível carregar a página
        </h1>

        <p role="alert" className="text-gray-600">
          Ocorreu um erro. Tente novamente.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-lg bg-blue-700 px-4 py-2 text-white"
          >
            Tentar novamente
          </button>

          <Link href="/" className="text-blue-700 underline">
            Voltar para tarefas
          </Link>
        </div>
      </div>
    </main>
  );
}
