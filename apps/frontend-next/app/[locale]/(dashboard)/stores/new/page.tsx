import { StoreForm } from '@/features/stores/components/store-form';

export default function NewStorePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">店舗登録</h1>
        <p className="text-muted-foreground">新しい店舗を登録します</p>
      </div>

      <StoreForm mode="create" />
    </div>
  );
}
