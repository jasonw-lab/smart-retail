import { notFound } from 'next/navigation';
import { StoreForm } from '@/features/stores/components/store-form';
import type { Store } from '@/features/stores/types/store';

// Mock data for development (replace with actual API call)
async function getStore(id: number): Promise<Store | null> {
  // TODO: Replace with actual server-side API call
  const mockStores: Store[] = [
    {
      id: 1,
      storeCode: 'STORE-001',
      storeName: '東京本店',
      address: '東京都千代田区丸の内1-1-1',
      phone: '03-1234-5678',
      email: 'tokyo@example.com',
      status: 'ACTIVE',
    },
    {
      id: 2,
      storeCode: 'STORE-002',
      storeName: '横浜駅前店',
      address: '神奈川県横浜市西区高島2-1-1',
      phone: '045-123-4567',
      email: 'yokohama@example.com',
      status: 'ACTIVE',
    },
  ];

  return mockStores.find(s => s.id === id) || null;
}

export default async function EditStorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);

  if (isNaN(id)) {
    notFound();
  }

  const store = await getStore(id);

  if (!store) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">店舗編集</h1>
        <p className="text-muted-foreground">
          店舗情報を編集します
        </p>
      </div>

      <StoreForm store={store} mode="edit" />
    </div>
  );
}
