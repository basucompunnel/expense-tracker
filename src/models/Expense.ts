import mongoose, { Schema, Document, Types } from "mongoose";

export enum ExpenseCategory {
  FOOD = "Food",
  TRANSPORT = "Transport",
  ENTERTAINMENT = "Entertainment",
  OTHER = "Other",
}

export interface IExpenseDocument extends Document {
  userId: Types.ObjectId;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpenseDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(ExpenseCategory),
      required: true,
      default: ExpenseCategory.OTHER,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries by userId and date
expenseSchema.index({ userId: 1, date: -1 });

// Handle model already compiled error in development
const Expense =
  mongoose.models.Expense ||
  mongoose.model<IExpenseDocument>("Expense", expenseSchema);

export default Expense;
