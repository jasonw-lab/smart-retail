'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        // 正常/稼働中 - 緑
        success:
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        // 注意/警告 - 黄
        warning:
          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        // エラー/停止 - 赤
        error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        // メンテナンス/情報 - 灰
        muted:
          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        // 処理中/アクティブ - 青
        info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        // 在庫過多 - オレンジ
        orange:
          'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      },
    },
    defaultVariants: {
      variant: 'muted',
    },
  }
);

export interface StatusBadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  /** ドット表示 */
  showDot?: boolean;
}

export function StatusBadge({
  className,
  variant,
  showDot = true,
  children,
  ...props
}: StatusBadgeProps) {
  const dotColorMap: Record<string, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    muted: 'bg-slate-400',
    info: 'bg-blue-500',
    orange: 'bg-orange-500',
  };

  return (
    <span
      className={cn(statusBadgeVariants({ variant }), className)}
      {...props}
    >
      {showDot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            dotColorMap[variant || 'muted']
          )}
        />
      )}
      {children}
    </span>
  );
}
