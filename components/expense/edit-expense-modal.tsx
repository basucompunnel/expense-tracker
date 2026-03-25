"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "@/components/expense/expense-form";
import { Expense, UpdateExpenseInput } from "@/src/types/expense";
import { useExpenses } from "@/src/hooks/useExpenses";

interface EditExpenseModalProps {
  isOpen: boolean;
  expense: Expense;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditExpenseModal({
  isOpen,
  expense,
  onClose,
  onSuccess,
}: EditExpenseModalProps) {
  const { update, isLoading } = useExpenses();

  const handleSubmit = async (data: UpdateExpenseInput) => {
    const result = await update(expense._id, data);
    if (result.success) {
      onSuccess();
    }
    return result;
  };

  if (!isOpen) return null;

  const initialValues = {
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    date: expense.date instanceof Date 
      ? expense.date.toISOString().split("T")[0]
      : new Date(expense.date).toISOString().split("T")[0],
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="rounded-none w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Edit Expense</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-none"
          >
            ✕
          </Button>
        </div>

        <div className="p-6">
          <ExpenseForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            initialValues={initialValues}
            submitButtonLabel="Update Expense"
          />
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full rounded-none mt-2"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
