"use client";

import { ExpenseReportResponse } from "@/src/types/report";
import { authService } from "@/src/services/auth";

const getHeaders = () => {
  const token = authService.getToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const reportService = {
  fetchReport: async (): Promise<ExpenseReportResponse> => {
    try {
      const response = await fetch(`/api/expenses/report`, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch report error:", error);
      return {
        success: false,
        stats: {
          totalAmount: 0,
          expenseCount: 0,
          averageExpense: 0,
          highestExpense: 0,
          lowestExpense: 0,
          spendingRange: 0,
        },
        breakdown: [],
        message: "Failed to fetch report",
      };
    }
  },
};
