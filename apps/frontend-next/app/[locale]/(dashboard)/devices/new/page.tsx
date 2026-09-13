import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DeviceForm } from '@/features/devices/components/device-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('devices');
  return {
    title: t('newDeviceTitle'),
  };
}

export default async function NewDevicePage() {
  const t = await getTranslations('devices');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('newDeviceTitle')}</h1>
        <p className="text-muted-foreground">{t('newDeviceDescription')}</p>
      </div>

      <DeviceForm mode="create" />
    </div>
  );
}
