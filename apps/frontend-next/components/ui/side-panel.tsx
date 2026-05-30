'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  /** パネル幅 */
  width?: number | string;
  /** フッターアクション */
  footer?: React.ReactNode;
}

export function SidePanel({
  open,
  onClose,
  title,
  children,
  width = 400,
  footer,
}: SidePanelProps) {
  // ESCキーでクローズ
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // スクロール防止
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* パネル */}
      <aside
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full flex-col border-l bg-background shadow-lg',
          'animate-in slide-in-from-right duration-300'
        )}
        style={{ width: typeof width === 'number' ? `${width}px` : width }}
        role="dialog"
        aria-modal="true"
      >
        {/* ヘッダー */}
        <div className="flex h-14 items-center justify-between border-b px-4">
          {title && (
            <h2 className="text-lg font-semibold">{title}</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="ml-auto"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">閉じる</span>
          </Button>
        </div>
        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
        {/* フッター */}
        {footer && (
          <div className="border-t p-4">
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}

/**
 * セクション見出し
 */
export function SidePanelSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

/**
 * 詳細リスト
 */
export function SidePanelDetail({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
