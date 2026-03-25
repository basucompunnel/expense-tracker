"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectFieldProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  placeholder?: string;
}

export function SelectField({
  label,
  value,
  onValueChange,
  options,
  disabled,
  placeholder = "Select an option",
}: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger disabled={disabled} className="rounded-xs">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xs">
          {options.map((option) => (
            <SelectItem key={option.value} className="rounded-xs" value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
