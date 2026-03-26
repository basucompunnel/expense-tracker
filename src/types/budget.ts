import { ExpenseCategory } from "@/src/types/expense";

export interface Budget {
  _id: string;
  userId: string;
  type: "overall" | "category";
  category?: ExpenseCategory;
  period: "monthly";
  amount: number;
  month: number; // 1-12
  year: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateBudgetInput {
  type: "overall" | "category";
  amount: number;
  category?: ExpenseCategory;
}

export interface BudgetListResponse {
  success: boolean;
  budgets: Budget[];
  message?: string;
}

export interface BudgetResponse {
  success: boolean;
  budget?: Budget;
  message?: string;
}

export interface BudgetWithSpend extends Budget {
  spent: number;
  remaining: number;
  percentageUsed: number;
}
