'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useReplenish } from '../hooks/use-inventory';
import type { Inventory } from '../types/inventory';

interface ReplenishDialogProps {
  inventory: Inventory | null;
  open: boolean;
  onClose: () => void;
}

export function ReplenishDialog({ inventory, open, onClose }: ReplenishDialogProps) {
  const replenish = useReplenish();
  const [form, setForm] = useState({
    quantity: '',
    lotNumber: '',
    expiryDate: '',
    note: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventory) return;

    const quantity = parseInt(form.quantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error('補充数量は1以上を入力してください');
      return;
    }

    try {
      await replenish.mutateAsync({
        storeId: inventory.storeId,
        productId: inventory.productId,
        quantity,
        lotNumber: form.lotNumber || undefined,
        expiryDate: form.expiryDate || undefined,
        note: form.note || undefined,
      });
      toast.success('補充を記録しました');
      setForm({ quantity: '', lotNumber: '', expiryDate: '', note: '' });
      onClose();
    } catch {
      toast.error('登録に失敗しました');
    }
  };

  if (!inventory) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>📦 補充記録</DialogTitle>
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
              <span className="text-muted-foreground">現在在庫</span>
              <span>{inventory.totalQuantity}個</span>
            </div>
          </div>

          <hr />

          <div className="space-y-2">
            <Label htmlFor="quantity">
              補充数量 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lotNumber">ロット番号</Label>
            <Input
              id="lotNumber"
              value={form.lotNumber}
              onChange={(e) => setForm({ ...form, lotNumber: e.target.value })}
              placeholder="LOT-2026-0128"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">賞味期限</Label>
            <Input
              id="expiryDate"
              type="date"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">備考</Label>
            <Textarea
              id="note"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="定期補充"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={replenish.isPending}>
              {replenish.isPending ? '登録中...' : '登録'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
