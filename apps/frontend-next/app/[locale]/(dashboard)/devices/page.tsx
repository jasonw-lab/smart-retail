import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DeviceTableClient } from '@/features/devices/components/device-table-client';
import { deviceApiServer } from '@/features/devices/lib/device-api.server';
import type {
  DeviceQuery,
  DevicePageResult,
  DeviceTypeType,
  DeviceStatusType,
} from '@/features/devices/types/device';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('devices');
  return {
    title: t('title'),
  };
}

interface SearchParams {
  page?: string;
  name?: string;
  storeId?: string;
  type?: string;
  status?: string;
}

async function getDevices(params: DeviceQuery): Promise<DevicePageResult> {
  return deviceApiServer.getPage(params);
}

export default async function DevicesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const t = await getTranslations('devices');
  const tCommon = await getTranslations('common');
  const resolvedSearchParams = await searchParams;
  const params: DeviceQuery = {
    pageNum: parseInt(resolvedSearchParams.page || '1', 10),
    pageSize: 10,
    deviceName: resolvedSearchParams.name,
    storeId: resolvedSearchParams.storeId ? parseInt(resolvedSearchParams.storeId, 10) : undefined,
    deviceType: resolvedSearchParams.type as DeviceTypeType | undefined,
    status: resolvedSearchParams.status as DeviceStatusType | undefined,
  };

  const data = await getDevices(params);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('listTitle')}</h1>
        <p className="text-muted-foreground">{t('listDescription')}</p>
      </div>

      <Suspense fallback={<div>{tCommon('loading')}</div>}>
        <DeviceTableClient initialData={data} initialParams={params} />
      </Suspense>
    </div>
  );
}
