"use client";

import { Expense } from "@/src/types/expense";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EditExpenseModal } from "./edit-expense-modal";
import { Edit2, Trash2 } from "lucide-react";

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<{ success: boolean }>;
  onRefresh: () => Promise<void>;
}

interface ExpenseCardHeaderProps {
  description: string;
  category: string;
  date: string;
  amount: number;
}

function ExpenseCardHeader({
  description,
  category,
  date,
  amount,
}: ExpenseCardHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="font-semibold text-base">{description}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-xs">
            {category}
          </span>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
      </div>
      <p className="text-2xl font-bold ml-4">${amount.toFixed(2)}</p>
    </div>
  );
}

interface ExpenseCardActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

function ExpenseCardActions({ onEdit, onDelete }: ExpenseCardActionsProps) {
  return (
    <div className="flex gap-2 justify-end">
      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
        className="rounded-xs p-2"
        title="Edit expense"
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        className="rounded-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 p-2"
        title="Delete expense"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  return (
    <Card className="rounded-xs p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-3">
        <ExpenseCardHeader
          description={expense.description}
          category={expense.category}
          date={new Date(expense.date).toLocaleDateString()}
          amount={expense.amount}
        />
        <ExpenseCardActions
          onEdit={() => onEdit(expense)}
          onDelete={() => onDelete(expense._id)}
        />
      </div>
    </Card>
  );
}

export function ExpenseList({ 
  expenses, 
  isLoading, 
  onDelete, 
  onRefresh 
}: ExpenseListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      await onDelete(id);
    }
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setEditingId(expense._id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading expenses...</p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card className="rounded-none p-8 text-center">
        <p className="text-muted-foreground mb-4">No expenses yet</p>
        <p className="text-sm text-muted-foreground">
          Click "Add Expense" to create your first expense
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {expenses.map((expense) => (
          <ExpenseCard
            key={expense._id}
            expense={expense}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {selectedExpense && editingId && (
        <EditExpenseModal
          isOpen={true}
          expense={selectedExpense}
          onClose={() => {
            setEditingId(null);
            setSelectedExpense(null);
          }}
          onSuccess={() => {
            setEditingId(null);
            setSelectedExpense(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
