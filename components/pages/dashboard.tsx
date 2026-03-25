"use client";

import { useEffect, useState } from "react";
import { useExpenses } from "@/src/hooks/useExpenses";
import { ExpenseCategory, ExpenseFilterOptions } from "@/src/types/expense";
import { ProtectedRoute } from "@/components/wrappers/protected-route";
import { ExpenseList } from "@/components/expense/expense-list";
import { FilterPanel } from "@/components/expense/filter-panel";
import { AddExpenseModal } from "@/components/expense/add-expense-modal";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { expenses, isLoading, error, fetchExpenses, applyFilters, delete: deleteExpense } =
    useExpenses();
  const [showAddModal, setShowAddModal] = useState(false);
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
            <Button
              onClick={() => setShowAddModal(true)}
              className="rounded-none"
            >
              Add Expense
            </Button>
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
            onRefresh={handleRefreshExpenses}
          />

          {showAddModal && (
            <AddExpenseModal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              onSuccess={handleAddExpenseSuccess}
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
