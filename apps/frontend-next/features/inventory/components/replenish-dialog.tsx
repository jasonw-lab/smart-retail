'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
import { TESTIDS } from '@/lib/testing/testids';
import { useReplenish } from '../hooks/use-inventory';
import type { Inventory } from '../types/inventory';

interface ReplenishDialogProps {
  inventory: Inventory | null;
  open: boolean;
  onClose: () => void;
}

export function ReplenishDialog({ inventory, open, onClose }: ReplenishDialogProps) {
  const t = useTranslations('inventory');
  const tCommon = useTranslations('common');
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
      toast.error(t('replenishQuantityError'));
      return;
    }

    try {
      await replenish.mutateAsync({
        inventoryId: inventory.id,
        storeId: inventory.storeId,
        productId: inventory.productId,
        quantity,
        lotNumber: form.lotNumber || undefined,
        expiryDate: form.expiryDate || undefined,
        note: form.note || undefined,
      });
      toast.success(t('replenishSuccess'));
      setForm({ quantity: '', lotNumber: '', expiryDate: '', note: '' });
      onClose();
    } catch {
      toast.error(t('replenishFailed'));
    }
  };

  if (!inventory) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-testid={TESTIDS.INVENTORY_REPLENISH_DIALOG}>
        <DialogHeader>
          <DialogTitle>{t('replenishDialogTitle')}</DialogTitle>
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
              <span className="text-muted-foreground">{t('currentStock')}</span>
              <span>{inventory.totalQuantity}{t('pieces')}</span>
            </div>
          </div>

          <hr />

          <div className="space-y-2">
            <Label htmlFor="quantity">
              {t('replenishQuantity')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quantity"
              data-testid={TESTIDS.INVENTORY_REPLENISH_QUANTITY}
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lotNumber">{t('lotNumber')}</Label>
            <Input
              id="lotNumber"
              data-testid={TESTIDS.INVENTORY_REPLENISH_LOT}
              value={form.lotNumber}
              onChange={(e) => setForm({ ...form, lotNumber: e.target.value })}
              placeholder="LOT-2026-0128"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">{t('expiryDate')}</Label>
            <Input
              id="expiryDate"
              data-testid={TESTIDS.INVENTORY_REPLENISH_EXPIRY}
              type="date"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">{t('remarks')}</Label>
            <Textarea
              id="note"
              data-testid={TESTIDS.INVENTORY_REPLENISH_NOTE}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder={t('replenishNotePlaceholder')}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              data-testid={TESTIDS.INVENTORY_REPLENISH_CANCEL}
              type="button"
              variant="outline"
              onClick={onClose}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              data-testid={TESTIDS.INVENTORY_REPLENISH_SUBMIT}
              type="submit"
              disabled={replenish.isPending}
            >
              {replenish.isPending ? tCommon('saving') : t('submitRegister')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
