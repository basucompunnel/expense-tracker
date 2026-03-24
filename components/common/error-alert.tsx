"use client";

import { AlertCircle, CheckCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
  variant?: "error" | "success";
}

export function ErrorAlert({ message, variant = "error" }: ErrorAlertProps) {
  if (!message) return null;

  const isError = variant === "error";

  return (
    <div
      className={`flex gap-3 p-4 rounded-xs border text-sm font-medium transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${
        isError
          ? "bg-red-50 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800"
          : "bg-green-50 text-green-800 border-green-300 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800"
      }`}
    >
      {isError ? (
        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
      ) : (
        <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
      )}
      <span>{message}</span>
    </div>
  );
}
