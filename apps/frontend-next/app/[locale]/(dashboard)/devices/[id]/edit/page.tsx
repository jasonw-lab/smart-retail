import { notFound } from 'next/navigation';
import { DeviceForm } from '@/features/devices/components/device-form';
import { deviceApiServer } from '@/features/devices/lib/device-api.server';
import { isRedirectError } from '@/lib/api/server';

export default async function EditDevicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);

  if (isNaN(id)) {
    notFound();
  }

  let device;
  try {
    device = await deviceApiServer.getById(id);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    // ID不存在時のみ404
    notFound();
  }

  if (!device) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">デバイス編集</h1>
        <p className="text-muted-foreground">デバイス情報を編集します</p>
      </div>

      <DeviceForm device={device} mode="edit" />
    </div>
  );
}
