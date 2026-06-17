'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
  useCreateDept,
  useUpdateDept,
  useDeptOptions,
} from '../hooks/use-dept';
import type { Dept, DeptOption } from '../types/dept';

const deptSchema = z.object({
  parentId: z.number(),
  name: z.string().min(1, '部門名は必須です'),
  code: z.string().min(1, 'コードは必須です'),
  sort: z.number().min(0),
  status: z.number(),
});

type DeptFormData = z.infer<typeof deptSchema>;

interface DeptDialogProps {
  open: boolean;
  onClose: () => void;
  parentId?: number;
  dept?: Dept;
}

export function DeptDialog({ open, onClose, parentId, dept }: DeptDialogProps) {
  const createMutation = useCreateDept();
  const updateMutation = useUpdateDept();
  const { data: deptOptions = [] } = useDeptOptions();
  const isEditing = !!dept;

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
    if (isEditing) {
      await updateMutation.mutateAsync({ id: dept.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const flattenOptions = (
    options: DeptOption[],
    level = 0
  ): { value: number; label: string }[] => {
    const result: { value: number; label: string }[] = [];
    for (const opt of options) {
      result.push({ value: opt.value, label: '　'.repeat(level) + opt.label });
      if (opt.children) {
        result.push(...flattenOptions(opt.children, level + 1));
      }
    }
    return result;
  };

  const flatOptions = [
    { value: 0, label: 'トップレベル' },
    ...flattenOptions(deptOptions),
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? '部門の編集' : '部門の追加'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>親部門</Label>
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
            <Label htmlFor="name">部門名 *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="部門名を入力"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">コード *</Label>
            <Input
              id="code"
              {...form.register('code')}
              placeholder="例: SALES, HR"
            />
            {form.formState.errors.code && (
              <p className="text-sm text-destructive">
                {form.formState.errors.code.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sort">並び順</Label>
              <Input
                id="sort"
                type="number"
                {...form.register('sort', { valueAsNumber: true })}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>状態</Label>
              <Select
                value={String(form.watch('status'))}
                onValueChange={(v) => form.setValue('status', parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">有効</SelectItem>
                  <SelectItem value="0">無効</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
