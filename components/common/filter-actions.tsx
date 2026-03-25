"use client";

import { Button } from "@/components/ui/button";

interface FilterActionsProps {
  onApply: () => void;
  onReset: () => void;
  disabled?: boolean;
}

export function FilterActions({ onApply, onReset, disabled = false }: FilterActionsProps) {
  return (
    <div className="flex gap-2 mt-4">
      <Button
        onClick={onApply}
        disabled={disabled}
        className="rounded-none"
      >
        Apply Filters
      </Button>
      <Button
        onClick={onReset}
        variant="outline"
        disabled={disabled}
        className="rounded-none"
      >
        Reset
      </Button>
    </div>
  );
}
