'use client';

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
import { useInventoryHistory } from '../hooks/use-inventory';
import { StockHistoryTypeLabel, type Inventory } from '../types/inventory';

interface HistoryDialogProps {
  inventory: Inventory | null;
  open: boolean;
  onClose: () => void;
}

export function HistoryDialog({
  inventory,
  open,
  onClose,
}: HistoryDialogProps) {
  const { data: history = [], isLoading } = useInventoryHistory(
    inventory?.storeId || 0,
    inventory?.productId || 0
  );

  if (!inventory) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            📋 入出庫履歴 - {inventory.storeName} / {inventory.productName}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              読み込み中...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              履歴がありません
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日時</TableHead>
                  <TableHead>種別</TableHead>
                  <TableHead className="text-right">数量</TableHead>
                  <TableHead>ロット</TableHead>
                  <TableHead>備考</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm">
                      {formatDateShort(item.createdAt)}
                    </TableCell>
                    <TableCell>{StockHistoryTypeLabel[item.type]}</TableCell>
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
          <Button variant="outline" onClick={onClose}>
            閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
