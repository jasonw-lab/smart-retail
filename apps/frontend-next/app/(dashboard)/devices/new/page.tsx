import { DeviceForm } from '@/features/devices/components/device-form';

export default function NewDevicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">デバイス登録</h1>
        <p className="text-muted-foreground">
          新しいデバイスを登録します
        </p>
      </div>

      <DeviceForm mode="create" />
    </div>
  );
}
