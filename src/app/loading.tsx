export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p role="status" className="animate-pulse text-gray-600">
          Carregando...
        </p>
      </div>
    </main>
  );
}