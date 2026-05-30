'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateUser, useUpdateUser } from '../hooks/use-user';
import { useDeptOptions } from '../hooks/use-dept';
import { useRoleOptions } from '../hooks/use-role';
import type { User, DeptOption } from '../types';

const userSchema = z.object({
  username: z.string().min(1, 'ユーザー名は必須です'),
  nickname: z.string().min(1, 'ニックネームは必須です'),
  deptId: z.number().min(1, '部門は必須です'),
  gender: z.number(),
  mobile: z.string().optional(),
  email: z.string().email('メール形式が正しくありません').optional().or(z.literal('')),
  status: z.number(),
  roleIds: z.array(z.number()).min(1, '役割は必須です'),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export function UserDialog({ open, onClose, user }: UserDialogProps) {
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const { data: deptOptions = [] } = useDeptOptions();
  const { data: roleOptions = [] } = useRoleOptions();
  const isEditing = !!user;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      nickname: '',
      deptId: 0,
      gender: 1,
      mobile: '',
      email: '',
      status: 1,
      roleIds: [],
    },
  });

  useEffect(() => {
    if (open) {
      if (user) {
        form.reset({
          username: user.username,
          nickname: user.nickname,
          deptId: user.deptId,
          gender: user.gender,
          mobile: user.mobile || '',
          email: user.email || '',
          status: user.status,
          roleIds: user.roleIds || [],
        });
      } else {
        form.reset({
          username: '',
          nickname: '',
          deptId: 0,
          gender: 1,
          mobile: '',
          email: '',
          status: 1,
          roleIds: [],
        });
      }
    }
  }, [open, user, form]);

  const onSubmit = async (data: UserFormData) => {
    if (isEditing) {
      await updateMutation.mutateAsync({ id: user.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    onClose();
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

  const flatDeptOptions = flattenOptions(deptOptions);

  const handleRoleChange = (roleId: number, checked: boolean) => {
    const currentRoles = form.watch('roleIds');
    if (checked) {
      form.setValue('roleIds', [...currentRoles, roleId]);
    } else {
      form.setValue(
        'roleIds',
        currentRoles.filter((id) => id !== roleId)
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'ユーザーの編集' : 'ユーザーの追加'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">ユーザー名 *</Label>
            <Input
              id="username"
              {...form.register('username')}
              placeholder="ユーザー名を入力"
              disabled={isEditing}
            />
            {form.formState.errors.username && (
              <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname">ニックネーム *</Label>
            <Input id="nickname" {...form.register('nickname')} placeholder="ニックネームを入力" />
            {form.formState.errors.nickname && (
              <p className="text-sm text-destructive">{form.formState.errors.nickname.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>部門 *</Label>
            <Select
              value={form.watch('deptId') > 0 ? String(form.watch('deptId')) : ''}
              onValueChange={(v) => form.setValue('deptId', parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="部門を選択" />
              </SelectTrigger>
              <SelectContent>
                {flatDeptOptions.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.deptId && (
              <p className="text-sm text-destructive">{form.formState.errors.deptId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>性別</Label>
            <Select
              value={String(form.watch('gender'))}
              onValueChange={(v) => form.setValue('gender', parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">男性</SelectItem>
                <SelectItem value="2">女性</SelectItem>
                <SelectItem value="0">不明</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>役割 *</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-md">
              {roleOptions.map((role) => (
                <label
                  key={role.value}
                  className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded cursor-pointer hover:bg-muted/80"
                >
                  <input
                    type="checkbox"
                    checked={form.watch('roleIds').includes(role.value)}
                    onChange={(e) => handleRoleChange(role.value, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">{role.label}</span>
                </label>
              ))}
            </div>
            {form.formState.errors.roleIds && (
              <p className="text-sm text-destructive">{form.formState.errors.roleIds.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">電話</Label>
              <Input
                id="mobile"
                {...form.register('mobile')}
                placeholder="090-xxxx-xxxx"
                maxLength={11}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メール</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="user@example.com"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label>状態</Label>
            <Switch
              checked={form.watch('status') === 1}
              onCheckedChange={(checked) => form.setValue('status', checked ? 1 : 0)}
            />
            <span className="text-sm text-muted-foreground">
              {form.watch('status') === 1 ? '有効' : '無効'}
            </span>
          </div>

          <SheetFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '保存中...' : '保存'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
