"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useExpenses } from "@/src/hooks/useExpenses";
import { ExpenseCategory, ExpenseFilterOptions } from "@/src/types/expense";
import { ProtectedRoute } from "@/components/wrappers/protected-route";
import { ExpenseList } from "@/components/expense/expense-list";
import { FilterPanel } from "@/components/expense/filter-panel";
import { AddExpenseModal } from "@/components/expense/add-expense-modal";
import { BulkAddModal } from "@/components/expense/bulk-add-modal";
import { ExpenseReportModal } from "@/components/expense/expense-report-modal";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const router = useRouter();
  const { expenses, isLoading, error, fetchExpenses, applyFilters, delete: deleteExpense, bulkDelete } =
    useExpenses();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [filters, setFilters] = useState<ExpenseFilterOptions>({});

  // Load expenses on mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleFilterChange = async (newFilters: ExpenseFilterOptions) => {
    setFilters(newFilters);
    // If filters are empty (reset), fetch all expenses with default pagination
    if (Object.keys(newFilters).length === 0) {
      await fetchExpenses({ limit: 50, offset: 0 });
    } else {
      await applyFilters(newFilters);
    }
  };

  const handleAddExpenseSuccess = () => {
    setShowAddModal(false);
    fetchExpenses(filters);
  };

  const handleRefreshExpenses = async () => {
    await fetchExpenses(filters);
  };

  const handleBulkDelete = async (ids: string[]) => {
    return await bulkDelete(ids);
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col flex-1">
        <main className="w-full max-w-5xl mx-auto px-4 py-8 flex-1">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Your Expenses</h1>
              <p className="text-lg text-muted-foreground">
                Track and manage your expenses
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push("/budgets")}
                variant="outline"
                className="rounded-none"
              >
                Budget
              </Button>
              <Button
                onClick={() => setShowReportModal(true)}
                variant="outline"
                className="rounded-none"
              >
                Report
              </Button>
              <Button
                onClick={() => setShowBulkModal(true)}
                variant="outline"
                className="rounded-none"
              >
                Add Multiple
              </Button>
              <Button
                onClick={() => setShowAddModal(true)}
                className="rounded-none"
              >
                Add Expense
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          <FilterPanel onFilterChange={handleFilterChange} isLoading={isLoading} />

          <ExpenseList
            expenses={expenses}
            isLoading={isLoading}
            onDelete={deleteExpense}
            onBulkDelete={handleBulkDelete}
            onRefresh={handleRefreshExpenses}
          />

          {showAddModal && (
            <AddExpenseModal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              onSuccess={handleAddExpenseSuccess}
            />
          )}

          {showBulkModal && (
            <BulkAddModal
              isOpen={showBulkModal}
              onClose={() => setShowBulkModal(false)}
              onSuccess={() => {
                setShowBulkModal(false);
                fetchExpenses(filters);
              }}
            />
          )}

          {showReportModal && (
            <ExpenseReportModal
              isOpen={showReportModal}
              isLoading={isLoading}
              onClose={() => setShowReportModal(false)}
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
