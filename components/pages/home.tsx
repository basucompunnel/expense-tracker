import { ProtectedRoute } from "@/components/wrappers/protected-route";

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col flex-1 items-center justify-center">
        <main className="w-full max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Expense Tracker</h1>
          <p className="text-lg text-muted-foreground">Start tracking your expenses today.</p>
        </main>
      </div>
    </ProtectedRoute>
  );
}
