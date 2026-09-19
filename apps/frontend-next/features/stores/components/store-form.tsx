'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TESTIDS } from '@/lib/testing/testids';
import { createStoreFormSchema, type StoreFormValues } from '../schemas/store-schema';
import { useCreateStore, useUpdateStore } from '../hooks/use-stores';
import { StoreStatus, type Store } from '../types/store';

interface StoreFormProps {
  store?: Store;
  mode: 'create' | 'edit';
}

export function StoreForm({ store, mode }: StoreFormProps) {
  const router = useRouter();
  const t = useTranslations('stores');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');

  const createStore = useCreateStore();
  const updateStore = useUpdateStore();

  const schema = useMemo(() => createStoreFormSchema(tValidation), [tValidation]);

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      storeCode: store?.storeCode || '',
      storeName: store?.storeName || '',
      address: store?.address || '',
      phone: store?.phone || '',
      email: store?.email || '',
      status: store?.status || StoreStatus.ACTIVE,
    },
  });

  const isSubmitting = createStore.isPending || updateStore.isPending;

  const statusOptions = [
    { value: StoreStatus.ACTIVE, label: t('statusActive') },
    { value: StoreStatus.MAINTENANCE, label: t('statusMaintenance') },
    { value: StoreStatus.INACTIVE, label: t('statusInactive') },
  ];

  const onSubmit = async (values: StoreFormValues) => {
    try {
      if (mode === 'create') {
        await createStore.mutateAsync({
          storeCode: values.storeCode,
          storeName: values.storeName,
          address: values.address || undefined,
          phone: values.phone || undefined,
          email: values.email || undefined,
          status: values.status,
        });
        toast.success(t('createSuccess'));
      } else if (store) {
        await updateStore.mutateAsync({
          id: store.id,
          data: {
            storeName: values.storeName,
            address: values.address || undefined,
            phone: values.phone || undefined,
            email: values.email || undefined,
            status: values.status,
          },
        });
        toast.success(t('updateSuccess'));
      }
      router.push('/stores');
    } catch {
      toast.error(mode === 'create' ? t('createFailed') : t('updateFailed'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? t('newStoreTitle') : t('editStoreTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          data-testid={TESTIDS.STORE_FORM}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="storeCode">
                {t('storeCode')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="storeCode"
                data-testid={TESTIDS.STORE_FORM_CODE}
                {...form.register('storeCode')}
                disabled={mode === 'edit'}
                placeholder="STORE-001"
              />
              {form.formState.errors.storeCode && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.storeCode.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeName">
                {t('storeName')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="storeName"
                data-testid={TESTIDS.STORE_FORM_NAME}
                {...form.register('storeName')}
                placeholder={t('namePlaceholder')}
              />
              {form.formState.errors.storeName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.storeName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t('address')}</Label>
            <Input
              id="address"
              data-testid={TESTIDS.STORE_FORM_ADDRESS}
              {...form.register('address')}
              placeholder={t('addressPlaceholder')}
            />
            {form.formState.errors.address && (
              <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input
                id="phone"
                data-testid={TESTIDS.STORE_FORM_PHONE}
                {...form.register('phone')}
                placeholder="03-1234-5678"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                data-testid={TESTIDS.STORE_FORM_EMAIL}
                type="email"
                {...form.register('email')}
                placeholder="store@example.com"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('status')}</Label>
            <Select
              value={form.watch('status')}
              onValueChange={(value) => form.setValue('status', value as StoreFormValues['status'])}
            >
              <SelectTrigger data-testid={TESTIDS.STORE_FORM_STATUS} className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button data-testid={TESTIDS.STORE_FORM_SUBMIT} type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? tCommon('saving')
                : mode === 'create'
                  ? tCommon('create')
                  : tCommon('update')}
            </Button>
            <Button
              data-testid={TESTIDS.STORE_FORM_CANCEL}
              type="button"
              variant="outline"
              onClick={() => router.push('/stores')}
            >
              {tCommon('cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
