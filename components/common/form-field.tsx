"use client";

import { InputHTMLAttributes, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  icon?: ReactNode;
}

export function FormField({
  label,
  error,
  touched,
  helperText,
  id,
  icon,
  ...props
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
            {icon}
          </div>
        )}
        <Input
          id={id}
          className={`rounded-xs ${
            icon ? "pl-10" : ""
          } ${
            touched && error
              ? "border-red-400"
              : ""
          }`}
          {...props}
        />
      </div>
      {touched && error && (
        <div className="flex gap-2 items-center animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-700 dark:text-red-400 font-medium">
            {error}
          </p>
        </div>
      )}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
