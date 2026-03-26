"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  getCategoryColor,
  CategoryBreakdown,
} from "@/src/utils/aggregateExpensesByCategory";
import { reportService } from "@/src/services/reportService";
import { ReportStats, ExpenseReportResponse } from "@/src/types/report";
import { JSX } from "react";

interface ExpenseReportModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
}

// Loading State Component
function LoadingState(): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <Card className="rounded-xs p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </Card>
    </div>
  );
}

// Empty State Component
function EmptyState({ onClose }: { onClose: () => void }): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <Card className="rounded-xs p-8 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Expense Report</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No expenses to report. Create expenses to view the breakdown.
          </p>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="rounded-xs">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Header Component
function ReportHeader({ onClose }: { onClose: () => void }): JSX.Element {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Expense Report</h2>
        <p className="text-sm text-muted-foreground">
          Category breakdown for all expenses
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-muted-foreground hover:text-foreground"
        title="Close"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

// All Stats Component (Combined)
function AllStats({
  stats,
}: {
  stats: ReportStats;
}): JSX.Element {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xs">
        <p className="text-xs text-muted-foreground mb-1">Total Expenses</p>
        <p className="text-xl font-bold">₹{stats.totalAmount.toFixed(2)}</p>
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xs">
        <p className="text-xs text-muted-foreground mb-1">Transactions</p>
        <p className="text-xl font-bold">{stats.expenseCount}</p>
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xs">
        <p className="text-xs text-muted-foreground mb-1">Average Expense</p>
        <p className="text-xl font-bold">₹{stats.averageExpense.toFixed(2)}</p>
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xs">
        <p className="text-xs text-muted-foreground mb-1">Highest</p>
        <p className="text-xl font-bold">₹{stats.highestExpense.toFixed(2)}</p>
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xs">
        <p className="text-xs text-muted-foreground mb-1">Lowest</p>
        <p className="text-xl font-bold">₹{stats.lowestExpense.toFixed(2)}</p>
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xs">
        <p className="text-xs text-muted-foreground mb-1">Spending Range</p>
        <p className="text-xl font-bold">₹{stats.spendingRange.toFixed(2)}</p>
      </div>
    </div>
  );
}

// Chart Legend Component
function ChartLegend({
  breakdown,
}: {
  breakdown: CategoryBreakdown[];
}): JSX.Element {
  return (
    <div className="space-y-0">
      {breakdown.map((item, index) => (
        <div
          key={item.category}
          className="flex items-center gap-1 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-default"
        >
          <div
            className="w-3 h-3 rounded-sm flex-shrink-0"
            style={{ backgroundColor: getCategoryColor(index) }}
          />
          <span className="text-sm font-medium truncate">{item.category}</span>
        </div>
      ))}
    </div>
  );
}

