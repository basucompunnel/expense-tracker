"use client";

import { JSX, useState, useEffect } from "react";
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
import { ExpenseCategory } from "@/src/types/expense";
import { BudgetWithSpend } from "@/src/types/budget";

interface BudgetFormProps {
  onSubmit: (data: { type: "overall" | "category"; amount: number; category?: ExpenseCategory }) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
  editingBudget?: BudgetWithSpend | null;
}

const expenseCategories = Object.values(ExpenseCategory);

export function BudgetForm({
  onSubmit,
  isLoading = false,
  onCancel,
  editingBudget,
}: BudgetFormProps): JSX.Element {
  const [type, setType] = useState<"overall" | "category">("overall");
  const [category, setCategory] = useState<ExpenseCategory>(expenseCategories[0]);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  // Pre-fill form when editing
  useEffect(() => {
    if (editingBudget) {
      setType(editingBudget.type);
      if (editingBudget.category) {
        setCategory(editingBudget.category);
      }
      setAmount(editingBudget.amount.toString());
      setError("");
    } else {
      setType("overall");
      setCategory(expenseCategories[0]);
      setAmount("");
      setError("");
    }
  }, [editingBudget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (type === "category" && !category) {
      setError("Please select a category");
      return;
    }

    try {
      await onSubmit({
        type,
        amount: parseFloat(amount),
        category: type === "category" ? category : undefined,
      });

      // Reset form only if not editing
      if (!editingBudget) {
        setAmount("");
        setError("");
      }
    } catch (err) {
      setError("Failed to save budget");
    }
  };

  return (
    <Card className="p-6 bg-slate-50 dark:bg-slate-900 rounded-xs">
      <h3 className="text-lg font-semibold mb-4">
        {editingBudget ? "Edit Budget" : "Add Budget"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm dark:bg-red-900 dark:border-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Budget Type Selection (disabled when editing) */}
        <div>
          <label className="block text-sm font-medium mb-2">Budget Type</label>
          <Select 
            value={type} 
            onValueChange={(value) => setType(value as "overall" | "category")}
            disabled={!!editingBudget}
          >
            <SelectTrigger className="rounded-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overall">Overall Budget</SelectItem>
              <SelectItem value="category">Category Budget</SelectItem>
            </SelectContent>
          </Select>
          {editingBudget && (
            <p className="text-xs text-muted-foreground mt-1">Cannot change type while editing</p>
          )}
        </div>

        {/* Category Selection (only for category budgets, disabled when editing) */}
        {type === "category" && (
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <Select 
              value={category} 
              onValueChange={(value) => setCategory(value as ExpenseCategory)}
              disabled={!!editingBudget}
            >
              <SelectTrigger className="rounded-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {editingBudget && (
              <p className="text-xs text-muted-foreground mt-1">Cannot change category while editing</p>
            )}
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Amount (₹)</label>
          <Input
            type="number"
            placeholder="Enter budget amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
            disabled={isLoading}
            className="rounded-xs"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="rounded-xs"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading || !amount}
            className="rounded-xs"
          >
            {isLoading ? (editingBudget ? "Updating..." : "Saving...") : (editingBudget ? "Update Budget" : "Save Budget")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
