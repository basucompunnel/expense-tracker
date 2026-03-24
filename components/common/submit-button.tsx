"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  children: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  rounded?: "xs" | "lg";
}

export function SubmitButton({
  children,
  isLoading = false,
  loadingText,
  disabled = false,
  rounded = "lg",
}: SubmitButtonProps) {
  const roundedClass = rounded === "xs" ? "rounded-xs" : "rounded-lg";

  return (
    <Button
      type="submit"
      className={`w-full ${roundedClass} bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed`}
      disabled={isLoading || disabled}
    >
      {isLoading ? loadingText || children : children}
    </Button>
  );
}
