'use client';

import { useMemo } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
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
import { createInventoryFormSchema, type InventoryFormValues } from '../schemas/inventory-schema';
import { useCreateInventory } from '../hooks/use-inventory';

export function InventoryForm() {
  const router = useRouter();
  const t = useTranslations('inventory');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');
  const createInventory = useCreateInventory();
  const { data: stores = [] } = useStoreOptions();
  const { data: productsData } = useQuery({
    queryKey: ['products', 'options'],
    queryFn: () => productApiClient.getPage({ pageNum: 1, pageSize: 1000 }),
    staleTime: 1000 * 60 * 10,
  });
  const products = productsData?.list ?? [];

  const schema = useMemo(() => createInventoryFormSchema(tValidation), [tValidation]);

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(schema),
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
      toast.success(t('createSuccess'));
      router.push('/inventory');
    } catch {
      toast.error(t('createFailed'));
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
            {t('storeName')} <span className="text-destructive">*</span>
          </Label>
          <Select
            value={String(form.watch('storeId'))}
            onValueChange={(value) =>
              form.setValue('storeId', Number(value), { shouldValidate: true })
            }
            disabled={isPending}
          >
            <SelectTrigger id="storeId" data-testid={TESTIDS.INVENTORY_FORM_STORE}>
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
          <Label htmlFor="productId">
            {t('productName')} <span className="text-destructive">*</span>
          </Label>
          <Select
            value={String(form.watch('productId'))}
            onValueChange={(value) =>
              form.setValue('productId', Number(value), { shouldValidate: true })
            }
            disabled={isPending}
          >
            <SelectTrigger id="productId" data-testid={TESTIDS.INVENTORY_FORM_PRODUCT}>
              <SelectValue placeholder={t('selectProduct')} />
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
            {t('lotNumber')} <span className="text-destructive">*</span>
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
            {t('quantity')} <span className="text-destructive">*</span>
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
          <Label htmlFor="expiryDate">{t('expiryDate')}</Label>
          <Input
            id="expiryDate"
            data-testid={TESTIDS.INVENTORY_FORM_EXPIRY}
            type="date"
            disabled={isPending}
            {...form.register('expiryDate')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">{t('location')}</Label>
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
        <Label htmlFor="remarks">{t('remarks')}</Label>
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
          {t('submitRegister')}
        </Button>
        <Button
          data-testid={TESTIDS.INVENTORY_FORM_CANCEL}
          type="button"
          variant="outline"
          onClick={() => router.push('/inventory')}
          disabled={isPending}
        >
          {tCommon('cancel')}
        </Button>
      </div>
    </form>
  );
}
