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
import { useCreateDict, useUpdateDict } from '../hooks/use-dict';
import { createDictFormSchema, type DictFormValues } from '../schemas/dict-schema';
import type { Dict } from '../types/dict';

interface DictDialogProps {
  open: boolean;
  onClose: () => void;
  dict: Dict | null;
}

export function DictDialog({ open, onClose, dict }: DictDialogProps) {
  const t = useTranslations('system.dict');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');

  const createMutation = useCreateDict();
  const updateMutation = useUpdateDict();
  const isEditing = !!dict;

  const schema = useMemo(() => createDictFormSchema(tValidation), [tValidation]);

  const form = useForm<DictFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      dictCode: '',
      status: 1,
      remark: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (dict) {
        form.reset({
          name: dict.name,
          dictCode: dict.dictCode,
          status: dict.status,
          remark: dict.remark || '',
        });
      } else {
        form.reset({
          name: '',
          dictCode: '',
          status: 1,
          remark: '',
        });
      }
    }
  }, [open, dict, form]);

  const onSubmit = async (data: DictFormValues) => {
    if (isEditing) {
      await updateMutation.mutateAsync({ id: dict.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('editTitle') : t('addTitle')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('dictName')} *</Label>
            <Input id="name" {...form.register('name')} placeholder={t('dictNamePlaceholder')} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dictCode">{t('dictCode')} *</Label>
            <Input
              id="dictCode"
              {...form.register('dictCode')}
              placeholder={t('dictCodePlaceholder')}
              disabled={isEditing}
            />
            {form.formState.errors.dictCode && (
              <p className="text-sm text-destructive">{form.formState.errors.dictCode.message}</p>
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
            <Label htmlFor="remark">{t('remark')}</Label>
            <Textarea id="remark" {...form.register('remark')} placeholder={t('remarkPlaceholder')} rows={3} />
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

