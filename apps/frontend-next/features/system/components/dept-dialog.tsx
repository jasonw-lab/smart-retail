'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useCreateDept, useUpdateDept, useDeptOptions } from '../hooks/use-dept';
import { createDeptFormSchema, type DeptFormValues } from '../schemas/dept-schema';
import type { Dept, DeptOption } from '../types/dept';

type DeptFormData = DeptFormValues;

interface DeptDialogProps {
  open: boolean;
  onClose: () => void;
  parentId?: number;
  dept?: Dept;
}

export function DeptDialog({ open, onClose, parentId, dept }: DeptDialogProps) {
  const t = useTranslations('system.dept');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');
  const createMutation = useCreateDept();
  const updateMutation = useUpdateDept();
  const { data: deptOptions = [] } = useDeptOptions();
  const isEditing = !!dept;

  const deptSchema = useMemo(() => createDeptFormSchema(tValidation), [tValidation]);

  const form = useForm<DeptFormData>({
    resolver: zodResolver(deptSchema),
    defaultValues: {
      parentId: 0,
      name: '',
      code: '',
      sort: 1,
      status: 1,
    },
  });

  useEffect(() => {
    if (open) {
      if (dept) {
        form.reset({
          parentId: dept.parentId,
          name: dept.name,
          code: dept.code,
          sort: dept.sort,
          status: dept.status,
        });
      } else {
        form.reset({
          parentId: parentId ?? 0,
          name: '',
          code: '',
          sort: 1,
          status: 1,
        });
      }
    }
  }, [open, dept, parentId, form]);

  const onSubmit = async (data: DeptFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: dept.id, data });
        toast.success(t('updateSuccess'));
      } else {
        await createMutation.mutateAsync(data);
        toast.success(t('createSuccess'));
      }
      onClose();
    } catch {
      toast.error(isEditing ? t('updateFailed') : t('createFailed'));
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const flattenOptions = (options: DeptOption[], level = 0): { value: number; label: string }[] => {
    const result: { value: number; label: string }[] = [];
    for (const opt of options) {
      result.push({ value: opt.value, label: '　'.repeat(level) + opt.label });
      if (opt.children) {
        result.push(...flattenOptions(opt.children, level + 1));
      }
    }
    return result;
  };

  const flatOptions = [{ value: 0, label: t('topLevel') }, ...flattenOptions(deptOptions)];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('editTitle') : t('addTitle')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('parentDept')}</Label>
            <Select
              value={String(form.watch('parentId'))}
              onValueChange={(v) => form.setValue('parentId', parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {flatOptions.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{t('deptName')} *</Label>
            <Input id="name" {...form.register('name')} placeholder={t('deptNamePlaceholder')} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">{t('deptCode')} *</Label>
            <Input id="code" {...form.register('code')} placeholder={t('deptCodePlaceholder')} />
            {form.formState.errors.code && (
              <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sort">{t('orderNum')}</Label>
              <Input
                id="sort"
                type="number"
                {...form.register('sort', { valueAsNumber: true })}
                min={0}
              />
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
                  <SelectItem value="1">{t('statusNormal')}</SelectItem>
                  <SelectItem value="0">{t('statusDisabled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
