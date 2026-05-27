import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { productApiServer } from '@/features/products/lib/product-api.server';
import { ProductForm } from '@/features/products/components/product-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: '商品編集',
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const productId = Number(id);

  if (!productId || isNaN(productId)) {
    notFound();
  }

  let product;
  try {
    product = await productApiServer.getById(productId);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">商品編集</h1>
      <Card>
        <CardHeader>
          <CardTitle>商品情報</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm product={product} />
        </CardContent>
      </Card>
    </div>
  );
}
