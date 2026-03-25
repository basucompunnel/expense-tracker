import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/src/middleware/auth";
import Expense from "@/src/models/Expense";
import { connectToDatabase } from "@/lib/mongodb";

const MAX_BATCH_SIZE = 100;

interface BulkDeleteInput {
  ids: string[];
}

interface BulkDeleteResponse {
  success: boolean;
  message: string;
  data?: {
    deleted: number;
    failed: number;
    failedIds?: string[];
  };
}

async function handler(
  request: AuthenticatedRequest
): Promise<NextResponse<BulkDeleteResponse>> {
  if (request.method !== "POST") {
    return NextResponse.json(
      { success: false, message: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    await connectToDatabase();

    // Get user ID from auth middleware
    const userId = request.user?.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    let ids: string[];
    try {
      const body = await request.json();
      ids = body.ids || [];
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one expense ID is required" },
        { status: 400 }
      );
    }

    if (ids.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: `Batch size exceeds maximum of ${MAX_BATCH_SIZE} items`,
        },
        { status: 400 }
      );
    }

    // Find all expenses to delete
    const expenses = await Expense.find({ _id: { $in: ids } });

    // Verify user owns all expenses
    const failedIds: string[] = [];
    const validIds: string[] = [];

    for (const expense of expenses) {
      if (expense.userId.toString() === userId) {
        validIds.push(expense._id.toString());
      } else {
        failedIds.push(expense._id.toString());
      }
    }

    // Check for IDs that don't exist
    const foundIds = new Set(expenses.map((e) => e._id.toString()));
    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedIds.push(id);
      }
    }

    // Delete authorized expenses
    let deleted = 0;
    if (validIds.length > 0) {
      const result = await Expense.deleteMany({ _id: { $in: validIds } });
      deleted = result.deletedCount || 0;
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully deleted ${deleted} expense(s)`,
        data: {
          deleted,
          failed: failedIds.length,
          ...(failedIds.length > 0 && { failedIds }),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Bulk delete error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
