'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import type { Dict } from '../types/dict';

const dictSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  dictCode: z.string().min(1, 'コードは必須です'),
  status: z.number(),
  remark: z.string().optional(),
});

type DictFormData = z.infer<typeof dictSchema>;

interface DictDialogProps {
  open: boolean;
  onClose: () => void;
  dict: Dict | null;
}

export function DictDialog({ open, onClose, dict }: DictDialogProps) {
  const createMutation = useCreateDict();
  const updateMutation = useUpdateDict();
  const isEditing = !!dict;

  const form = useForm<DictFormData>({
    resolver: zodResolver(dictSchema),
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

  const onSubmit = async (data: DictFormData) => {
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
          <DialogTitle>{isEditing ? '字典の編集' : '字典の追加'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">名前 *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="字典名を入力"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dictCode">コード *</Label>
            <Input
              id="dictCode"
              {...form.register('dictCode')}
              placeholder="例: gender, status"
              disabled={isEditing}
            />
            {form.formState.errors.dictCode && (
              <p className="text-sm text-destructive">
                {form.formState.errors.dictCode.message}
              </p>
            )}
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

          <div className="space-y-2">
            <Label htmlFor="remark">備考</Label>
            <Textarea
              id="remark"
              {...form.register('remark')}
              placeholder="備考を入力"
              rows={3}
            />
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
