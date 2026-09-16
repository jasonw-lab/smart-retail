import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { alertApiServer } from '@/features/alerts/lib/alert-api.server';
import { AlertListClient } from '@/features/alerts/components/alert-list-client';
import type { Alert, AlertMonitoringSummary } from '@/features/alerts/types/alert';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('alerts');
  return {
    title: t('title'),
  };
}

async function getInitialAlerts(): Promise<Alert[]> {
  try {
    const result = await alertApiServer.getPage({ pageNum: 1, pageSize: 100, status: 'unread' });
    return result.list;
  } catch {
    // アラートAPIがない場合は空配列
    return [];
  }
}

async function getMonitoringSummary(): Promise<AlertMonitoringSummary | undefined> {
  try {
    return await alertApiServer.getSummary();
  } catch {
    return undefined;
  }
}

export default async function AlertsPage() {
  const t = await getTranslations('alerts');
  const [initialAlerts, monitoringSummary] = await Promise.all([
    getInitialAlerts(),
    getMonitoringSummary(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('listTitle')}</h1>
      <AlertListClient initialAlerts={initialAlerts} monitoringSummary={monitoringSummary} />
    </div>
  );
}
