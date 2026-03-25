"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { CreateExpenseInput, ExpenseCategory, Expense } from "@/src/types/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/form-field";
import { SelectField } from "@/components/common/select-field";
import { DatePickerField } from "@/components/common/date-picker-field";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";

const expenseValidationSchema = Yup.object().shape({
  description: Yup.string()
    .required("Description is required")
    .min(3, "Description must be at least 3 characters")
    .max(100, "Description must not exceed 100 characters"),
  amount: Yup.number()
    .required("Amount is required")
    .positive("Amount must be greater than 0"),
  category: Yup.string()
    .required("Category is required")
    .oneOf(
      Object.values(ExpenseCategory),
      "Please select a valid category"
    ),
  date: Yup.string().required("Date is required"),
});

interface ExpenseFormProps {
  onSubmit: (data: CreateExpenseInput) => Promise<{ success: boolean }>;
  isLoading: boolean;
  initialValues?: Partial<CreateExpenseInput>;
  submitButtonLabel?: string;
}

export function ExpenseForm({
  onSubmit,
  isLoading,
  initialValues,
  submitButtonLabel = "Add Expense",
}: ExpenseFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues: CreateExpenseInput = {
    description: "",
    amount: 0,
    category: ExpenseCategory.OTHER,
    date: new Date().toISOString().split("T")[0],
    ...initialValues,
  };

  const handleSubmit = async (values: CreateExpenseInput) => {
    setSubmitError(null);
    try {
      const result = await onSubmit(values);
      if (!result.success) {
        setSubmitError("Failed to save expense");
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={expenseValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, values, setFieldValue, errors, touched }) => (
        <Form className="space-y-4">
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {submitError}
            </div>
          )}

          <div className="-mt-2">
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <Textarea
              name="description"
              placeholder="Enter expense description"
              value={values.description}
              onChange={(e) => setFieldValue("description", e.target.value)}
              rows={3}
              className="rounded-xs"
            />
            {errors.description && touched.description && (
              <div className="flex gap-2 items-center animate-in fade-in slide-in-from-top-1 mt-1">
                <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                  {errors.description}
                </p>
              </div>
            )}
          </div>

          <FormField
            label="Amount"
            type="number"
            name="amount"
            placeholder="0.00"
            step="0.01"
            value={values.amount}
            onChange={(e) => setFieldValue("amount", parseFloat(e.target.value) || 0)}
            error={errors.amount}
            touched={touched.amount}
            icon={<span className="text-lg font-semibold">$</span>}
          />

          <div>
            <SelectField
              label="Category"
              value={values.category}
              onValueChange={(value) => setFieldValue("category", value)}
              options={Object.values(ExpenseCategory).map((cat) => ({
                value: cat,
                label: cat,
              }))}
              placeholder="Select a category"
            />
            {errors.category && touched.category && (
              <div className="flex gap-2 items-center animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                  {errors.category}
                </p>
              </div>
            )}
          </div>

          <div>
            <DatePickerField
              label="Date"
              selected={values.date ? new Date(values.date) : undefined}
              onSelect={(date) => setFieldValue("date", date ? format(date, "yyyy-MM-dd") : "")}
            />
            {errors.date && touched.date && (
              <div className="flex gap-2 items-center animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                  {errors.date}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full rounded-xs"
            >
              {isSubmitting || isLoading ? "Saving..." : submitButtonLabel}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
