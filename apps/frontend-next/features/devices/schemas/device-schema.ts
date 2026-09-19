import { z } from 'zod';
import type { useTranslations } from 'next-intl';
import { DeviceType, DeviceStatus } from '../types/device';

type ValidationTranslation = ReturnType<typeof useTranslations<'validation'>>;

export const createDeviceFormSchema = (t: ValidationTranslation) =>
  z.object({
    deviceCode: z
      .string()
      .max(50, t('maxLength', { max: 50 }))
      .optional()
      .or(z.literal('')),
    deviceName: z
      .string()
      .min(1, t('required'))
      .max(100, t('maxLength', { max: 100 })),
    storeId: z
      .number({ required_error: t('selectStore') })
      .positive(t('selectStore')),
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
    errorCode: z.string().max(50, t('maxLength', { max: 50 })).optional().or(z.literal('')),
    metadataJson: z.string().optional().or(z.literal('')),
  });

export type DeviceFormValues = z.infer<ReturnType<typeof createDeviceFormSchema>>;

// 後方互換用
export const deviceFormSchema = createDeviceFormSchema(((
  key: string,
  params?: Record<string, unknown>
) => {
  if (key === 'maxLength' && params?.max) return `Must be at most ${params.max} characters`;
  if (key === 'selectStore') return 'Please select a store';
  return 'Required';
}) as unknown as ValidationTranslation);
