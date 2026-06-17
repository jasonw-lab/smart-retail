'use client';

import * as React from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sticky?: boolean;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowKey: (row: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  sortKey?: string | null;
  sortDirection?: SortDirection;
  onSort?: (key: string, direction: SortDirection) => void;
  selectable?: boolean;
  selectedKeys?: Set<string | number>;
  onSelectionChange?: (keys: Set<string | number>) => void;
  onRowClick?: (row: T) => void;
  rowClickable?: boolean;
  pagination?: {
    pageNum: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
  };
  getRowColorBar?: (row: T) => string | null;
  isRowHighlighted?: (row: T) => boolean;
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  isLoading = false,
  emptyMessage = 'No data available',
  sortKey,
  sortDirection,
  onSort,
  selectable = false,
  selectedKeys = new Set(),
  onSelectionChange,
  onRowClick,
  rowClickable = false,
  pagination,
  getRowColorBar,
  isRowHighlighted,
}: DataTableProps<T>) {
  const handleSort = (key: string) => {
    if (!onSort) return;
    let newDirection: SortDirection = 'asc';
    if (sortKey === key) {
      if (sortDirection === 'asc') newDirection = 'desc';
      else if (sortDirection === 'desc') newDirection = null;
    }
    onSort(key, newDirection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(new Set(data.map(getRowKey)));
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectRow = (key: string | number, checked: boolean) => {
    if (!onSelectionChange) return;
    const newSet = new Set(selectedKeys);
    if (checked) {
      newSet.add(key);
    } else {
      newSet.delete(key);
    }
    onSelectionChange(newSet);
  };

  const allSelected =
    data.length > 0 && data.every((row) => selectedKeys.has(getRowKey(row)));
  const someSelected = data.some((row) => selectedKeys.has(getRowKey(row)));

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 0;

  return (
    <div className="flex flex-col">
      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface sticky top-0 z-10">
              {selectable && (
                <TableHead className="w-10 p-4 border-b border-outline-variant">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    className="border-outline-variant text-primary"
                    aria-label="Select all"
                    {...(someSelected && !allSelected
                      ? { 'data-state': 'indeterminate' }
                      : {})}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  style={{ width: column.width }}
                  className={cn(
                    'p-4 border-b border-outline-variant text-xs font-semibold text-on-surface-variant',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sticky &&
                      'sticky right-0 bg-surface shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]'
                  )}
                >
                  {column.sortable && onSort ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 text-xs font-semibold"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.header}
                      {sortKey === column.key ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : sortDirection === 'desc' ? (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                      )}
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-outline-variant/30">
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-on-surface-variant">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!isLoading && data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="h-24 text-center text-on-surface-variant"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              data.map((row, rowIndex) => {
                const rowKey = getRowKey(row);
                const isSelected = selectedKeys.has(rowKey);
                const colorBar = getRowColorBar?.(row);
                const isHighlighted = isRowHighlighted?.(row);

                return (
                  <TableRow
                    key={rowKey}
                    className={cn(
                      'hover:bg-surface-container-low transition-colors group',
                      rowClickable && 'cursor-pointer',
                      isSelected && 'bg-surface-container-low',
                      isHighlighted && 'bg-error-container/20'
                    )}
                    onClick={() => onRowClick?.(row)}
                    data-state={isSelected ? 'selected' : undefined}
                  >
                    {selectable && (
                      <TableCell className="p-4 relative">
                        {colorBar && (
                          <span
                            className="absolute left-0 top-0 h-full w-1"
                            style={{ backgroundColor: colorBar }}
                          />
                        )}
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleSelectRow(rowKey, !!checked)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="border-outline-variant text-primary"
                          aria-label="Select row"
                        />
                      </TableCell>
                    )}
                    {!selectable && colorBar && (
                      <td className="relative w-0 p-0">
                        <span
                          className="absolute left-0 top-0 h-full w-1"
                          style={{ backgroundColor: colorBar }}
                        />
                      </td>
                    )}
                    {columns.map((column) => {
                      const value = (row as Record<string, unknown>)[
                        column.key
                      ];
                      return (
                        <TableCell
                          key={column.key}
                          className={cn(
                            'p-4 text-sm',
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right',
                            column.sticky &&
                              'sticky right-0 bg-surface group-hover:bg-surface-container-low transition-colors shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]'
                          )}
                        >
                          {column.render
                            ? column.render(value, row, rowIndex)
                            : (value as React.ReactNode)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - Stitch style */}
      {pagination && totalPages > 0 && (
        <div className="p-4 bg-surface border-t border-outline-variant flex justify-between items-center text-xs">
          <div className="text-on-surface-variant">
            Total {pagination.total} items
          </div>
          <div className="flex items-center gap-2">
            {pagination.onPageSizeChange && (
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(value) =>
                  pagination.onPageSizeChange?.(Number(value))
                }
              >
                <SelectTrigger className="h-8 w-24 text-xs bg-surface border-outline-variant">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(pagination.pageSizeOptions || [10, 20, 50, 100]).map(
                    (size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}/page
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            )}
            <nav className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-outline-variant hover:bg-surface-container-high"
                onClick={() => pagination.onPageChange(pagination.pageNum - 1)}
                disabled={pagination.pageNum <= 1}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                size="sm"
                className="h-8 px-3 bg-primary text-primary-foreground font-bold"
              >
                {pagination.pageNum}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-outline-variant hover:bg-surface-container-high"
                onClick={() => pagination.onPageChange(pagination.pageNum + 1)}
                disabled={pagination.pageNum >= totalPages}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </nav>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span>Go to</span>
              <input
                type="text"
                className="w-10 h-8 border border-outline-variant rounded px-2 text-center text-xs focus:ring-primary focus:border-primary bg-surface"
                defaultValue={pagination.pageNum}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const page = parseInt((e.target as HTMLInputElement).value);
                    if (page >= 1 && page <= totalPages) {
                      pagination.onPageChange(page);
                    }
                  }
                }}
              />
              <span>page</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
