import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Budget from "@/src/models/Budget";
import { withAuth, AuthenticatedRequest } from "@/src/middleware/auth";
import { BudgetResponse } from "@/src/types/budget";
import { Types } from "mongoose";

async function handleDELETE(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const userId = req.user?.userId;
    const pathSegments = req.nextUrl.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];

    // Validate ID format
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid budget ID",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find budget and verify ownership
    const budget = await Budget.findById(id);

    if (!budget) {
      return NextResponse.json(
        {
          success: false,
          message: "Budget not found",
        },
        { status: 404 }
      );
    }

    if (budget.userId.toString() !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized to delete this budget",
        },
        { status: 403 }
      );
    }

    // Delete budget
    await Budget.findByIdAndDelete(id);

    const response: BudgetResponse = {
      success: true,
      message: "Budget deleted successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Delete budget error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete budget",
      },
      { status: 500 }
    );
  }
}

export const DELETE = withAuth(handleDELETE);
