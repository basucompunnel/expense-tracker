import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Expense from "@/src/models/Expense";
import { withAuth, AuthenticatedRequest } from "@/src/middleware/auth";
import { aggregateExpensesByCategory } from "@/src/utils/aggregateExpensesByCategory";
import { ExpenseReportResponse } from "@/src/types/report";

async function handleGET(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const userId = req.user?.userId;

    // Connect to database
    await connectToDatabase();

    // Fetch all expenses for the user
    const expenses = await Expense.find({ userId }).sort({ date: -1 }).lean();

    // Calculate statistics
    let totalAmount = 0;
    let highestExpense = 0;
    let lowestExpense = expenses.length > 0 ? expenses[0].amount : 0;

    expenses.forEach((expense) => {
      totalAmount += expense.amount;
      if (expense.amount > highestExpense) {
        highestExpense = expense.amount;
      }
      if (expense.amount < lowestExpense) {
        lowestExpense = expense.amount;
      }
    });

    const expenseCount = expenses.length;
    const averageExpense =
      expenseCount > 0 ? Math.round((totalAmount / expenseCount) * 100) / 100 : 0;
    const spendingRange = highestExpense - lowestExpense;

    // Aggregate by category
    const breakdown = aggregateExpensesByCategory(expenses);

    const response: ExpenseReportResponse = {
      success: true,
      stats: {
        totalAmount: Math.round(totalAmount * 100) / 100,
        expenseCount,
        averageExpense,
        highestExpense,
        lowestExpense,
        spendingRange: Math.round(spendingRange * 100) / 100,
      },
      breakdown,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Report fetch error:", error);
    return NextResponse.json(
      {
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
      },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handleGET);
