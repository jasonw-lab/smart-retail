'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { storeFormSchema, type StoreFormValues } from '../schemas/store-schema';
import { useCreateStore, useUpdateStore } from '../hooks/use-stores';
import { StoreStatus, StoreStatusLabel, type Store } from '../types/store';

interface StoreFormProps {
  store?: Store;
  mode: 'create' | 'edit';
}

export function StoreForm({ store, mode }: StoreFormProps) {
  const router = useRouter();
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
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
        toast.success('店舗を登録しました');
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
        toast.success('店舗を更新しました');
      }
      router.push('/stores');
    } catch (error) {
      toast.error(
        mode === 'create' ? '登録に失敗しました' : '更新に失敗しました'
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? '店舗登録' : '店舗編集'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="storeCode">
                店舗コード <span className="text-destructive">*</span>
              </Label>
              <Input
                id="storeCode"
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
                店舗名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="storeName"
                {...form.register('storeName')}
                placeholder="東京本店"
              />
              {form.formState.errors.storeName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.storeName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">住所</Label>
            <Input
              id="address"
              {...form.register('address')}
              placeholder="東京都千代田区..."
            />
            {form.formState.errors.address && (
              <p className="text-sm text-destructive">
                {form.formState.errors.address.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">電話番号</Label>
              <Input
                id="phone"
                {...form.register('phone')}
                placeholder="03-1234-5678"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="store@example.com"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>ステータス</Label>
            <Select
              value={form.watch('status')}
              onValueChange={(value) =>
                form.setValue('status', value as StoreFormValues['status'])
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(StoreStatusLabel).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : mode === 'create' ? '登録' : '更新'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/stores')}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
