import { Suspense } from 'react';
import { DeviceTableClient } from '@/features/devices/components/device-table-client';
import { deviceApiServer } from '@/features/devices/lib/device-api.server';
import type { DeviceQuery, DevicePageResult, DeviceTypeType, DeviceStatusType } from '@/features/devices/types/device';

interface SearchParams {
  page?: string;
  name?: string;
  storeId?: string;
  type?: string;
  status?: string;
}

async function getDevices(params: DeviceQuery): Promise<DevicePageResult> {
  try {
    return await deviceApiServer.getPage(params);
  } catch {
    // API未実装時の空データフォールバック
    return { list: [], total: 0 };
  }
}

export default async function DevicesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
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
        <h1 className="text-2xl font-bold">デバイス一覧</h1>
        <p className="text-muted-foreground">
          デバイスの登録・編集・削除を行います
        </p>
      </div>

      <Suspense fallback={<div>読み込み中...</div>}>
        <DeviceTableClient initialData={data} initialParams={params} />
      </Suspense>
    </div>
  );
}
