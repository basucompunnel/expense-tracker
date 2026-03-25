import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Expense from "@/src/models/Expense";
import { withAuth, AuthenticatedRequest } from "@/src/middleware/auth";

async function handlePOST(req: AuthenticatedRequest) {
  try {
    const { amount, description, category, date } = await req.json();
    const userId = req.user?.userId;

    // Validation
    if (!amount || !description || !category || !date) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
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

    // Connect to database
    await connectToDatabase();

    // Create expense
    const expense = new Expense({
      userId,
      amount,
      description: description.trim(),
      category,
      date: new Date(date),
    });

    await expense.save();

    return NextResponse.json(
      {
        success: true,
        message: "Expense created successfully",
        expense: {
          _id: expense._id.toString(),
          amount: expense.amount,
          description: expense.description,
          category: expense.category,
          date: expense.date,
          createdAt: expense.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create expense error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create expense",
      },
      { status: 500 }
    );
  }
}

async function handleGET(req: AuthenticatedRequest) {
  try {
    const userId = req.user?.userId;
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sort = searchParams.get("sort") || "-date";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Connect to database
    await connectToDatabase();

    // Build query
    const query: Record<string, any> = { userId };

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Fetch expenses
    const expenses = await Expense.find(query)
      .sort(sort)
      .limit(limit)
      .skip(offset)
      .lean();

    const total = await Expense.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        expenses: expenses.map((expense) => ({
          _id: expense._id.toString(),
          amount: expense.amount,
          description: expense.description,
          category: expense.category,
          date: expense.date,
          createdAt: expense.createdAt,
        })),
        total,
        limit,
        offset,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get expenses error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch expenses",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return withAuth(handlePOST)(req);
}

export async function GET(req: NextRequest) {
  return withAuth(handleGET)(req);
}
