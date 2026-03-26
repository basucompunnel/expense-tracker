import { CategoryBreakdown } from "@/src/utils/aggregateExpensesByCategory";

export interface ReportStats {
  totalAmount: number;
  expenseCount: number;
  averageExpense: number;
  highestExpense: number;
  lowestExpense: number;
  spendingRange: number;
}

export interface ExpenseReportResponse {
  success: boolean;
  stats: ReportStats;
  breakdown: CategoryBreakdown[];
  message?: string;
}
