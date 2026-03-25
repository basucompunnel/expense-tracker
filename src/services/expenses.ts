"use client";

import {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseFilterOptions,
  ExpenseListResponse,
  ExpenseResponse,
  ExpenseDeleteResponse,
} from "@/src/types/expense";
import { authService } from "@/src/services/auth";

const getHeaders = () => {
  const token = authService.getToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const expenseService = {
  // Create a new expense
  create: async (payload: CreateExpenseInput): Promise<ExpenseResponse> => {
    try {
      const response = await fetch(`/api/expenses`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Create expense error:", error);
      return {
        success: false,
        message: "Failed to create expense",
      };
    }
  },

  // Get all expenses with optional filters
  list: async (
    filters?: ExpenseFilterOptions
  ): Promise<ExpenseListResponse> => {
    try {
      const params = new URLSearchParams();

      if (filters?.category) {
        params.append("category", filters.category);
      }
      if (filters?.startDate) {
        const startDate =
          filters.startDate instanceof Date
            ? filters.startDate.toISOString()
            : filters.startDate;
        params.append("startDate", startDate);
      }
      if (filters?.endDate) {
        const endDate =
          filters.endDate instanceof Date
            ? filters.endDate.toISOString()
            : filters.endDate;
        params.append("endDate", endDate);
      }
      if (filters?.sort) {
        params.append("sort", filters.sort);
      }
      if (filters?.limit) {
        params.append("limit", filters.limit.toString());
      }
      if (filters?.offset) {
        params.append("offset", filters.offset.toString());
      }

      const queryString = params.toString();
      const url = `/api/expenses${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("List expenses error:", error);
      return {
        success: false,
        expenses: [],
        total: 0,
        limit: 50,
        offset: 0,
        message: "Failed to fetch expenses",
      };
    }
  },

  // Update an expense
  update: async (
    id: string,
    payload: UpdateExpenseInput
  ): Promise<ExpenseResponse> => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Update expense error:", error);
      return {
        success: false,
        message: "Failed to update expense",
      };
    }
  },

  // Delete an expense
  delete: async (id: string): Promise<ExpenseDeleteResponse> => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Delete expense error:", error);
      return {
        success: false,
        message: "Failed to delete expense",
      };
    }
  },
};
