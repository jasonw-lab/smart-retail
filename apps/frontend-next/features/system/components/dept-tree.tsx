'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDepts } from '../hooks/use-dept';
import type { Dept } from '../types/dept';

interface DeptTreeProps {
  selectedId?: number;
  onSelect: (id: number | undefined) => void;
}

export function DeptTree({ selectedId, onSelect }: DeptTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const { data: depts = [], isLoading } = useDepts();

  const toggleExpand = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  const renderNode = (dept: Dept, level: number = 0) => {
    const hasChildren = dept.children && dept.children.length > 0;
    const isExpanded = expandedIds.has(dept.id);
    const isSelected = selectedId === dept.id;

    return (
      <div key={dept.id}>
        <div
          className={cn(
            'flex items-center gap-1 py-1.5 px-2 rounded cursor-pointer hover:bg-muted/50 transition-colors',
            isSelected && 'bg-primary/10 text-primary'
          )}
          style={{ paddingLeft: level * 16 + 8 }}
          onClick={() => onSelect(isSelected ? undefined : dept.id)}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => toggleExpand(dept.id, e)}
              className="p-0.5 hover:bg-muted rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm truncate">{dept.name}</span>
        </div>
        {hasChildren &&
          isExpanded &&
          dept.children!.map((child) => renderNode(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="border rounded-lg p-3">
      <h3 className="font-medium mb-3 text-sm text-muted-foreground">部門</h3>
      {isLoading ? (
        <div className="text-center py-4 text-sm text-muted-foreground">
          読み込み中...
        </div>
      ) : depts.length === 0 ? (
        <div className="text-center py-4 text-sm text-muted-foreground">
          部門がありません
        </div>
      ) : (
        <div className="space-y-0.5">
          <div
            className={cn(
              'flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer hover:bg-muted/50 transition-colors',
              selectedId === undefined && 'bg-primary/10 text-primary'
            )}
            onClick={() => onSelect(undefined)}
          >
            <Building2 className="h-4 w-4" />
            <span className="text-sm">すべての部門</span>
          </div>
          {depts.map((dept) => renderNode(dept))}
        </div>
      )}
    </div>
  );
}