// Pie Chart Component
function ChartSection({
  chartData,
  breakdown,
  colors,
}: {
  chartData: Array<{ name: string; value: number }>;
  breakdown: CategoryBreakdown[];
  colors: string[];
}): JSX.Element {
  return (
    <div className="mb-8 bg-slate-50 dark:bg-slate-900 p-6 rounded-xs">
      <div className="flex gap-6" style={{ height: "360px" }}>
        {/* Chart on left (70%) */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: "70%" }}
        >
          <ResponsiveContainer width="100%" height={450}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }) => {
                  if (percent === undefined) return "";
                  return `${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {colors.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => {
                  if (value === undefined) return "N/A";
                  if (Array.isArray(value)) {
                    return value.map((v) => {
                      const numValue =
                        typeof v === "string" ? parseFloat(v) : v;
                      return `₹${numValue.toFixed(2)}`;
                    });
                  }
                  const numValue =
                    typeof value === "string" ? parseFloat(value) : value;
                  return `₹${numValue.toFixed(2)}`;
                }}
                contentStyle={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  borderRadius: "4px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend on right (30%) */}
        <div className="overflow-y-auto flex-1" style={{ width: "30%" }}>
          <h4 className="font-semibold text-sm mb-4 text-slate-900 dark:text-slate-50 sticky top-0 bg-slate-50 dark:bg-slate-900 py-1">
            Category Details
          </h4>
          <ChartLegend breakdown={breakdown} />
        </div>
      </div>
    </div>
  );
}

// Category Breakdown Table Component
function CategoryTable({
  breakdown,
  totalAmount,
  expenseCount,
}: {
  breakdown: CategoryBreakdown[];
  totalAmount: number;
  expenseCount: number;
}): JSX.Element {
  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-3">Category Breakdown</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-2 px-3 font-semibold">Category</th>
              <th className="text-right py-2 px-3 font-semibold">Amount</th>
              <th className="text-right py-2 px-3 font-semibold">Percentage</th>
              <th className="text-right py-2 px-3 font-semibold">Count</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((item, index) => (
              <tr
                key={item.category}
                className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50"
              >
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: getCategoryColor(index) }}
                    />
                    {item.category}
                  </div>
                </td>
                <td className="text-right py-3 px-3 font-semibold">
                  ₹{item.amount.toFixed(2)}
                </td>
                <td className="text-right py-3 px-3">
                  {item.percentage.toFixed(2)}%
                </td>
                <td className="text-right py-3 px-3 text-muted-foreground">
                  {item.count}
                </td>
              </tr>
            ))}
            <tr className="font-semibold bg-slate-50 dark:bg-slate-900/50">
              <td className="py-3 px-3">Total</td>
              <td className="text-right py-3 px-3">
                ₹{totalAmount.toFixed(2)}
              </td>
              <td className="text-right py-3 px-3">100.00%</td>
              <td className="text-right py-3 px-3">{expenseCount}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Footer Component
function ReportFooter({ onClose }: { onClose: () => void }): JSX.Element {
  return (
    <div className="flex justify-end gap-3">
      <Button variant="outline" onClick={onClose} className="rounded-xs">
        Close
      </Button>
    </div>
  );
}

// Main Report Content Component
function ReportContent({
  breakdown,
  stats,
  onClose,
}: {
  breakdown: CategoryBreakdown[];
  stats: ReportStats;
  onClose: () => void;
}): JSX.Element {
  const colors = breakdown.map((_, index) => getCategoryColor(index));
  const chartData = breakdown.map((item) => ({
    name: item.category,
    value: item.amount,
  }));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <Card className="rounded-xs max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 pt-2">
          <ReportHeader onClose={onClose} />
          <AllStats stats={stats} />
          <ChartSection
            chartData={chartData}
            breakdown={breakdown}
            colors={colors}
          />
          <CategoryTable
            breakdown={breakdown}
            totalAmount={stats.totalAmount}
            expenseCount={stats.expenseCount}
          />
          <ReportFooter onClose={onClose} />
        </div>
      </Card>
    </div>
  );
}

// Main Modal Component
export function ExpenseReportModal({
  isOpen,
  isLoading,
  onClose,
}: ExpenseReportModalProps): JSX.Element | null {
  const [reportData, setReportData] = useState<ExpenseReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchReport = async () => {
      setLocalLoading(true);
      setError(null);
      
      const response = await reportService.fetchReport();
      
      if (response.success) {
        setReportData(response);
      } else {
        setError(response.message || "Failed to fetch report");
        setReportData(null);
      }
      
      setLocalLoading(false);
    };

    fetchReport();
  }, [isOpen]);

  if (!isOpen) return null;

  const showLoading = isLoading || localLoading;

  if (showLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <Card className="rounded-xs p-8 max-w-2xl w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Error</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">{error}</p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose} className="rounded-xs">
              Close
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!reportData || reportData.breakdown.length === 0) {
    return <EmptyState onClose={onClose} />;
  }

  return (
    <ReportContent
      breakdown={reportData.breakdown}
      stats={reportData.stats}
      onClose={onClose}
    />
  );
}
