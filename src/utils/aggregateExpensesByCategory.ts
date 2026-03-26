import { Expense, ExpenseCategory } from "@/src/types/expense";

export interface CategoryBreakdown {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  count: number;
}

export function aggregateExpensesByCategory(
  expenses: Expense[]
): CategoryBreakdown[] {
  if (expenses.length === 0) {
    return [];
  }

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Group by category and calculate totals
  const categoryMap = new Map<ExpenseCategory, { amount: number; count: number }>();

  expenses.forEach((expense) => {
    const existing = categoryMap.get(expense.category);
    if (existing) {
      categoryMap.set(expense.category, {
        amount: existing.amount + expense.amount,
        count: existing.count + 1,
      });
    } else {
      categoryMap.set(expense.category, {
        amount: expense.amount,
        count: 1,
      });
    }
  });

  // Convert to breakdown array with percentages
  const breakdown: CategoryBreakdown[] = Array.from(categoryMap.entries())
    .map(([category, { amount, count }]) => ({
      category,
      amount,
      count,
      percentage: Math.round((amount / totalAmount) * 100 * 100) / 100, // 2 decimal places
    }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending

  return breakdown;
}

export function getCategoryColor(index: number): string {
  const colors = [
    "#3B82F6", // blue
    "#EF4444", // red
    "#10B981", // green
    "#F59E0B", // amber
    "#8B5CF6", // purple
    "#EC4899", // pink
    "#14B8A6", // teal
    "#F97316", // orange
    "#06B6D4", // cyan
    "#6366F1", // indigo
    "#84CC16", // lime
    "#D946EF", // fuchsia
    "#0EA5E9", // sky
    "#A855F7", // violet
  ];

  return colors[index % colors.length];
}
