import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { productApiServer } from '@/features/products/lib/product-api.server';
import { ProductForm } from '@/features/products/components/product-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isRedirectError } from '@/lib/api/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('products');
  return {
    title: t('editProductTitle'),
  };
}

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const t = await getTranslations('products');
  const { id } = await params;
  const productId = Number(id);

  if (!productId || isNaN(productId)) {
    notFound();
  }

  let product;
  try {
    product = await productApiServer.getById(productId);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    // ID不存在時のみ404
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('editProductTitle')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('productInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm product={product} />
        </CardContent>
      </Card>
    </div>
  );
}
