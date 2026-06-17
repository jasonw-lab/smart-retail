import { Metadata } from 'next';
import { fetchFromBackend } from '@/lib/api/server';
import { AlertListClient } from '@/features/alerts/components/alert-list-client';
import type { Alert } from '@/features/alerts/types/alert';

export const metadata: Metadata = {
  title: 'アラート',
};

async function getInitialAlerts(): Promise<Alert[]> {
  try {
    return await fetchFromBackend<Alert[]>('retail/alerts?status=unread');
  } catch {
    // アラートAPIがない場合は空配列
    return [];
  }
}

export default async function AlertsPage() {
  const initialAlerts = await getInitialAlerts();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">アラート一覧</h1>
      <AlertListClient initialAlerts={initialAlerts} />
    </div>
  );
}
