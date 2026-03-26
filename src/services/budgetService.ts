"use client";

import {
  Budget,
  CreateBudgetInput,
  BudgetListResponse,
  BudgetResponse,
} from "@/src/types/budget";
import { authService } from "@/src/services/auth";

const getHeaders = () => {
  const token = authService.getToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const budgetService = {
  // Get all budgets for current month
  list: async (month?: number, year?: number): Promise<BudgetListResponse> => {
    try {
      const params = new URLSearchParams();

      if (month !== undefined) {
        params.append("month", month.toString());
      }
      if (year !== undefined) {
        params.append("year", year.toString());
      }

      const queryString = params.toString();
      const url = `/api/budgets${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("List budgets error:", error);
      return {
        success: false,
        budgets: [],
        message: "Failed to fetch budgets",
      };
    }
  },

  // Create or update a budget
  create: async (payload: CreateBudgetInput): Promise<BudgetResponse> => {
    try {
      const response = await fetch(`/api/budgets`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Create budget error:", error);
      return {
        success: false,
        message: "Failed to create budget",
      };
    }
  },

  // Delete a budget
  delete: async (budgetId: string): Promise<BudgetResponse> => {
    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Delete budget error:", error);
      return {
        success: false,
        message: "Failed to delete budget",
      };
    }
  },
};
