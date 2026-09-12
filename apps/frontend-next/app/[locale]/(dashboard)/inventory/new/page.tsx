import { Metadata } from 'next';
import { InventoryForm } from '@/features/inventory/components/inventory-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: '新規在庫登録',
};

export default function NewInventoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">新規在庫登録</h1>
      <Card>
        <CardHeader>
          <CardTitle>在庫情報</CardTitle>
        </CardHeader>
        <CardContent>
          <InventoryForm />
        </CardContent>
      </Card>
    </div>
  );
}
