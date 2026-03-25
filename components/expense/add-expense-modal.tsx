"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "@/components/expense/expense-form";
import { CreateExpenseInput } from "@/src/types/expense";
import { useExpenses } from "@/src/hooks/useExpenses";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddExpenseModal({
  isOpen,
  onClose,
  onSuccess,
}: AddExpenseModalProps) {
  const { create, isLoading } = useExpenses();

  const handleSubmit = async (data: CreateExpenseInput) => {
    const result = await create(data);
    if (result.success) {
      onSuccess();
    }
    return result;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="rounded-none w-full max-w-md max-h-[90vh] overflow-y-auto p-0">
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Add Expense</h2>
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
            submitButtonLabel="Add Expense"
          />
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full rounded-xs mt-2"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
