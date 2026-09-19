'use client';

import { Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
import { TESTIDS } from '@/lib/testing/testids';
import { formatCurrency, formatDateTime } from '@/lib/format';
import {
  getPaymentMethodIcon,
  getPaymentMethodLabel,
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
  const t = useTranslations('transactions');
  const tCommon = useTranslations('common');

  if (!transaction) return null;

  const handleCopyReferenceId = () => {
    if (transaction.referenceId) {
      navigator.clipboard.writeText(transaction.referenceId);
      toast.success(t('copySuccess'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-testid={TESTIDS.TRANSACTION_DETAIL_DIALOG} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('detailTitle', { orderNumber: transaction.orderNumber })}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 決済情報 */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('paymentInfo')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('orderNumber')}</span>
                <span className="font-mono">{transaction.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('store')}</span>
                <span>{transaction.storeName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('transactionDate')}</span>
                <span>{formatDateTime(transaction.transactionTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('totalAmount')}</span>
                <span className="font-semibold text-base">
                  {formatCurrency(transaction.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('paymentMethod')}</span>
                <span>
                  {getPaymentMethodIcon(transaction.paymentMethod)}{' '}
                  {getPaymentMethodLabel(transaction.paymentMethod)}
                </span>
              </div>
              {transaction.paymentProvider && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('provider')}</span>
                  <span>{transaction.paymentProvider}</span>
                </div>
              )}
              {transaction.referenceId && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('paymentRef')}</span>
                  <div className="flex items-center gap-1">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {transaction.referenceId}
                    </code>
                    <Button
                      data-testid={TESTIDS.TRANSACTION_COPY_REFERENCE}
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
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('purchasedItems')}</h3>
              <div
                data-testid={TESTIDS.TRANSACTION_DETAIL_ITEMS_TABLE}
                className="rounded-md border"
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('productName')}</TableHead>
                      <TableHead className="text-center w-16">{t('quantity')}</TableHead>
                      <TableHead className="text-right w-20">{t('unitPrice')}</TableHead>
                      <TableHead className="text-right w-24">{t('subtotal')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transaction.details.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell className="truncate max-w-[150px]">
                          {detail.productName}
                        </TableCell>
                        <TableCell className="text-center">{detail.quantity}</TableCell>
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
                <span className="text-sm text-muted-foreground mr-2">{t('total')}</span>
                <span className="font-semibold">{formatCurrency(transaction.totalAmount)}</span>
              </div>
            </section>
          )}
        </div>

        <DialogFooter>
          <Button
            data-testid={TESTIDS.TRANSACTION_DETAIL_CLOSE}
            variant="outline"
            onClick={onClose}
          >
            {tCommon('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
