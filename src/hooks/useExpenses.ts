"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseFilterOptions,
} from "@/src/types/expense";
import { expenseService } from "@/src/services/expenses";

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<ExpenseFilterOptions>({
    limit: 50,
    offset: 0,
  });

  // Fetch expenses with current filters
  const fetchExpenses = useCallback(
    async (filters?: ExpenseFilterOptions) => {
      setIsLoading(true);
      setError(null);

      try {
        const appliedFilters = filters || currentFilters;
        const response = await expenseService.list(appliedFilters);

        if (!response.success) {
          setError(response.message || "Failed to fetch expenses");
          return { success: false, message: response.message };
        }

        setExpenses(response.expenses);
        setTotal(response.total);
        setCurrentFilters(appliedFilters);
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch expenses";
        setError(message);
        return { success: false, message };
      } finally {
        setIsLoading(false);
      }
    },
    [currentFilters]
  );

  // Create a new expense
  const create = useCallback(
    async (data: CreateExpenseInput) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await expenseService.create(data);

        if (!response.success) {
          setError(response.message);
          return { success: false, message: response.message };
        }

        // Refresh expenses list
        await fetchExpenses();
        return { success: true, message: response.message };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create expense";
        setError(message);
        return { success: false, message };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchExpenses]
  );

  // Update an expense
  const update = useCallback(
    async (id: string, data: UpdateExpenseInput) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await expenseService.update(id, data);

        if (!response.success) {
          setError(response.message);
          return { success: false, message: response.message };
        }

        // Fetch updated expenses to ensure UI is in sync with server
        const fetchResponse = await expenseService.list(currentFilters);
        if (fetchResponse.success) {
          setExpenses(fetchResponse.expenses);
          setTotal(fetchResponse.total);
        }

        return { success: true, message: response.message };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update expense";
        setError(message);
        return { success: false, message };
      } finally {
        setIsLoading(false);
      }
    },
    [currentFilters]
  );

  // Delete an expense
  const deleteExpense = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await expenseService.delete(id);

        if (!response.success) {
          setError(response.message);
          return { success: false, message: response.message };
        }

        // Update local state optimistically
        setExpenses((prevExpenses) =>
          prevExpenses.filter((expense) => expense._id !== id)
        );
        setTotal((prev) => Math.max(prev - 1, 0));

        return { success: true, message: response.message };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete expense";
        setError(message);
        return { success: false, message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Apply filters and fetch
  const applyFilters = useCallback(
    async (filters: ExpenseFilterOptions) => {
      return fetchExpenses({ ...currentFilters, ...filters, offset: 0 });
    },
    [fetchExpenses, currentFilters]
  );

  return {
    expenses,
    total,
    isLoading,
    error,
    currentFilters,
    fetchExpenses,
    create,
    update,
    delete: deleteExpense,
    applyFilters,
  };
};
