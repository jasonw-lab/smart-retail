import { z } from 'zod';

export const configFormSchema = z.object({
  configName: z.string().min(1, '設定名は必須です'),
  configKey: z.string().min(1, '設定キーは必須です'),
  configValue: z.string().min(1, '設定値は必須です'),
  remark: z.string().optional(),
});

export type ConfigFormValues = z.infer<typeof configFormSchema>;
