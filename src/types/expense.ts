export enum ExpenseCategory {
  GROCERIES = "Groceries",
  RESTAURANTS = "Restaurants",
  TRANSPORT = "Transport",
  FUEL = "Fuel",
  UTILITIES = "Utilities",
  ENTERTAINMENT = "Entertainment",
  SHOPPING = "Shopping",
  HEALTHCARE = "Healthcare",
  PERSONAL_CARE = "Personal Care",
  PETS = "Pets",
  SUBSCRIPTIONS = "Subscriptions",
  GIFTS = "Gifts",
  RENT = "Rent",
  OTHER = "Other",
}

export interface Expense {
  _id: string;
  userId: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string | Date;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface CreateExpenseInput {
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string | Date;
}

export interface UpdateExpenseInput extends CreateExpenseInput {}

export interface ExpenseFilterOptions {
  category?: ExpenseCategory;
  startDate?: string | Date;
  endDate?: string | Date;
  sort?: string;
  limit?: number;
  offset?: number;
}

export interface ExpenseListResponse {
  success: boolean;
  expenses: Expense[];
  total: number;
  limit: number;
  offset: number;
  message?: string;
}

export interface ExpenseResponse {
  success: boolean;
  message: string;
  expense?: Expense;
}

export interface ExpenseDeleteResponse {
  success: boolean;
  message: string;
}
