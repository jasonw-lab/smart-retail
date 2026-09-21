'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
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
import { createRoleFormSchema, type RoleFormValues } from '../schemas/role-schema';
import type { Role } from '../types/role';

interface RoleDialogProps {
  open: boolean;
  onClose: () => void;
  role: Role | null;
}

export function RoleDialog({ open, onClose, role }: RoleDialogProps) {
  const t = useTranslations('system.role');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const isEditing = !!role;

  const roleSchema = useMemo(() => createRoleFormSchema(tValidation), [tValidation]);

  const form = useForm<RoleFormValues>({
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

  const onSubmit = async (data: RoleFormValues) => {
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
          <DialogTitle>{isEditing ? t('editTitle') : t('addTitle')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('roleName')} *</Label>
            <Input id="name" {...form.register('name')} placeholder={t('roleNamePlaceholder')} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">{t('roleCode')} *</Label>
            <Input id="code" {...form.register('code')} placeholder={t('roleCodePlaceholder')} />
            {form.formState.errors.code && (
              <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t('dataScope')}</Label>
            <Select
              value={String(form.watch('dataScope'))}
              onValueChange={(v) => form.setValue('dataScope', parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t('dataScopeAll')}</SelectItem>
                <SelectItem value="2">{t('dataScopeDeptAndSub')}</SelectItem>
                <SelectItem value="3">{t('dataScopeDept')}</SelectItem>
                <SelectItem value="4">{t('dataScopeSelf')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                  <SelectItem value="1">{t('statusActive')}</SelectItem>
                  <SelectItem value="0">{t('statusDisabled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort">{t('sort')}</Label>
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
