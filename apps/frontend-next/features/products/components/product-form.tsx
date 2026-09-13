'use client';

import { useMemo } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateProduct, useUpdateProduct } from '../hooks/use-products';
import { TESTIDS } from '@/lib/testing/testids';
import { createProductFormSchema, type ProductFormValues } from '../schemas/product-schema';
import type { Product } from '../types/product';

interface ProductFormProps {
  product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');
  const isEdit = !!product;

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const schema = useMemo(() => createProductFormSchema(tValidation), [tValidation]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      productCode: product?.productCode || '',
      productName: product?.productName || '',
      categoryId: product?.categoryId || 0,
      unitPrice: product?.unitPrice || 0,
      description: product?.description || '',
      imageUrl: product?.imageUrl || '',
      status: product?.status ?? 1,
    },
  });

  const onSubmit = async (values: ProductFormValues) => {
    try {
      if (isEdit) {
        // productCode is disabled in edit mode and should not be sent
        const { productCode: _productCode, ...updateData } = values;
        await updateProduct.mutateAsync({
          id: product.id,
          data: updateData,
        });
        toast.success(t('updateSuccess'));
      } else {
        await createProduct.mutateAsync(values);
        toast.success(t('createSuccess'));
      }
      router.push('/products');
    } catch {
      toast.error(isEdit ? t('updateFailed') : t('createFailed'));
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <form
      data-testid={TESTIDS.PRODUCT_FORM}
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="productCode">{t('productCode')}</Label>
          <Input
            id="productCode"
            data-testid={TESTIDS.PRODUCT_FORM_CODE}
            disabled={isEdit || isPending}
            {...form.register('productCode')}
          />
          {form.formState.errors.productCode && (
            <p className="text-sm text-destructive">{form.formState.errors.productCode.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="productName">{t('productName')}</Label>
          <Input
            id="productName"
            data-testid={TESTIDS.PRODUCT_FORM_NAME}
            disabled={isPending}
            {...form.register('productName')}
          />
          {form.formState.errors.productName && (
            <p className="text-sm text-destructive">{form.formState.errors.productName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">{t('categoryId')}</Label>
          <Input
            id="categoryId"
            data-testid={TESTIDS.PRODUCT_FORM_CATEGORY}
            type="number"
            disabled={isPending}
            {...form.register('categoryId', { valueAsNumber: true })}
          />
          {form.formState.errors.categoryId && (
            <p className="text-sm text-destructive">{form.formState.errors.categoryId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitPrice">{t('unitPrice')}</Label>
          <Input
            id="unitPrice"
            data-testid={TESTIDS.PRODUCT_FORM_PRICE}
            type="number"
            disabled={isPending}
            {...form.register('unitPrice', { valueAsNumber: true })}
          />
          {form.formState.errors.unitPrice && (
            <p className="text-sm text-destructive">{form.formState.errors.unitPrice.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('description')}</Label>
        <Textarea
          id="description"
          data-testid={TESTIDS.PRODUCT_FORM_DESCRIPTION}
          disabled={isPending}
          {...form.register('description')}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">{t('imageUrl')}</Label>
        <Input
          id="imageUrl"
          disabled={isPending}
          placeholder="https://example.com/image.jpg"
          {...form.register('imageUrl')}
        />
        {form.formState.errors.imageUrl && (
          <p className="text-sm text-destructive">{form.formState.errors.imageUrl.message}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Label htmlFor="status">{t('status')}</Label>
        <Switch
          id="status"
          checked={form.watch('status') === 1}
          onCheckedChange={(checked) => form.setValue('status', checked ? 1 : 0)}
          disabled={isPending}
        />
        <span className="text-sm text-muted-foreground">
          {form.watch('status') === 1 ? t('statusActive') : t('statusInactive')}
        </span>
      </div>

      <div className="flex gap-4">
        <Button data-testid={TESTIDS.PRODUCT_FORM_SUBMIT} type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? tCommon('update') : tCommon('create')}
        </Button>
        <Button
          data-testid={TESTIDS.PRODUCT_FORM_CANCEL}
          type="button"
          variant="outline"
          onClick={() => router.push('/products')}
          disabled={isPending}
        >
          {tCommon('cancel')}
        </Button>
      </div>
    </form>
  );
}
