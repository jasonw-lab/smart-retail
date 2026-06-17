'use client';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDateTime } from '@/lib/format';
import {
  PaymentMethodLabel,
  PaymentMethodIcon,
  type Transaction,
} from '../types/transaction';

interface TransactionDetailDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
}

export function TransactionDetailDialog({
  transaction,
  open,
  onClose,
}: TransactionDetailDialogProps) {
  if (!transaction) return null;

  const handleCopyReferenceId = () => {
    if (transaction.referenceId) {
      navigator.clipboard.writeText(transaction.referenceId);
      toast.success('決済参照IDをコピーしました');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>💳 決済詳細 - {transaction.orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 決済情報 */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              決済情報
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">注文番号</span>
                <span className="font-mono">{transaction.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">店舗</span>
                <span>{transaction.storeName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">決済日時</span>
                <span>{formatDateTime(transaction.transactionTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">合計金額</span>
                <span className="font-semibold text-base">
                  {formatCurrency(transaction.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">決済方法</span>
                <span>
                  {PaymentMethodIcon[transaction.paymentMethod]}{' '}
                  {PaymentMethodLabel[transaction.paymentMethod]}
                </span>
              </div>
              {transaction.paymentProvider && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">プロバイダ</span>
                  <span>{transaction.paymentProvider}</span>
                </div>
              )}
              {transaction.referenceId && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">決済参照ID</span>
                  <div className="flex items-center gap-1">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {transaction.referenceId}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleCopyReferenceId}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 購入商品 */}
          {transaction.details && transaction.details.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                購入商品
              </h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>商品名</TableHead>
                      <TableHead className="text-center w-16">数量</TableHead>
                      <TableHead className="text-right w-20">単価</TableHead>
                      <TableHead className="text-right w-24">小計</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transaction.details.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell className="truncate max-w-[150px]">
                          {detail.productName}
                        </TableCell>
                        <TableCell className="text-center">
                          {detail.quantity}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(detail.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(detail.subtotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end mt-2">
                <span className="text-sm text-muted-foreground mr-2">
                  合計:
                </span>
                <span className="font-semibold">
                  {formatCurrency(transaction.totalAmount)}
                </span>
              </div>
            </section>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
