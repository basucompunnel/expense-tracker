"use client";

import { JSX, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { ExpenseCategory } from "@/src/types/expense";

export interface DefaultBudgetRow {
  id: string;
  name: string;
  type: "overall" | "category";
  amount: number;
  category?: ExpenseCategory;
  included: boolean;
}

interface GenerateDefaultBudgetsModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: (budgets: DefaultBudgetRow[]) => Promise<void>;
  onCancel: () => void;
}

const defaultCategoryAmounts: Record<ExpenseCategory, number> = {
  [ExpenseCategory.GROCERIES]: 5000,
  [ExpenseCategory.RESTAURANTS]: 3000,
  [ExpenseCategory.TRANSPORT]: 2500,
  [ExpenseCategory.FUEL]: 2000,
  [ExpenseCategory.UTILITIES]: 2000,
  [ExpenseCategory.ENTERTAINMENT]: 2000,
  [ExpenseCategory.SHOPPING]: 3000,
  [ExpenseCategory.HEALTHCARE]: 1500,
  [ExpenseCategory.PERSONAL_CARE]: 1000,
  [ExpenseCategory.PETS]: 1500,
  [ExpenseCategory.SUBSCRIPTIONS]: 1000,
  [ExpenseCategory.GIFTS]: 2000,
  [ExpenseCategory.RENT]: 15000,
  [ExpenseCategory.OTHER]: 1000,
};

export function GenerateDefaultBudgetsModal({
  isOpen,
  isLoading = false,
  onConfirm,
  onCancel,
}: GenerateDefaultBudgetsModalProps): JSX.Element | null {
  const initialBudgets: DefaultBudgetRow[] = useMemo(
    () => [
      {
        id: "overall",
        name: "Overall Monthly Budget",
        type: "overall",
        amount: 50000,
        included: true,
      },
      ...Object.values(ExpenseCategory).map((cat) => ({
        id: cat,
        name: cat,
        type: "category" as const,
        category: cat,
        amount: defaultCategoryAmounts[cat],
        included: true,
      })),
    ],
    []
  );

  const [budgets, setBudgets] = useState<DefaultBudgetRow[]>(initialBudgets);

  const handleAmountChange = (id: string, newAmount: number) => {
    setBudgets((prev) =>
      prev.map((budget) =>
        budget.id === id ? { ...budget, amount: newAmount } : budget
      )
    );
  };

  const handleToggleInclude = (id: string) => {
    setBudgets((prev) =>
      prev.map((budget) =>
        budget.id === id ? { ...budget, included: !budget.included } : budget
      )
    );
  };

  const handleConfirm = async () => {
    const selectedBudgets = budgets.filter((b) => b.included);
    await onConfirm(selectedBudgets);
  };

  if (!isOpen) return null;

  const totalAmount = budgets
    .filter((b) => b.included)
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <Card className="rounded-xs max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Generate Default Budgets</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Review and edit the default budget amounts before confirming
              </p>
            </div>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-3 font-semibold w-12">
                    <input
                      type="checkbox"
                      checked={budgets.every((b) => b.included)}
                      onChange={(e) =>
                        setBudgets((prev) =>
                          prev.map((b) => ({
                            ...b,
                            included: e.target.checked,
                          }))
                        )
                      }
                      disabled={isLoading}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="text-left py-3 px-3 font-semibold">Budget Name</th>
                  <th className="text-right py-3 px-3 font-semibold">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((budget) => (
                  <tr
                    key={budget.id}
                    className={`border-b border-slate-100 dark:border-slate-800 ${
                      budget.included
                        ? ""
                        : "opacity-50 bg-slate-50 dark:bg-slate-900/50"
                    }`}
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={budget.included}
                        onChange={() => handleToggleInclude(budget.id)}
                        disabled={isLoading}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3 font-medium">{budget.name}</td>
                    <td className="text-right py-3 px-3">
                      <Input
                        type="number"
                        value={budget.amount}
                        onChange={(e) =>
                          handleAmountChange(budget.id, parseFloat(e.target.value) || 0)
                        }
                        disabled={isLoading || !budget.included}
                        className="w-40 text-right rounded-xs"
                        min="0"
                        step="100"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Overall Budget:</span>
              <span className="text-lg font-bold">
                ₹{budgets
                  .filter((b) => b.type === "overall" && b.included)
                  .reduce((sum, b) => sum + b.amount, 0)
                  .toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Categories Total:</span>
              <span className="text-lg font-bold">
                ₹{budgets
                  .filter((b) => b.type === "category" && b.included)
                  .reduce((sum, b) => sum + b.amount, 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="rounded-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading || budgets.every((b) => !b.included)}
              className="rounded-xs"
            >
              {isLoading ? "Creating..." : "Create Budgets"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
