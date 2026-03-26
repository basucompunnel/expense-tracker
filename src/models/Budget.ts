import mongoose, { Schema, Document } from "mongoose";
import { ExpenseCategory } from "@/src/types/expense";

export interface IBudget extends Document {
  userId: string;
  type: "overall" | "category";
  category?: ExpenseCategory;
  period: "monthly";
  amount: number;
  month: number; // 1-12
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["overall", "category"],
      required: true,
    },
    category: {
      type: String,
      required: false,
    },
    period: {
      type: String,
      enum: ["monthly"],
      default: "monthly",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index: userId + type + category + month + year
budgetSchema.index(
  {
    userId: 1,
    type: 1,
    category: 1,
    month: 1,
    year: 1,
  },
  { unique: true }
);

const Budget =
  mongoose.models.Budget || mongoose.model<IBudget>("Budget", budgetSchema);

export default Budget;
