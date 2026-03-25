import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Expense from "@/src/models/Expense";
import { withAuth, AuthenticatedRequest } from "@/src/middleware/auth";
import { Types } from "mongoose";

async function handlePUT(req: AuthenticatedRequest) {
  try {
    const userId = req.user?.userId;
    const pathSegments = req.nextUrl.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];
    const { amount, description, category, date } = await req.json();

    // Validate ID format
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid expense ID",
        },
        { status: 400 }
      );
    }

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

    // Find expense and verify ownership
    const expense = await Expense.findById(id);

    if (!expense) {
      return NextResponse.json(
        {
          success: false,
          message: "Expense not found",
        },
        { status: 404 }
      );
    }

    if (expense.userId.toString() !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized to update this expense",
        },
        { status: 403 }
      );
    }

    // Update expense
    expense.amount = amount;
    expense.description = description.trim();
    expense.category = category;
    expense.date = new Date(date);

    await expense.save();

    return NextResponse.json(
      {
        success: true,
        message: "Expense updated successfully",
        expense: {
          _id: expense._id.toString(),
          amount: expense.amount,
          description: expense.description,
          category: expense.category,
          date: expense.date,
          createdAt: expense.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update expense error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update expense",
      },
      { status: 500 }
    );
  }
}

async function handleDELETE(req: AuthenticatedRequest) {
  try {
    const userId = req.user?.userId;
    const pathSegments = req.nextUrl.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];

    // Validate ID format
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid expense ID",
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find expense and verify ownership
    const expense = await Expense.findById(id);

    if (!expense) {
      return NextResponse.json(
        {
          success: false,
          message: "Expense not found",
        },
        { status: 404 }
      );
    }

    if (expense.userId.toString() !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized to delete this expense",
        },
        { status: 403 }
      );
    }

    // Delete expense
    await Expense.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Expense deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete expense error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete expense",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return withAuth(handlePUT)(req);
}

export async function DELETE(req: NextRequest) {
  return withAuth(handleDELETE)(req);
}
