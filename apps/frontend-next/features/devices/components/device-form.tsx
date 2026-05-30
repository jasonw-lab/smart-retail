'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
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
import { useStoreOptions } from '@/features/stores/hooks/use-stores';
import { deviceFormSchema, type DeviceFormValues } from '../schemas/device-schema';
import { useCreateDevice, useUpdateDevice } from '../hooks/use-devices';
import {
  DeviceType,
  DeviceTypeLabel,
  DeviceStatus,
  DeviceStatusLabel,
  type Device,
} from '../types/device';

interface DeviceFormProps {
  device?: Device;
  mode: 'create' | 'edit';
}

export function DeviceForm({ device, mode }: DeviceFormProps) {
  const router = useRouter();
  const createDevice = useCreateDevice();
  const updateDevice = useUpdateDevice();
  const { data: stores = [] } = useStoreOptions();

  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceFormSchema),
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

  const onSubmit = async (values: DeviceFormValues) => {
    try {
      let metadata: Record<string, unknown> | undefined;
      if (values.metadataJson) {
        try {
          metadata = JSON.parse(values.metadataJson);
        } catch {
          toast.error('備考(JSON)の形式が不正です');
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
        toast.success('デバイスを登録しました');
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
        toast.success('デバイスを更新しました');
      }
      router.push('/devices');
    } catch {
      toast.error(mode === 'create' ? '登録に失敗しました' : '更新に失敗しました');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'デバイス登録' : 'デバイス編集'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deviceCode">デバイスコード</Label>
              <Input
                id="deviceCode"
                {...form.register('deviceCode')}
                disabled={mode === 'edit'}
                placeholder="自動採番 (空欄可)"
              />
              {form.formState.errors.deviceCode && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.deviceCode.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceName">
                デバイス名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="deviceName"
                {...form.register('deviceName')}
                placeholder="決済端末1"
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
                店舗 <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.watch('storeId') ? String(form.watch('storeId')) : ''}
                onValueChange={(v) => form.setValue('storeId', parseInt(v, 10))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="店舗を選択" />
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
                <p className="text-sm text-destructive">
                  {form.formState.errors.storeId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>デバイス種別</Label>
              <Select
                value={form.watch('deviceType')}
                onValueChange={(v) =>
                  form.setValue('deviceType', v as DeviceFormValues['deviceType'])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DeviceTypeLabel).map(([value, label]) => (
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
              <Label>ステータス</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(v) =>
                  form.setValue('status', v as DeviceFormValues['status'])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DeviceStatusLabel).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {mode === 'edit' && (
              <div className="space-y-2">
                <Label htmlFor="lastHeartbeat">最終Heartbeat</Label>
                <Input
                  id="lastHeartbeat"
                  type="datetime-local"
                  {...form.register('lastHeartbeat')}
                />
              </div>
            )}
          </div>

          {watchStatus === DeviceStatus.ERROR && (
            <div className="space-y-2">
              <Label htmlFor="errorCode">エラーコード</Label>
              <Input
                id="errorCode"
                {...form.register('errorCode')}
                placeholder="ERR-001"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="metadataJson">備考 (JSON)</Label>
            <Textarea
              id="metadataJson"
              {...form.register('metadataJson')}
              placeholder='{"serial": "ABC123", "model": "XYZ-100"}'
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              デバイス固有情報をJSON形式で入力（任意）
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : mode === 'create' ? '登録' : '更新'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/devices')}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
