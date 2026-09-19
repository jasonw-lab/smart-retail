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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TESTIDS } from '@/lib/testing/testids';
import { useStoreOptions } from '@/features/stores/hooks/use-stores';
import { createDeviceFormSchema, type DeviceFormValues } from '../schemas/device-schema';
import { useCreateDevice, useUpdateDevice } from '../hooks/use-devices';
import {
  DeviceType,
  DeviceStatus,
  type Device,
} from '../types/device';

interface DeviceFormProps {
  device?: Device;
  mode: 'create' | 'edit';
}

export function DeviceForm({ device, mode }: DeviceFormProps) {
  const router = useRouter();
  const t = useTranslations('devices');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');

  const createDevice = useCreateDevice();
  const updateDevice = useUpdateDevice();
  const { data: stores = [] } = useStoreOptions();

  const schema = useMemo(() => createDeviceFormSchema(tValidation), [tValidation]);

  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      deviceCode: device?.deviceCode || '',
      deviceName: device?.deviceName || '',
      storeId: device?.storeId || 0,
      deviceType: device?.deviceType || DeviceType.PAYMENT_TERMINAL,
      status: device?.status || DeviceStatus.ONLINE,
      lastHeartbeat: device?.lastHeartbeat || '',
      errorCode: device?.errorCode || '',
      metadataJson: device?.metadata ? JSON.stringify(device.metadata, null, 2) : '',
    },
  });

  const isSubmitting = createDevice.isPending || updateDevice.isPending;
  const watchStatus = form.watch('status');

  const deviceTypeOptions = [
    { value: DeviceType.PAYMENT_TERMINAL, label: t('typePaymentTerminal') },
    { value: DeviceType.CAMERA, label: t('typeCamera') },
    { value: DeviceType.GATE, label: t('typeGate') },
    { value: DeviceType.REFRIGERATOR_SENSOR, label: t('typeRefrigeratorSensor') },
    { value: DeviceType.PRINTER, label: t('typePrinter') },
    { value: DeviceType.NETWORK_ROUTER, label: t('typeNetworkRouter') },
  ];

  const statusOptions = [
    { value: DeviceStatus.ONLINE, label: t('statusOnline') },
    { value: DeviceStatus.OFFLINE, label: t('statusOffline') },
    { value: DeviceStatus.ERROR, label: t('statusError') },
    { value: DeviceStatus.MAINTENANCE, label: t('statusMaintenance') },
  ];

  const onSubmit = async (values: DeviceFormValues) => {
    try {
      let metadata: Record<string, unknown> | undefined;
      if (values.metadataJson) {
        try {
          metadata = JSON.parse(values.metadataJson);
        } catch {
          toast.error(t('invalidJson'));
          return;
        }
      }

      if (mode === 'create') {
        await createDevice.mutateAsync({
          deviceCode: values.deviceCode || undefined,
          deviceName: values.deviceName,
          storeId: values.storeId,
          deviceType: values.deviceType,
          status: values.status,
          metadata,
        });
        toast.success(t('createSuccess'));
      } else if (device) {
        await updateDevice.mutateAsync({
          id: device.id,
          data: {
            deviceName: values.deviceName,
            storeId: values.storeId,
            deviceType: values.deviceType,
            status: values.status,
            lastHeartbeat: values.lastHeartbeat || undefined,
            errorCode: values.errorCode || undefined,
            metadata,
          },
        });
        toast.success(t('updateSuccess'));
      }
      router.push('/devices');
    } catch {
      toast.error(mode === 'create' ? t('createFailed') : t('updateFailed'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? t('newDeviceTitle') : t('editDeviceTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          data-testid={TESTIDS.DEVICE_FORM}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deviceCode">{t('deviceCode')}</Label>
              <Input
                id="deviceCode"
                data-testid={TESTIDS.DEVICE_FORM_CODE}
                {...form.register('deviceCode')}
                disabled={mode === 'edit'}
                placeholder={t('deviceCodePlaceholder')}
              />
              {form.formState.errors.deviceCode && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.deviceCode.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceName">
                {t('deviceName')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="deviceName"
                data-testid={TESTIDS.DEVICE_FORM_NAME}
                {...form.register('deviceName')}
                placeholder={t('deviceNamePlaceholder')}
              />
              {form.formState.errors.deviceName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.deviceName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                {t('store')} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.watch('storeId') ? String(form.watch('storeId')) : ''}
                onValueChange={(v) => form.setValue('storeId', parseInt(v, 10))}
              >
                <SelectTrigger data-testid={TESTIDS.DEVICE_FORM_STORE}>
                  <SelectValue placeholder={t('selectStore')} />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={String(store.id)}>
                      {store.storeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.storeId && (
                <p className="text-sm text-destructive">{form.formState.errors.storeId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('deviceType')}</Label>
              <Select
                value={form.watch('deviceType')}
                onValueChange={(v) =>
                  form.setValue('deviceType', v as DeviceFormValues['deviceType'])
                }
              >
                <SelectTrigger data-testid={TESTIDS.DEVICE_FORM_TYPE}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {deviceTypeOptions.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('status')}</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(v) => form.setValue('status', v as DeviceFormValues['status'])}
              >
                <SelectTrigger data-testid={TESTIDS.DEVICE_FORM_STATUS}>
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

            {mode === 'edit' && (
              <div className="space-y-2">
                <Label htmlFor="lastHeartbeat">{t('lastHeartbeatLabel')}</Label>
                <Input
                  id="lastHeartbeat"
                  data-testid={TESTIDS.DEVICE_FORM_LAST_HEARTBEAT}
                  type="datetime-local"
                  {...form.register('lastHeartbeat')}
                />
              </div>
            )}
          </div>

          {watchStatus === DeviceStatus.ERROR && (
            <div className="space-y-2">
              <Label htmlFor="errorCode">{t('errorCode')}</Label>
              <Input
                id="errorCode"
                data-testid={TESTIDS.DEVICE_FORM_ERROR_CODE}
                {...form.register('errorCode')}
                placeholder="ERR-001"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="metadataJson">{t('metadataJson')}</Label>
            <Textarea
              id="metadataJson"
              data-testid={TESTIDS.DEVICE_FORM_METADATA}
              {...form.register('metadataJson')}
              placeholder='{"serial": "ABC123", "model": "XYZ-100"}'
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {t('metadataHelp')}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button data-testid={TESTIDS.DEVICE_FORM_SUBMIT} type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? tCommon('saving')
                : mode === 'create'
                  ? tCommon('create')
                  : tCommon('update')}
            </Button>
            <Button
              data-testid={TESTIDS.DEVICE_FORM_CANCEL}
              type="button"
              variant="outline"
              onClick={() => router.push('/devices')}
            >
              {tCommon('cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
