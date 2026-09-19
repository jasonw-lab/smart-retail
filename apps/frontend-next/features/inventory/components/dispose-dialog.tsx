'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
import { TESTIDS } from '@/lib/testing/testids';
import { useDispose } from '../hooks/use-inventory';
import type { Inventory, InventoryLot } from '../types/inventory';

interface DisposeDialogProps {
  inventory: Inventory | null;
  lot: InventoryLot | null;
  open: boolean;
  onClose: () => void;
}

export function DisposeDialog({ inventory, lot, open, onClose }: DisposeDialogProps) {
  const t = useTranslations('inventory');
  const tCommon = useTranslations('common');
  const dispose = useDispose();

  const disposeReasons = [
    { value: 'EXPIRED', label: t('reasonExpired') },
    { value: 'DAMAGED', label: t('reasonDamaged') },
    { value: 'QUALITY', label: t('reasonQuality') },
    { value: 'INVENTORY_ADJUSTMENT', label: t('reasonAdjustment') },
    { value: 'OTHER', label: t('reasonOther') },
  ];

  // デフォルト理由: 期限切れの場合は「期限切れ」
  const isExpired = lot?.expiryDate && new Date(lot.expiryDate) < new Date();
  const [form, setForm] = useState({
    quantity: lot?.quantity.toString() || '',
    reason: isExpired ? 'EXPIRED' : '',
    note: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventory || !lot) return;

    const quantity = parseInt(form.quantity, 10);
    if (isNaN(quantity) || quantity <= 0 || quantity > lot.quantity) {
      toast.error(t('quantityRangeError', { max: lot.quantity }));
      return;
    }
    if (!form.reason) {
      toast.error(t('reasonRequired'));
      return;
    }

    try {
      await dispose.mutateAsync({
        lotId: lot.id,
        storeId: inventory.storeId,
        productId: inventory.productId,
        lotNumber: lot.lotNumber,
        quantity,
        reason: form.reason,
        note: form.note || undefined,
      });
      toast.success(t('disposeSuccess'));
      setForm({ quantity: '', reason: '', note: '' });
      onClose();
    } catch {
      toast.error(t('disposeFailed'));
    }
  };

  if (!inventory || !lot) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-testid={TESTIDS.INVENTORY_DISPOSE_DIALOG}>
        <DialogHeader>
          <DialogTitle>{t('disposeDialogTitle')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('storeName')}</span>
              <span>{inventory.storeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('productName')}</span>
              <span>{inventory.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('lotNumber')}</span>
              <span>{lot.lotNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('expiryDate')}</span>
              <span className={isExpired ? 'text-destructive font-medium' : ''}>
                {lot.expiryDate ? formatDate(lot.expiryDate) : '-'}
                {isExpired && t('expiredTag')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('currentStock')}</span>
              <span>{lot.quantity}{t('pieces')}</span>
            </div>
          </div>

          <hr />

          <div className="space-y-2">
            <Label htmlFor="quantity">
              {t('disposeQuantity')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quantity"
              data-testid={TESTIDS.INVENTORY_DISPOSE_QUANTITY}
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
              {t('disposeReason')} <span className="text-destructive">*</span>
            </Label>
            <Select value={form.reason} onValueChange={(v) => setForm({ ...form, reason: v })}>
              <SelectTrigger data-testid={TESTIDS.INVENTORY_DISPOSE_REASON}>
                <SelectValue placeholder={t('selectReason')} />
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
            <Label htmlFor="note">{t('remarks')}</Label>
            <Textarea
              id="note"
              data-testid={TESTIDS.INVENTORY_DISPOSE_NOTE}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              data-testid={TESTIDS.INVENTORY_DISPOSE_CANCEL}
              type="button"
              variant="outline"
              onClick={onClose}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              data-testid={TESTIDS.INVENTORY_DISPOSE_SUBMIT}
              type="submit"
              variant="destructive"
              disabled={dispose.isPending}
            >
              {dispose.isPending ? tCommon('saving') : t('submitRegister')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
