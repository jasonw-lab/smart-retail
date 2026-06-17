'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/format';
import { useDispose } from '../hooks/use-inventory';
import type { Inventory, InventoryLot } from '../types/inventory';

interface DisposeDialogProps {
  inventory: Inventory | null;
  lot: InventoryLot | null;
  open: boolean;
  onClose: () => void;
}

const disposeReasons = [
  { value: 'EXPIRED', label: '期限切れ' },
  { value: 'DAMAGED', label: '破損' },
  { value: 'QUALITY', label: '品質不良' },
  { value: 'INVENTORY_ADJUSTMENT', label: '棚卸差異' },
  { value: 'OTHER', label: 'その他' },
];

export function DisposeDialog({
  inventory,
  lot,
  open,
  onClose,
}: DisposeDialogProps) {
  const dispose = useDispose();

  // デフォルト理由: 期限切れの場合は「期限切れ」
  const isExpired = lot?.expiryDate && new Date(lot.expiryDate) < new Date();
  const [form, setForm] = useState({
    quantity: lot?.quantity.toString() || '',
    reason: isExpired ? 'EXPIRED' : '',
    note: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lot) return;

    const quantity = parseInt(form.quantity, 10);
    if (isNaN(quantity) || quantity <= 0 || quantity > lot.quantity) {
      toast.error(`廃棄数量は1〜${lot.quantity}を入力してください`);
      return;
    }
    if (!form.reason) {
      toast.error('理由を選択してください');
      return;
    }

    try {
      await dispose.mutateAsync({
        lotId: lot.id,
        quantity,
        reason: form.reason,
        note: form.note || undefined,
      });
      toast.success('廃棄を記録しました');
      setForm({ quantity: '', reason: '', note: '' });
      onClose();
    } catch {
      toast.error('登録に失敗しました');
    }
  };

  if (!inventory || !lot) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>🗑️ 廃棄（在庫調整）</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">店舗名</span>
              <span>{inventory.storeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">商品名</span>
              <span>{inventory.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ロット</span>
              <span>{lot.lotNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">賞味期限</span>
              <span className={isExpired ? 'text-destructive font-medium' : ''}>
                {lot.expiryDate ? formatDate(lot.expiryDate) : '-'}
                {isExpired && ' (期限切れ)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">現在在庫</span>
              <span>{lot.quantity}個</span>
            </div>
          </div>

          <hr />

          <div className="space-y-2">
            <Label htmlFor="quantity">
              廃棄数量 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={lot.quantity}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder={`1〜${lot.quantity}`}
            />
          </div>

          <div className="space-y-2">
            <Label>
              理由 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.reason}
              onValueChange={(v) => setForm({ ...form, reason: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="理由を選択" />
              </SelectTrigger>
              <SelectContent>
                {disposeReasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">備考</Label>
            <Textarea
              id="note"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={dispose.isPending}
            >
              {dispose.isPending ? '登録中...' : '登録'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
