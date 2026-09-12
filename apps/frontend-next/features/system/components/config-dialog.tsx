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
import { useCreateConfig, useUpdateConfig } from '../hooks/use-config';
import { configFormSchema, type ConfigFormValues } from '../schemas/config-schema';
import type { Config } from '../types/config';

interface ConfigDialogProps {
  open: boolean;
  onClose: () => void;
  config: Config | null;
}

export function ConfigDialog({ open, onClose, config }: ConfigDialogProps) {
  const t = useTranslations('system.config');
  const tCommon = useTranslations('common');
  const createMutation = useCreateConfig();
  const updateMutation = useUpdateConfig();
  const isEditing = !!config;

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues: {
      configName: '',
      configKey: '',
      configValue: '',
      remark: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (config) {
        form.reset({
          configName: config.configName,
          configKey: config.configKey,
          configValue: config.configValue,
          remark: config.remark || '',
        });
      } else {
        form.reset({
          configName: '',
          configKey: '',
          configValue: '',
          remark: '',
        });
      }
    }
  }, [open, config, form]);

  const onSubmit = async (data: ConfigFormValues) => {
    if (isEditing) {
      await updateMutation.mutateAsync({ id: config.id, data });
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
          <DialogTitle>{isEditing ? t('edit') : t('add')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="configName">{t('configName')} *</Label>
            <Input
              id="configName"
              {...form.register('configName')}
              placeholder={t('configNamePlaceholder')}
            />
            {form.formState.errors.configName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.configName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="configKey">{t('configKey')} *</Label>
            <Input
              id="configKey"
              {...form.register('configKey')}
              placeholder={t('configKeyPlaceholder')}
              disabled={isEditing}
            />
            {form.formState.errors.configKey && (
              <p className="text-sm text-destructive">{form.formState.errors.configKey.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="configValue">{t('configValue')} *</Label>
            <Input
              id="configValue"
              {...form.register('configValue')}
              placeholder={t('configValuePlaceholder')}
            />
            {form.formState.errors.configValue && (
              <p className="text-sm text-destructive">
                {form.formState.errors.configValue.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="remark">{t('remark')}</Label>
            <Textarea
              id="remark"
              {...form.register('remark')}
              placeholder={t('remarkPlaceholder')}
              rows={3}
            />
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
