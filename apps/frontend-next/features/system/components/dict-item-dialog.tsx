'use client';

import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateDictItem, useUpdateDictItem } from '../hooks/use-dict-items';
import { createDictItemFormSchema, type DictItemFormValues } from '../schemas/dict-item-schema';
import type { DictItem } from '../types/dict';

interface DictItemDialogProps {
  open: boolean;
  onClose: () => void;
  dictCode: string;
  dictItem: DictItem | null;
}

export function DictItemDialog({ open, onClose, dictCode, dictItem }: DictItemDialogProps) {
  const t = useTranslations('system.dict');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');

  const createMutation = useCreateDictItem();
  const updateMutation = useUpdateDictItem();
  const isEditing = !!dictItem;

  const schema = useMemo(() => createDictItemFormSchema(tValidation), [tValidation]);

  const form = useForm<DictItemFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: '',
      value: '',
      sort: 0,
      status: 1,
      remark: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (dictItem) {
        form.reset({
          label: dictItem.label,
          value: dictItem.value,
          sort: dictItem.sort,
          status: dictItem.status,
          remark: dictItem.remark || '',
        });
      } else {
        form.reset({
          label: '',
          value: '',
          sort: 0,
          status: 1,
          remark: '',
        });
      }
    }
  }, [open, dictItem, form]);

  const onSubmit = async (data: DictItemFormValues) => {
    const payload = { ...data, dictCode };
    if (isEditing) {
      await updateMutation.mutateAsync({ dictCode, id: dictItem.id, data: payload });
    } else {
      await createMutation.mutateAsync({ dictCode, data: payload });
    }
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('editItemTitle') : t('addItemTitle')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">{t('itemLabel')} *</Label>
            <Input id="label" {...form.register('label')} placeholder={t('itemLabelPlaceholder')} />
            {form.formState.errors.label && (
              <p className="text-sm text-destructive">{form.formState.errors.label.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">{t('itemValue')} *</Label>
            <Input id="value" {...form.register('value')} placeholder={t('itemValuePlaceholder')} />
            {form.formState.errors.value && (
              <p className="text-sm text-destructive">{form.formState.errors.value.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort">{t('itemSort')}</Label>
            <Input
              id="sort"
              type="number"
              {...form.register('sort', { valueAsNumber: true })}
              placeholder="0"
            />
            {form.formState.errors.sort && (
              <p className="text-sm text-destructive">{form.formState.errors.sort.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t('status')}</Label>
            <Select
              value={String(form.watch('status'))}
              onValueChange={(v) => form.setValue('status', parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t('statusEnabled')}</SelectItem>
                <SelectItem value="0">{t('statusDisabled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remark">{t('itemRemark')}</Label>
            <Textarea id="remark" {...form.register('remark')} placeholder={t('itemRemarkPlaceholder')} rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? tCommon('saving') : tCommon('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

