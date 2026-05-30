import { notFound } from 'next/navigation';
import { DeviceForm } from '@/features/devices/components/device-form';
import type { Device } from '@/features/devices/types/device';

// Mock data for development (replace with actual API call)
async function getDevice(id: number): Promise<Device | null> {
  // TODO: Replace with actual server-side API call
  const mockDevices: Device[] = [
    {
      id: 1,
      deviceCode: 'DEV-1-POS-01',
      deviceName: '決済端末1',
      storeId: 1,
      storeName: '東京本店',
      deviceType: 'PAYMENT_TERMINAL',
      status: 'ONLINE',
      lastHeartbeat: new Date().toISOString(),
    },
    {
      id: 2,
      deviceCode: 'DEV-1-CAM-01',
      deviceName: 'AIカメラ1',
      storeId: 1,
      storeName: '東京本店',
      deviceType: 'CAMERA',
      status: 'ONLINE',
      lastHeartbeat: new Date().toISOString(),
    },
  ];

  return mockDevices.find(d => d.id === id) || null;
}

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

  const device = await getDevice(id);

  if (!device) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">デバイス編集</h1>
        <p className="text-muted-foreground">
          デバイス情報を編集します
        </p>
      </div>

      <DeviceForm device={device} mode="edit" />
    </div>
  );
}
