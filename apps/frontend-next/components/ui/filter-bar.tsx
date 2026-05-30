'use client';

import * as React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const EMPTY_VALUE_PLACEHOLDER = '__all__';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select';
  placeholder?: string;
  options?: FilterOption[];
  width?: string;
}

export interface FilterBarProps<T extends Record<string, string>> {
  fields: FilterField[];
  values: T;
  onChange: (values: T) => void;
  onSearch: () => void;
  onReset: () => void;
  className?: string;
  actions?: React.ReactNode;
}

export function FilterBar<T extends Record<string, string>>({
  fields,
  values,
  onChange,
  onSearch,
  onReset,
  className,
  actions,
}: FilterBarProps<T>) {
  const handleChange = (key: string, value: string) => {
    onChange({ ...values, [key]: value } as T);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className={cn(
      'bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-6',
      className
    )}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label className="text-xs font-medium text-on-surface-variant">
              {field.label}
            </label>
            {field.type === 'text' ? (
              <Input
                placeholder={field.placeholder}
                value={values[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-surface border-outline-variant rounded-lg px-4 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            ) : (
              <Select
                value={values[field.key] || EMPTY_VALUE_PLACEHOLDER}
                onValueChange={(v) =>
                  handleChange(field.key, v === EMPTY_VALUE_PLACEHOLDER ? '' : v)
                }
              >
                <SelectTrigger className="w-full bg-surface border-outline-variant rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all">
                  <SelectValue placeholder={field.placeholder || 'Select'} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt) => (
                    <SelectItem
                      key={opt.value || EMPTY_VALUE_PLACEHOLDER}
                      value={opt.value || EMPTY_VALUE_PLACEHOLDER}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
        <div className="flex gap-3">
          <Button
            variant="default"
            onClick={onSearch}
            className="flex-1 bg-primary text-primary-foreground font-semibold py-2 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
          >
            <Search className="h-5 w-5" />
            Search
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            className="flex-1 bg-surface-container-low text-on-surface font-semibold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-surface-container-high active:scale-95 transition-all border-outline-variant"
          >
            <RotateCcw className="h-5 w-5" />
            Reset
          </Button>
        </div>
      </div>
      {actions && (
        <div className="mt-4 flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
