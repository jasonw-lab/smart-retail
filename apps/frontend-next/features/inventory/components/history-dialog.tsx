'use client';

import { useTranslations } from 'next-intl';
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
import { formatDateShort } from '@/lib/format';
import { TESTIDS } from '@/lib/testing/testids';
import { useInventoryHistory } from '../hooks/use-inventory';
import type { Inventory, StockHistoryTypeType } from '../types/inventory';

interface HistoryDialogProps {
  inventory: Inventory | null;
  open: boolean;
  onClose: () => void;
}

export function HistoryDialog({ inventory, open, onClose }: HistoryDialogProps) {
  const t = useTranslations('inventory');
  const tCommon = useTranslations('common');
  const { data: history = [], isLoading } = useInventoryHistory(
    inventory?.storeId || 0,
    inventory?.productId || 0
  );

  const stockHistoryTypeLabels: Record<StockHistoryTypeType, string> = {
    IN: t('typeIn'),
    OUT: t('typeOut'),
    DISPOSE: t('typeDisposal'),
    SALE: t('typeSale'),
  };

  if (!inventory) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-testid={TESTIDS.INVENTORY_HISTORY_DIALOG} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t('historyDialogTitle', {
              storeName: inventory.storeName ?? '',
              productName: inventory.productName,
            })}
          </DialogTitle>
        </DialogHeader>

        <div data-testid={TESTIDS.INVENTORY_HISTORY_TABLE} className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">{tCommon('loading')}</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t('noHistory')}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead>{t('type')}</TableHead>
                  <TableHead className="text-right">{t('quantity')}</TableHead>
                  <TableHead>{t('lotNumber')}</TableHead>
                  <TableHead>{t('remarks')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm">{formatDateShort(item.createdAt)}</TableCell>
                    <TableCell>{stockHistoryTypeLabels[item.type] ?? item.type}</TableCell>
                    <TableCell className="text-right font-mono">
                      {item.type === 'IN' ? '+' : '-'}
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.lotNumber || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-[100px]">
                      {item.note || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter>
          <Button data-testid={TESTIDS.INVENTORY_HISTORY_CLOSE} variant="outline" onClick={onClose}>
            {tCommon('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
