import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Budget from "@/src/models/Budget";
import Expense from "@/src/models/Expense";
import { withAuth, AuthenticatedRequest } from "@/src/middleware/auth";
import { BudgetListResponse, BudgetResponse, BudgetWithSpend } from "@/src/types/budget";

async function handleGET(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const userId = req.user?.userId;
    const { searchParams } = new URL(req.url);

    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // Default to current month/year
    const now = new Date();
    const currentMonth = parseInt(month || String(now.getMonth() + 1), 10);
    const currentYear = parseInt(year || String(now.getFullYear()), 10);

    await connectToDatabase();

    // Fetch all budgets for the user in the specified month/year
    const budgets = await Budget.find({
      userId,
      month: currentMonth,
      year: currentYear,
    }).lean();

    // For each budget, calculate spent amount
    const budgetsWithSpend: BudgetWithSpend[] = await Promise.all(
      budgets.map(async (budget) => {
        // Calculate start and end of month
        const monthStart = new Date(currentYear, currentMonth - 1, 1);
        const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

        // Build query based on budget type
        const query: any = {
          userId,
          date: {
            $gte: monthStart,
            $lte: monthEnd,
          },
        };

        if (budget.type === "category" && budget.category) {
          query.category = budget.category;
        }

        // Fetch expenses and calculate total
        const expenses = await Expense.find(query).lean();
        const spent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        const percentageUsed = (spent / budget.amount) * 100;
        const remaining = Math.max(budget.amount - spent, 0);

        return {
          ...budget,
          _id: budget._id.toString(),
          spent,
          remaining,
          percentageUsed,
        };
      })
    );

    const response: BudgetListResponse = {
      success: true,
      budgets: budgetsWithSpend,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Fetch budgets error:", error);
    return NextResponse.json(
      {
        success: false,
        budgets: [],
        message: "Failed to fetch budgets",
      },
      { status: 500 }
    );
  }
}

async function handlePOST(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const userId = req.user?.userId;
    const { type, amount, category } = await req.json();

    // Validation
    if (!type || !amount) {
      return NextResponse.json(
        {
          success: false,
          message: "Type and amount are required",
        },
        { status: 400 }
      );
    }

    if (type !== "overall" && type !== "category") {
      return NextResponse.json(
        {
          success: false,
          message: "Type must be 'overall' or 'category'",
        },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Amount must be a positive number",
        },
        { status: 400 }
      );
    }

    if (type === "category" && !category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category is required when type is 'category'",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get current month/year
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();

    // Find existing budget or create new one
    const existingBudget = await Budget.findOne({
      userId,
      type,
      category: type === "category" ? category : undefined,
      month,
      year,
    });

    let budget;

    if (existingBudget) {
      // Update existing budget
      existingBudget.amount = amount;
      await existingBudget.save();
      budget = existingBudget;
    } else {
      // Create new budget
      const newBudget = new Budget({
        userId,
        type,
        category: type === "category" ? category : undefined,
        period: "monthly",
        amount,
        month,
        year,
      });

      await newBudget.save();
      budget = newBudget;
    }

    const response: BudgetResponse = {
      success: true,
      budget: {
        _id: budget._id.toString(),
        userId: budget.userId,
        type: budget.type,
        category: budget.category,
        period: budget.period,
        amount: budget.amount,
        month: budget.month,
        year: budget.year,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Create/update budget error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create or update budget",
      },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handleGET);
export const POST = withAuth(handlePOST);
