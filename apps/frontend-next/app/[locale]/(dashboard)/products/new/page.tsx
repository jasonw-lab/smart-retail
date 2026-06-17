import { Metadata } from 'next';
import { ProductForm } from '@/features/products/components/product-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: '商品新規作成',
};

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">商品新規作成</h1>
      <Card>
        <CardHeader>
          <CardTitle>商品情報</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  );
}
