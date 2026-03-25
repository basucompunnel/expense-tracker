"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CreateExpenseInput, ExpenseCategory } from "@/src/types/expense";
import { useState } from "react";
import { Trash2, Plus, Zap, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { expenseService } from "@/src/services/expenses";

interface BulkRow {
  id: string;
  description: string;
  amount: string;
  category: ExpenseCategory;
  date: string;
}

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface BulkAddModalRowProps {
  row: BulkRow;
  errors: Record<string, string>;
  onUpdate: (id: string, field: keyof BulkRow, value: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

function BulkAddModalRow({
  row,
  errors,
  onUpdate,
  onRemove,
  canRemove,
}: BulkAddModalRowProps) {
  return (
    <tr className="border-b border-border">
      <td className="py-3 px-4">
        <Input
          type="text"
          className="rounded-xs"
          placeholder="Expense description"
          value={row.description}
          onChange={(e) => onUpdate(row.id, "description", e.target.value)}
        />
        {errors[`${row.id}-desc`] && (
          <p className="text-red-600 text-xs mt-1">
            {errors[`${row.id}-desc`]}
          </p>
        )}
      </td>
      <td className="py-3 px-4">
        <Input
          className="rounded-xs"
          type="number"
          placeholder="0.00"
          step="0.01"
          value={row.amount}
          onChange={(e) => onUpdate(row.id, "amount", e.target.value)}
        />
        {errors[`${row.id}-amount`] && (
          <p className="text-red-600 text-xs mt-1">
            {errors[`${row.id}-amount`]}
          </p>
        )}
      </td>
      <td className="py-3 px-4">
        <Select
          value={row.category}
          onValueChange={(value) =>
            onUpdate(row.id, "category", value as ExpenseCategory)
          }
        >
          <SelectTrigger className="rounded-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xs">
            {Object.values(ExpenseCategory).map((cat) => (
              <SelectItem key={cat} className="rounded-xs" value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="py-3 px-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="rounded-xs w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(new Date(row.date), "MMM d, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={new Date(row.date)}
              onSelect={(date) =>
                onUpdate(
                  row.id,
                  "date",
                  date ? format(date, "yyyy-MM-dd") : row.date
                )
              }
            />
          </PopoverContent>
        </Popover>
        {errors[`${row.id}-date`] && (
          <p className="text-red-600 text-xs mt-1">
            {errors[`${row.id}-date`]}
          </p>
        )}
      </td>
      <td className="py-3 px-4 text-center">
        <button
          onClick={() => onRemove(row.id)}
          disabled={!canRemove}
          className="text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

interface BulkAddModalTableProps {
  rows: BulkRow[];
  errors: Record<string, string>;
  onUpdateRow: (id: string, field: keyof BulkRow, value: string) => void;
  onRemoveRow: (id: string) => void;
}

function BulkAddModalTable({
  rows,
  errors,
  onUpdateRow,
  onRemoveRow,
}: BulkAddModalTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold">Description</th>
            <th className="text-left py-3 px-4 font-semibold">Amount</th>
            <th className="text-left py-3 px-4 font-semibold">Category</th>
            <th className="text-left py-3 px-4 font-semibold">Date</th>
            <th className="text-left py-3 px-4 font-semibold w-12"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <BulkAddModalRow
              key={row.id}
              row={row}
              errors={errors}
              onUpdate={onUpdateRow}
              onRemove={onRemoveRow}
              canRemove={rows.length > 1}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface BulkAddModalHeaderProps {
  onClose: () => void;
}

function BulkAddModalHeader({ onClose }: BulkAddModalHeaderProps) {
  return (
    <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between gap-4">
      <h2 className="text-2xl font-bold">Add Multiple Expenses</h2>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="rounded-none"
      >
        ✕
      </Button>
    </div>
  );
}

interface BulkAddModalActionsProps {
  onAddRow: () => void;
  onGenerateFakeData: () => void;
  onClearAll: () => void;
}

function BulkAddModalActions({
  onAddRow,
  onGenerateFakeData,
  onClearAll,
}: BulkAddModalActionsProps) {
  return (
    <div className="mt-4 flex gap-2">
      <Button onClick={onAddRow} variant="outline" className="rounded-xs gap-2">
        <Plus className="h-4 w-4" />
        Add Row
      </Button>
      <Button
        onClick={onGenerateFakeData}
        variant="outline"
        className="rounded-xs gap-2"
        title="Generate 10 random expenses for testing"
      >
        <Zap className="h-4 w-4" />
        Generate Fake Data
      </Button>
      <Button onClick={onClearAll} variant="outline" className="rounded-xs">
        Clear All
      </Button>
    </div>
  );
}

interface BulkAddModalFooterProps {
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

function BulkAddModalFooter({
  onSubmit,
  onCancel,
  isLoading,
}: BulkAddModalFooterProps) {
  return (
    <div className="mt-6 flex gap-2">
      <Button
        onClick={onSubmit}
        disabled={isLoading}
        className="flex-1 rounded-xs"
      >
        {isLoading ? "Saving..." : "Add All Expenses"}
      </Button>
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
        className="flex-1 rounded-xs"
      >
        Cancel
      </Button>
    </div>
  );
}

interface BulkAddModalSuccessMessageProps {
  message: string;
}

function BulkAddModalSuccessMessage({
  message,
}: BulkAddModalSuccessMessageProps) {
  if (!message) return null;

  return (
    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700 font-medium">
      {message}
    </div>
  );
}

// Fake data generator using randomization
const generateFakeExpense = (index: number): Omit<BulkRow, "id"> => {
  const categories = Object.values(ExpenseCategory);
  const descriptions = [
    "Coffee at Central Café",
    "Grocery shopping",
    "Gas fill-up",
    "Restaurant dinner",
    "Movie tickets",
    "Uber ride",
    "Book purchase",
    "Phone bill",
    "Gym membership",
    "Office supplies",
    "Taxi fare",
    "Pizza delivery",
    "Haircut",
    "Doctor appointment",
    "Streaming subscription",
    "Hotel booking",
    "Flight ticket",
    "Car maintenance",
    "Gift for friend",
    "Takeout lunch",
  ];

  const randomCategory =
    categories[Math.floor(Math.random() * categories.length)];
  const randomDescription =
    descriptions[Math.floor(Math.random() * descriptions.length)];
  const randomAmount = (Math.random() * 150 + 5).toFixed(2);
  const randomDaysAgo = Math.floor(Math.random() * 30);
  const date = new Date();
  date.setDate(date.getDate() - randomDaysAgo);

  return {
    description: `${randomDescription} #${index + 1}`,
    amount: randomAmount,
    category: randomCategory as ExpenseCategory,
    date: format(date, "yyyy-MM-dd"),
  };
};

export function BulkAddModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkAddModalProps) {
  const [rows, setRows] = useState<BulkRow[]>([
    {
      id: "1",
      description: "",
      amount: "",
      category: ExpenseCategory.OTHER,
      date: format(new Date(), "yyyy-MM-dd"),
    },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addRow = () => {
    const newId = Math.random().toString(36).slice(2);
    setRows([
      ...rows,
      {
        id: newId,
        description: "",
        amount: "",
        category: ExpenseCategory.OTHER,
        date: format(new Date(), "yyyy-MM-dd"),
      },
    ]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const updateRow = (id: string, field: keyof BulkRow, value: string) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const generateFakeData = () => {
    const fakeRows: BulkRow[] = Array.from({ length: 10 }, (_, idx) => {
      const fakeData = generateFakeExpense(idx);
      return {
        id: Math.random().toString(36).slice(2),
        ...fakeData,
      };
    });
    setRows(fakeRows);
    setErrors({});
    setSuccessMessage("");
  };

  const clearAll = () => {
    setRows([
      {
        id: "1",
        description: "",
        amount: "",
        category: ExpenseCategory.OTHER,
        date: format(new Date(), "yyyy-MM-dd"),
      },
    ]);
    setErrors({});
    setSuccessMessage("");
  };

  const validateRows = () => {
    const newErrors: Record<string, string> = {};

    rows.forEach((row) => {
      if (!row.description.trim()) {
        newErrors[`${row.id}-desc`] = "Required";
      }
      if (!row.amount || parseFloat(row.amount) <= 0) {
        newErrors[`${row.id}-amount`] = "Invalid";
      }
      if (!row.date) {
        newErrors[`${row.id}-date`] = "Required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateRows()) return;

    setSuccessMessage("");
    setIsLoading(true);

    // Convert rows to CreateExpenseInput format
    const expensesToCreate: CreateExpenseInput[] = rows.map((row) => ({
      description: row.description,
      amount: parseFloat(row.amount),
      category: row.category as ExpenseCategory,
      date: row.date,
    }));

    // Call bulk API
    const result = await expenseService.bulkCreate(expensesToCreate);

    setIsLoading(false);

    if (result.success) {
      setSuccessMessage(
        `Successfully added ${result.data?.stats.success} of ${result.data?.stats.total} expenses!`,
      );
      setTimeout(() => {
        setRows([
          {
            id: "1",
            description: "",
            amount: "",
            category: ExpenseCategory.OTHER,
            date: format(new Date(), "yyyy-MM-dd"),
          },
        ]);
        onSuccess();
        setSuccessMessage("");
      }, 1500);
    } else {
      const failedCount = result.data?.stats.failed || 0;
      const successCount = result.data?.stats.success || 0;
      setSuccessMessage(
        `Added ${successCount} of ${result.data?.stats.total} expenses. ${failedCount} failed.`,
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="rounded-none w-full max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <BulkAddModalHeader onClose={onClose} />

        <div className="p-6">
          <BulkAddModalSuccessMessage message={successMessage} />

          <BulkAddModalTable
            rows={rows}
            errors={errors}
            onUpdateRow={updateRow}
            onRemoveRow={removeRow}
          />

          <BulkAddModalActions
            onAddRow={addRow}
            onGenerateFakeData={generateFakeData}
            onClearAll={clearAll}
          />

          <BulkAddModalFooter
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </Card>
    </div>
  );
}
