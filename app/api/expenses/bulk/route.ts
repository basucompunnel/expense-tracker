import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/src/middleware/auth";
import Expense from "@/src/models/Expense";
import { ExpenseCategory } from "@/src/types/expense";
import { connectToDatabase } from "@/lib/mongodb";

const MAX_BATCH_SIZE = 100;

interface BulkCreateInput {
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
}

interface BulkCreateSuccess {
  _id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
}

interface BulkCreateFailure {
  index: number;
  description: string;
  error: string;
}

interface BulkCreateResponse {
  success: boolean;
  data?: {
    created: BulkCreateSuccess[];
    failed: BulkCreateFailure[];
    stats: {
      total: number;
      success: number;
      failed: number;
    };
  };
  error?: string;
}

async function handler(request: AuthenticatedRequest): Promise<NextResponse<BulkCreateResponse>> {
  if (request.method !== "POST") {
    return NextResponse.json(
      { success: false, error: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    await connectToDatabase();

    // Get user ID from auth middleware
    const userId = request.user?.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    let expenses: BulkCreateInput[];
    try {
      const body = await request.json();
      expenses = Array.isArray(body) ? body : [body];
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate batch size
    if (expenses.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one expense is required" },
        { status: 400 }
      );
    }

    if (expenses.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `Batch size exceeds maximum of ${MAX_BATCH_SIZE} items`,
        },
        { status: 400 }
      );
    }

    // Validate and process expenses
    const created: BulkCreateSuccess[] = [];
    const failed: BulkCreateFailure[] = [];

    for (let i = 0; i < expenses.length; i++) {
      const expense = expenses[i];

      // Validate required fields
      if (!expense.description || typeof expense.description !== "string") {
        failed.push({
          index: i,
          description: expense.description || "N/A",
          error: "Description is required and must be a string",
        });
        continue;
      }

      if (typeof expense.amount !== "number" || expense.amount <= 0) {
        failed.push({
          index: i,
          description: expense.description,
          error: "Amount must be a positive number",
        });
        continue;
      }

      if (!expense.category || !Object.values(ExpenseCategory).includes(expense.category as ExpenseCategory)) {
        failed.push({
          index: i,
          description: expense.description,
          error: "Invalid category",
        });
        continue;
      }

      if (!expense.date || isNaN(new Date(expense.date).getTime())) {
        failed.push({
          index: i,
          description: expense.description,
          error: "Date is required and must be a valid date",
        });
        continue;
      }

      try {
        // Create expense in database
        const newExpense = new Expense({
          userId,
          description: expense.description.trim(),
          amount: parseFloat(expense.amount.toString()),
          category: expense.category,
          date: new Date(expense.date),
        });

        await newExpense.save();

        created.push({
          _id: newExpense._id.toString(),
          description: newExpense.description,
          amount: newExpense.amount,
          category: newExpense.category,
          date: newExpense.date.toISOString().split("T")[0],
        });
      } catch (error) {
        failed.push({
          index: i,
          description: expense.description,
          error: `Database error: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }

    const stats = {
      total: expenses.length,
      success: created.length,
      failed: failed.length,
    };

    // Determine response status code
    const statusCode = failed.length === 0 ? 201 : failed.length === expenses.length ? 400 : 207;

    return NextResponse.json(
      {
        success: failed.length === 0,
        data: {
          created,
          failed,
          stats,
        },
      },
      { status: statusCode }
    );
  } catch (error) {
    console.error("Bulk create error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
