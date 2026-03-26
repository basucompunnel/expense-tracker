"use client";

import { JSX } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { BudgetWithSpend } from "@/src/types/budget";
import { BudgetProgressBar } from "./budget-progress-bar";

interface BudgetListProps {
  budgets: BudgetWithSpend[];
  isLoading?: boolean;
  onDelete?: (budgetId: string) => Promise<void>;
  onEdit?: (budget: BudgetWithSpend) => void;
}

// EmptyState Component
function EmptyState(): JSX.Element {
  return (
    <Card className="p-8 bg-slate-50 dark:bg-slate-900 rounded-xs text-center">
      <p className="text-muted-foreground">
        No budgets set yet. Create one to get started!
      </p>
    </Card>
  );
}

// BudgetCard Component - Reusable for both overall and category budgets
interface BudgetCardProps {
  budget: BudgetWithSpend;
  isLoading?: boolean;
  onDelete?: (budgetId: string) => Promise<void>;
  onEdit?: (budget: BudgetWithSpend) => void;
  isOverall?: boolean;
}

function BudgetCard({
  budget,
  isLoading = false,
  onDelete,
  onEdit,
  isOverall = false,
}: BudgetCardProps): JSX.Element {
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this budget?")) {
      try {
        if (onDelete) {
          await onDelete(budget._id);
        }
      } catch (error) {
        console.error("Delete budget error:", error);
      }
    }
  };

  return (
    <Card className="p-4 bg-white dark:bg-slate-800 rounded-xs">
      <div className="flex items-start justify-between mb-3">
        <div>
          {isOverall ? (
            <>
              <p className="font-semibold">Total Monthly Limit</p>
              <p className="text-sm text-muted-foreground">
                March {new Date().getFullYear()}
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold">{budget.category}</p>
              <p className="text-sm text-muted-foreground">
                Budget: ₹{budget.amount.toFixed(2)}
              </p>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(budget)}
            disabled={isLoading}
            className="rounded-xs p-2"
            title="Edit budget"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
            className="rounded-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 p-2"
            title="Delete budget"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <BudgetProgressBar
        spent={budget.spent}
        budget={budget.amount}
        showAmount
      />
    </Card>
  );
}

// OverallBudgetSection Component
interface OverallBudgetSectionProps {
  budgets: BudgetWithSpend[];
  isLoading?: boolean;
  onDelete?: (budgetId: string) => Promise<void>;
  onEdit?: (budget: BudgetWithSpend) => void;
}

function OverallBudgetSection({
  budgets,
  isLoading = false,
  onDelete,
  onEdit,
}: OverallBudgetSectionProps): JSX.Element | null {
  if (budgets.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Overall Monthly Budget</h3>
      <div className="space-y-4">
        {budgets.map((budget) => (
          <BudgetCard
            key={budget._id}
            budget={budget}
            isLoading={isLoading}
            onDelete={onDelete}
            onEdit={onEdit}
            isOverall
          />
        ))}
      </div>
    </div>
  );
}

// CategoryBudgetsSection Component
interface CategoryBudgetsSectionProps {
  budgets: BudgetWithSpend[];
  isLoading?: boolean;
  onDelete?: (budgetId: string) => Promise<void>;
  onEdit?: (budget: BudgetWithSpend) => void;
}

function CategoryBudgetsSection({
  budgets,
  isLoading = false,
  onDelete,
  onEdit,
}: CategoryBudgetsSectionProps): JSX.Element | null {
  if (budgets.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Category Budgets</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {budgets.map((budget) => (
          <BudgetCard
            key={budget._id}
            budget={budget}
            isLoading={isLoading}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}

// Main BudgetList Component - Orchestrator
export function BudgetList({
  budgets,
  isLoading = false,
  onDelete,
  onEdit,
}: BudgetListProps): JSX.Element {
  if (budgets.length === 0) {
    return <EmptyState />;
  }

  // Separate overall and category budgets
  const overallBudgets = budgets.filter((b) => b.type === "overall");
  const categoryBudgets = budgets.filter((b) => b.type === "category");

  return (
    <div className="space-y-6">
      <OverallBudgetSection
        budgets={overallBudgets}
        isLoading={isLoading}
        onDelete={onDelete}
        onEdit={onEdit}
      />
      <CategoryBudgetsSection
        budgets={categoryBudgets}
        isLoading={isLoading}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </div>
  );
}
