'use client';

import { useRouter } from '@/i18n/navigation';
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
import { productFormSchema, type ProductFormValues } from '../schemas/product-schema';
import type { Product } from '../types/product';

interface ProductFormProps {
  product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
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
        toast.success('商品を更新しました');
      } else {
        await createProduct.mutateAsync(values);
        toast.success('商品を作成しました');
      }
      router.push('/products');
    } catch {
      toast.error(isEdit ? '更新に失敗しました' : '作成に失敗しました');
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
          <Label htmlFor="productCode">商品コード</Label>
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
          <Label htmlFor="productName">商品名</Label>
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
          <Label htmlFor="categoryId">カテゴリID</Label>
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
          <Label htmlFor="unitPrice">単価</Label>
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
        <Label htmlFor="description">説明</Label>
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
        <Label htmlFor="imageUrl">画像URL</Label>
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
        <Label htmlFor="status">ステータス</Label>
        <Switch
          id="status"
          checked={form.watch('status') === 1}
          onCheckedChange={(checked) => form.setValue('status', checked ? 1 : 0)}
          disabled={isPending}
        />
        <span className="text-sm text-muted-foreground">
          {form.watch('status') === 1 ? '有効' : '無効'}
        </span>
      </div>

      <div className="flex gap-4">
        <Button data-testid={TESTIDS.PRODUCT_FORM_SUBMIT} type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? '更新' : '作成'}
        </Button>
        <Button
          data-testid={TESTIDS.PRODUCT_FORM_CANCEL}
          type="button"
          variant="outline"
          onClick={() => router.push('/products')}
          disabled={isPending}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
