import { z } from 'zod';
import { DeviceType, DeviceStatus } from '../types/device';

export const deviceFormSchema = z.object({
  deviceCode: z
    .string()
    .max(50, 'デバイスコードは50文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  deviceName: z
    .string()
    .min(1, 'デバイス名を入力してください')
    .max(100, 'デバイス名は100文字以内で入力してください'),
  storeId: z
    .number({ required_error: '店舗を選択してください' })
    .positive('店舗を選択してください'),
  deviceType: z.enum([
    DeviceType.PAYMENT_TERMINAL,
    DeviceType.CAMERA,
    DeviceType.GATE,
    DeviceType.REFRIGERATOR_SENSOR,
    DeviceType.PRINTER,
    DeviceType.NETWORK_ROUTER,
  ]),
  status: z.enum([
    DeviceStatus.ONLINE,
    DeviceStatus.OFFLINE,
    DeviceStatus.ERROR,
    DeviceStatus.MAINTENANCE,
  ]),
  lastHeartbeat: z.string().optional().or(z.literal('')),
  errorCode: z.string().max(50).optional().or(z.literal('')),
  metadataJson: z.string().optional().or(z.literal('')),
});

export type DeviceFormValues = z.infer<typeof deviceFormSchema>;
