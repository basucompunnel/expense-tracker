"use client";

import { useState } from "react";
import { ExpenseCategory, ExpenseFilterOptions } from "@/src/types/expense";
import { Card } from "@/components/ui/card";
import { DatePickerField } from "@/components/common/date-picker-field";
import { SelectField } from "@/components/common/select-field";
import { FilterActions } from "@/components/common/filter-actions";

interface FilterPanelProps {
  onFilterChange: (filters: ExpenseFilterOptions) => void;
  isLoading: boolean;
}

export function FilterPanel({ onFilterChange, isLoading }: FilterPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("-date");

  const handleApplyFilters = () => {
    const filters: ExpenseFilterOptions = {
      sort: sortBy,
    };

    if (selectedCategory) {
      filters.category = selectedCategory as ExpenseCategory;
    }
    if (startDate) {
      filters.startDate = startDate;
    }
    if (endDate) {
      filters.endDate = endDate;
    }

    onFilterChange(filters);
  };

  const handleReset = () => {
    setSelectedCategory("");
    setStartDate(undefined);
    setEndDate(undefined);
    setSortBy("-date");
    onFilterChange({});
  };

  return (
    <Card className="rounded-none p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SelectField
          label="Category"
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          options={Object.values(ExpenseCategory).map((cat) => ({
            value: cat,
            label: cat,
          }))}
          disabled={isLoading}
          placeholder="All Categories"
        />

        <DatePickerField
          label="Start Date"
          selected={startDate}
          onSelect={setStartDate}
          disabled={isLoading}
        />

        <DatePickerField
          label="End Date"
          selected={endDate}
          onSelect={setEndDate}
          disabled={isLoading}
        />

        <SelectField
          label="Sort By"
          value={sortBy}
          onValueChange={setSortBy}
          options={[
            { value: "-date", label: "Newest First" },
            { value: "date", label: "Oldest First" },
            { value: "-amount", label: "Highest Amount" },
            { value: "amount", label: "Lowest Amount" },
          ]}
          disabled={isLoading}
        />
      </div>

      <FilterActions
        onApply={handleApplyFilters}
        onReset={handleReset}
        disabled={isLoading}
      />
    </Card>
  );
}
