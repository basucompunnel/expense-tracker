"use client";

import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";

interface ExpenseSelectionBarProps {
  selectedCount: number;
  totalCount: number;
  isSelectAll: boolean;
  isDeleting: boolean;
  onSelectAll: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export function ExpenseSelectionBar({
  selectedCount,
  totalCount,
  isSelectAll,
  isDeleting,
  onSelectAll,
  onDelete,
  onClear,
}: ExpenseSelectionBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">
            {selectedCount} of {totalCount} selected
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="rounded-xs"
          >
            {isSelectAll ? "Deselect All" : "Select All"}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={isDeleting}
            className="rounded-xs"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
            className="rounded-xs"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Deleting..." : `Delete ${selectedCount}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
