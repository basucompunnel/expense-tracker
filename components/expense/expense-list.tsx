"use client";

import { Expense } from "@/src/types/expense";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EditExpenseModal } from "./edit-expense-modal";
import { ExpenseSelectionBar } from "./expense-selection-bar";
import { Edit2, Trash2, Check } from "lucide-react";

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<{ success: boolean }>;
  onBulkDelete: (ids: string[]) => Promise<{ success: boolean; data?: any }>;
  onRefresh: () => Promise<void>;
}

interface ExpenseCardHeaderProps {
  description: string;
  category: string;
  date: string;
  amount: number;
  isSelected: boolean;
  onSelectChange: () => void;
}

function ExpenseCardHeader({
  description,
  category,
  date,
  amount,
  isSelected,
  onSelectChange,
}: ExpenseCardHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <button
        onClick={onSelectChange}
        className={`mt-1 flex h-5 w-5 items-center justify-center rounded border border-slate-300 dark:border-slate-600 transition-colors ${
          isSelected
            ? "bg-blue-600 border-blue-600 text-white"
            : "hover:border-blue-400 dark:hover:border-blue-400"
        }`}
        title="Select this expense"
      >
        {isSelected && <Check className="h-4 w-4" />}
      </button>
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
  isSelected: boolean;
  onSelectChange: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

function ExpenseCard({
  expense,
  isSelected,
  onSelectChange,
  onEdit,
  onDelete,
}: ExpenseCardProps) {
  return (
    <Card
      className={`rounded-xs p-4 transition-all relative h-[120px] ${
        isSelected
          ? "ring-2 ring-blue-600 shadow-md"
          : "hover:shadow-md"
      }`}
    >
      <div className="flex flex-col gap-3">
        <ExpenseCardHeader
          description={expense.description}
          category={expense.category}
          date={new Date(expense.date).toLocaleDateString()}
          amount={expense.amount}
          isSelected={isSelected}
          onSelectChange={onSelectChange}
        />
      </div>
      <div className="absolute bottom-4 right-4">
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
  onBulkDelete,
  onRefresh,
}: ExpenseListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isSelectAll =
    expenses.length > 0 && selectedIds.size === expenses.length;

  const handleSelectChange = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(expenses.map((e) => e._id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await onDelete(id);
      setDeleteConfirmId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleBulkDeleteClick = () => {
    setBulkDeleteIds(Array.from(selectedIds));
  };

  const handleBulkDelete = async () => {
    if (!bulkDeleteIds) return;

    setIsDeleting(true);
    try {
      const result = await onBulkDelete(bulkDeleteIds);
      if (result.success) {
        setBulkDeleteIds(null);
        setSelectedIds(new Set());
        await onRefresh();
      }
    } finally {
      setIsDeleting(false);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">
        {expenses.map((expense) => (
          <ExpenseCard
            key={expense._id}
            expense={expense}
            isSelected={selectedIds.has(expense._id)}
            onSelectChange={() => handleSelectChange(expense._id)}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      <ExpenseSelectionBar
        selectedCount={selectedIds.size}
        totalCount={expenses.length}
        isSelectAll={isSelectAll}
        isDeleting={isDeleting}
        onSelectAll={handleSelectAll}
        onDelete={handleBulkDeleteClick}
        onClear={handleClearSelection}
      />

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

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <Card className="rounded-xs p-6 max-w-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Delete Expense</h2>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this expense? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="rounded-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                className="rounded-xs"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {bulkDeleteIds && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <Card className="rounded-xs p-6 max-w-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Delete Expenses</h2>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete {bulkDeleteIds.length} expense
                {bulkDeleteIds.length !== 1 ? "s" : ""}? This action cannot be
                undone.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setBulkDeleteIds(null)}
                disabled={isDeleting}
                className="rounded-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="rounded-xs"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
