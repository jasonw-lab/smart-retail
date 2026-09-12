'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
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
import { useCreateNotice, useUpdateNotice } from '../hooks/use-notice';
import { noticeFormSchema, type NoticeFormValues } from '../schemas/notice-schema';
import type { Notice } from '../types/notice';

interface NoticeDialogProps {
  open: boolean;
  onClose: () => void;
  notice: Notice | null;
}

function resolveLevel(notice: Notice): string {
  if (notice.level) return notice.level;
  switch (notice.priority) {
    case 0:
      return 'L';
    case 2:
      return 'H';
    default:
      return 'M';
  }
}

export function NoticeDialog({ open, onClose, notice }: NoticeDialogProps) {
  const t = useTranslations('system.notice');
  const tCommon = useTranslations('common');
  const createMutation = useCreateNotice();
  const updateMutation = useUpdateNotice();
  const isEditing = !!notice;

  const form = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues: {
      title: '',
      content: '',
      type: 1 as const,
      level: 'M' as const,
      targetType: 0 as const,
      targetUserIds: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (notice) {
        form.reset({
          title: notice.title,
          content: notice.content || '',
          type: (notice.type as 1 | 2) ?? (1 as const),
          level: (resolveLevel(notice) as 'L' | 'M' | 'H') ?? ('M' as const),
          targetType: (notice.targetType as 0 | 1) ?? (0 as const),
          targetUserIds: notice.targetUserIds || '',
        });
      } else {
        form.reset({
          title: '',
          content: '',
          type: 1 as const,
          level: 'M' as const,
          targetType: 0 as const,
          targetUserIds: '',
        });
      }
    }
  }, [open, notice, form]);

  const levelToPriority = (level: string): number => {
    switch (level) {
      case 'L':
        return 0;
      case 'H':
        return 2;
      case 'M':
      default:
        return 1;
    }
  };

  const onSubmit = async (data: NoticeFormValues) => {
    const payload = { ...data, priority: levelToPriority(data.level) };
    if (isEditing) {
      await updateMutation.mutateAsync({ id: notice.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('edit') : t('add')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('titleLabel')} *</Label>
            <Input id="title" {...form.register('title')} placeholder={t('titlePlaceholder')} />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">{t('content')}</Label>
            <Textarea
              id="content"
              {...form.register('content')}
              placeholder={t('contentPlaceholder')}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('typeLabel')}</Label>
              <Select
                value={String(form.watch('type'))}
                onValueChange={(v) => form.setValue('type', parseInt(v, 10) as 1 | 2)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t('typeOption1')}</SelectItem>
                  <SelectItem value="2">{t('typeOption2')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('priorityLabel')}</Label>
              <Select
                value={form.watch('level')}
                onValueChange={(v) => form.setValue('level', v as 'L' | 'M' | 'H')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">{t('priorityLow')}</SelectItem>
                  <SelectItem value="M">{t('priorityMedium')}</SelectItem>
                  <SelectItem value="H">{t('priorityHigh')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('targetTypeLabel')}</Label>
              <Select
                value={String(form.watch('targetType'))}
                onValueChange={(v) => form.setValue('targetType', parseInt(v, 10) as 0 | 1)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t('targetAll')}</SelectItem>
                  <SelectItem value="1">{t('targetSpecific')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.watch('targetType') === 1 && (
            <div className="space-y-2">
              <Label htmlFor="targetUserIds">{t('targetUserIds')}</Label>
              <Input
                id="targetUserIds"
                {...form.register('targetUserIds')}
                placeholder={t('targetUserIdsPlaceholder')}
              />
            </div>
          )}

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
