"use client";
import { useState, type ComponentProps } from "react";
import { api } from "~/trpc/react";

export function CreateTaskForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const utils = api.useUtils();

  const { isPending, mutate } = api.task.create.useMutation({
    onMutate: () => {
      setFeedback(null);
    },
    onSuccess: async () => {
      await utils.task.list.invalidate();

      setTitle("");
      setDescription("");
      setFeedback({
        type: "success",
        message: "Tarefa criada com sucesso.",
      });
    },
    onError: (error) => {
      setFeedback({
        type: "error",
        message: error.message,
      });
    },
  });

  const handleSubmit: NonNullable<ComponentProps<"form">["onSubmit"]> = (
    event,
  ) => {
    event.preventDefault();

    if (isPending) return;

    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      setFeedback({
        type: "error",
        message: "O título é obrigatório.",
      });
      return;
    }

    mutate({
      title: normalizedTitle,
      description: description.trim() || undefined,
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
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

      <div className="space-y-2">
        <label htmlFor="title" className="block font-medium">
          Título
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={title}
          disabled={isPending}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white p-3"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block font-medium">
          Descrição (opcional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={description}
          disabled={isPending}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white p-3"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !title.trim()}
        className="rounded-lg bg-blue-700 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Criando..." : "Criar tarefa"}
      </button>
    </form>
  );
}
