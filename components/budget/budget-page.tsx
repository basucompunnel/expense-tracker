"use client";

import { JSX, useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/wrappers/protected-route";
import { budgetService } from "@/src/services/budgetService";
import { BudgetWithSpend, CreateBudgetInput } from "@/src/types/budget";
import { BudgetForm } from "./budget-form";
import { BudgetList } from "./budget-list";
import { Button } from "@/components/ui/button";
import {
  GenerateDefaultBudgetsModal,
  DefaultBudgetRow,
} from "./generate-default-budgets-modal";

export function BudgetPage(): JSX.Element {
  const [budgets, setBudgets] = useState<BudgetWithSpend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingBudget, setEditingBudget] = useState<BudgetWithSpend | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Load budgets on mount
  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    setIsLoading(true);
    setError("");

    const response = await budgetService.list();

    if (response.success) {
      setBudgets(response.budgets as BudgetWithSpend[]);
    } else {
      setError(response.message || "Failed to load budgets");
    }

    setIsLoading(false);
  };

  const handleCreateBudget = async (data: CreateBudgetInput) => {
    setIsSubmitting(true);
    setError("");

    const response = await budgetService.create(data);

    if (response.success) {
      // Reload budgets
      await loadBudgets();
      setEditingBudget(null);
    } else {
      setError(response.message || "Failed to create budget");
    }

    setIsSubmitting(false);
  };

  const handleDeleteBudget = async (budgetId: string) => {
    const response = await budgetService.delete(budgetId);

    if (response.success) {
      // Reload budgets
      await loadBudgets();
    } else {
      setError(response.message || "Failed to delete budget");
    }
  };

  const handleEditBudget = (budget: BudgetWithSpend) => {
    setEditingBudget(budget);
  };

  const handleCancelEdit = () => {
    setEditingBudget(null);
  };

  const handleGenerateDefaultBudgets = async (
    selectedBudgets: DefaultBudgetRow[]
  ) => {
    setIsSubmitting(true);
    setError("");

    try {
      // Create selected budgets
      for (const budget of selectedBudgets) {
        await budgetService.create({
          type: budget.type,
          amount: budget.amount,
          category: budget.category,
        });
      }

      // Reload budgets
      await loadBudgets();
      setShowGenerateModal(false);
    } catch (err) {
      setError("Failed to generate budgets");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col flex-1">
        <main className="w-full max-w-5xl mx-auto px-4 py-8 flex-1">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Budget Management</h1>
              <p className="text-lg text-muted-foreground">
                Set and track your monthly spending budgets
              </p>
            </div>
            <Button
              onClick={() => setShowGenerateModal(true)}
              disabled={isSubmitting}
              className="rounded-xs mt-2"
              variant="outline"
            >
              Generate Defaults
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {/* Budget Form */}
          <div className="mb-8">
            <BudgetForm
              onSubmit={handleCreateBudget}
              isLoading={isSubmitting}
              editingBudget={editingBudget}
              onCancel={handleCancelEdit}
            />
          </div>

          {/* Budgets List */}
          <div>
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading budgets...
              </div>
            ) : (
              <BudgetList
                budgets={budgets}
                isLoading={isSubmitting}
                onDelete={handleDeleteBudget}
                onEdit={handleEditBudget}
              />
            )}
          </div>

          {/* Generate Default Budgets Modal */}
          <GenerateDefaultBudgetsModal
            isOpen={showGenerateModal}
            isLoading={isSubmitting}
            onConfirm={handleGenerateDefaultBudgets}
            onCancel={() => setShowGenerateModal(false)}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
}
