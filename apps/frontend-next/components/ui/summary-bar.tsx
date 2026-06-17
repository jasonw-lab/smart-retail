'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SummaryItem {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  /** クリック可能な場合 */
  onClick?: () => void;
  /** アクティブ状態 */
  active?: boolean;
  /** バッジの色 (優先度別など) */
  color?: string;
}

export interface SummaryBarProps extends React.HTMLAttributes<HTMLDivElement> {
  items: SummaryItem[];
}

export function SummaryBar({ items, className, ...props }: SummaryBarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-4 rounded-lg bg-muted/50 px-4 py-3',
        className
      )}
      {...props}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <div className="h-8 w-px bg-border" aria-hidden />}
          <div
            className={cn(
              'flex items-center gap-2',
              item.onClick &&
                'cursor-pointer hover:opacity-80 transition-opacity',
              item.active &&
                'ring-2 ring-primary ring-offset-2 rounded-md px-2 -mx-2'
            )}
            onClick={item.onClick}
            role={item.onClick ? 'button' : undefined}
            tabIndex={item.onClick ? 0 : undefined}
            onKeyDown={
              item.onClick
                ? (e) => e.key === 'Enter' && item.onClick?.()
                : undefined
            }
          >
            {item.icon && (
              <span className="text-muted-foreground">{item.icon}</span>
            )}
            <span className="text-sm text-muted-foreground">{item.label}:</span>
            {item.color ? (
              <span
                className="rounded-full px-2.5 py-0.5 text-sm font-semibold text-white"
                style={{ backgroundColor: item.color }}
              >
                {item.value}
              </span>
            ) : (
              <span className="text-sm font-semibold">{item.value}</span>
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
