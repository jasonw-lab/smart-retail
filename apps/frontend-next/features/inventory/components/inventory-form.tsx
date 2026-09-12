'use client';

import { useRouter } from '@/i18n/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
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
import { productApiClient } from '@/features/products/lib/product-api.client';
import { useStoreOptions } from '@/features/stores/hooks/use-stores';
import { TESTIDS } from '@/lib/testing/testids';
import { inventoryFormSchema, type InventoryFormValues } from '../schemas/inventory-schema';
import { useCreateInventory } from '../hooks/use-inventory';

export function InventoryForm() {
  const router = useRouter();
  const createInventory = useCreateInventory();
  const { data: stores = [] } = useStoreOptions();
  const { data: productsData } = useQuery({
    queryKey: ['products', 'options'],
    queryFn: () => productApiClient.getPage({ pageNum: 1, pageSize: 1000 }),
    staleTime: 1000 * 60 * 10,
  });
  const products = productsData?.list ?? [];

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      storeId: 0,
      productId: 0,
      lotNumber: '',
      quantity: 0,
      expiryDate: '',
      location: '',
      remarks: '',
    },
  });

  const isPending = createInventory.isPending;

  const onSubmit = async (values: InventoryFormValues) => {
    try {
      await createInventory.mutateAsync({
        ...values,
        status: values.quantity > 0 ? 'NORMAL' : 'LOW_STOCK',
      });
      toast.success('在庫を登録しました');
      router.push('/inventory');
    } catch {
      toast.error('登録に失敗しました');
    }
  };

  return (
    <form
      data-testid={TESTIDS.INVENTORY_FORM}
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="storeId">
            店舗 <span className="text-destructive">*</span>
          </Label>
          <Select
            value={String(form.watch('storeId'))}
            onValueChange={(value) =>
              form.setValue('storeId', Number(value), { shouldValidate: true })
            }
            disabled={isPending}
          >
            <SelectTrigger id="storeId" data-testid={TESTIDS.INVENTORY_FORM_STORE}>
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
            <p className="text-sm text-destructive">{form.formState.errors.storeId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="productId">
            商品 <span className="text-destructive">*</span>
          </Label>
          <Select
            value={String(form.watch('productId'))}
            onValueChange={(value) =>
              form.setValue('productId', Number(value), { shouldValidate: true })
            }
            disabled={isPending}
          >
            <SelectTrigger id="productId" data-testid={TESTIDS.INVENTORY_FORM_PRODUCT}>
              <SelectValue placeholder="商品を選択" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={String(product.id)}>
                  {product.productName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.productId && (
            <p className="text-sm text-destructive">{form.formState.errors.productId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lotNumber">
            ロット番号 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lotNumber"
            data-testid={TESTIDS.INVENTORY_FORM_LOT}
            disabled={isPending}
            placeholder="LOT-2026-0001"
            {...form.register('lotNumber')}
          />
          {form.formState.errors.lotNumber && (
            <p className="text-sm text-destructive">{form.formState.errors.lotNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">
            数量 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="quantity"
            data-testid={TESTIDS.INVENTORY_FORM_QUANTITY}
            type="number"
            disabled={isPending}
            placeholder="100"
            {...form.register('quantity', { valueAsNumber: true })}
          />
          {form.formState.errors.quantity && (
            <p className="text-sm text-destructive">{form.formState.errors.quantity.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiryDate">賞味期限</Label>
          <Input
            id="expiryDate"
            data-testid={TESTIDS.INVENTORY_FORM_EXPIRY}
            type="date"
            disabled={isPending}
            {...form.register('expiryDate')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">保管場所</Label>
          <Input
            id="location"
            data-testid={TESTIDS.INVENTORY_FORM_LOCATION}
            disabled={isPending}
            placeholder="A-01"
            {...form.register('location')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="remarks">備考</Label>
        <Textarea
          id="remarks"
          data-testid={TESTIDS.INVENTORY_FORM_REMARKS}
          disabled={isPending}
          rows={3}
          {...form.register('remarks')}
        />
        {form.formState.errors.remarks && (
          <p className="text-sm text-destructive">{form.formState.errors.remarks.message}</p>
        )}
      </div>

      <div className="flex gap-4">
        <Button data-testid={TESTIDS.INVENTORY_FORM_SUBMIT} type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          登録
        </Button>
        <Button
          data-testid={TESTIDS.INVENTORY_FORM_CANCEL}
          type="button"
          variant="outline"
          onClick={() => router.push('/inventory')}
          disabled={isPending}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
