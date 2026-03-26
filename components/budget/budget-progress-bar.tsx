import { JSX } from "react";

interface BudgetProgressBarProps {
  spent: number;
  budget: number;
  label?: string;
  showAmount?: boolean;
}

function getStatusColor(percentageUsed: number): string {
  if (percentageUsed >= 100) return "bg-red-500"; // Over budget
  if (percentageUsed >= 90) return "bg-orange-500"; // 90-100%
  if (percentageUsed >= 70) return "bg-yellow-500"; // 70-90%
  return "bg-green-500"; // 0-70%
}

function getStatusLabel(percentageUsed: number): string {
  if (percentageUsed >= 100) return "Over Budget";
  if (percentageUsed >= 90) return "Almost Exceeded";
  if (percentageUsed >= 70) return "Caution";
  return "On Track";
}

export function BudgetProgressBar({
  spent,
  budget,
  label,
  showAmount = true,
}: BudgetProgressBarProps): JSX.Element {
  const percentageUsed = Math.min((spent / budget) * 100, 100);
  const remaining = budget - spent;
  const statusColor = getStatusColor(percentageUsed);
  const statusLabel = getStatusLabel(percentageUsed);

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{label}</p>
          <p
            className={`text-xs font-semibold px-2 py-1 rounded ${
              percentageUsed >= 100
                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                : percentageUsed >= 90
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200"
                  : percentageUsed >= 70
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                    : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
            }`}
          >
            {statusLabel}
          </p>
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${statusColor} transition-all duration-300`}
          style={{ width: `${percentageUsed}%` }}
        />
      </div>

      {/* Amount display */}
      {showAmount && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            ₹{spent.toFixed(2)} / ₹{budget.toFixed(2)}
          </span>
          <span>{percentageUsed.toFixed(1)}%</span>
        </div>
      )}

      {/* Remaining amount */}
      {remaining > 0 && (
        <p className="text-xs text-muted-foreground">
          ₹{remaining.toFixed(2)} remaining
        </p>
      )}
      {remaining <= 0 && (
        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
          ₹{Math.abs(remaining).toFixed(2)} over budget
        </p>
      )}
    </div>
  );
}
