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
import { useCreateRole, useUpdateRole } from '../hooks/use-role';
import type { Role } from '../types/role';

const roleSchema = z.object({
  name: z.string().min(1, '役割名は必須です'),
  code: z.string().min(1, 'コードは必須です'),
  dataScope: z.number(),
  status: z.number(),
  sort: z.number().min(0),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleDialogProps {
  open: boolean;
  onClose: () => void;
  role: Role | null;
}

export function RoleDialog({ open, onClose, role }: RoleDialogProps) {
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const isEditing = !!role;

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      code: '',
      dataScope: 1,
      status: 1,
      sort: 1,
    },
  });

  useEffect(() => {
    if (open) {
      if (role) {
        form.reset({
          name: role.name,
          code: role.code,
          dataScope: role.dataScope,
          status: role.status,
          sort: role.sort,
        });
      } else {
        form.reset({
          name: '',
          code: '',
          dataScope: 1,
          status: 1,
          sort: 1,
        });
      }
    }
  }, [open, role, form]);

  const onSubmit = async (data: RoleFormData) => {
    if (isEditing) {
      await updateMutation.mutateAsync({ id: role.id, data });
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
          <DialogTitle>{isEditing ? '役割の編集' : '役割の追加'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">役割名 *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="役割名を入力"
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
              placeholder="例: ADMIN, USER"
            />
            {form.formState.errors.code && (
              <p className="text-sm text-destructive">
                {form.formState.errors.code.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>データスコープ</Label>
            <Select
              value={String(form.watch('dataScope'))}
              onValueChange={(v) => form.setValue('dataScope', parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">全データ</SelectItem>
                <SelectItem value="2">部門＋子部門</SelectItem>
                <SelectItem value="3">部門のみ</SelectItem>
                <SelectItem value="4">本人のみ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                  <SelectItem value="1">正常</SelectItem>
                  <SelectItem value="0">停止</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort">並び順</Label>
              <Input
                id="sort"
                type="number"
                {...form.register('sort', { valueAsNumber: true })}
                min={0}
              />
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
