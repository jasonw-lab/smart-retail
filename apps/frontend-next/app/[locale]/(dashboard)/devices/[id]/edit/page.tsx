import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { DeviceForm } from '@/features/devices/components/device-form';
import { deviceApiServer } from '@/features/devices/lib/device-api.server';
import { isRedirectError } from '@/lib/api/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('devices');
  return {
    title: t('editDeviceTitle'),
  };
}

export default async function EditDevicePage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('devices');
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
        <h1 className="text-2xl font-bold">{t('editDeviceTitle')}</h1>
        <p className="text-muted-foreground">{t('editDeviceDescription')}</p>
      </div>

      <DeviceForm device={device} mode="edit" />
    </div>
  );
}
