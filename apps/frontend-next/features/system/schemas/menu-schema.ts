import { z } from 'zod';

export const menuFormSchema = z.object({
  id: z.number().optional(),
  parentId: z.number(),
  name: z.string().min(1, 'メニュー名は必須です'),
  type: z.number(),
  routeName: z.string().optional(),
  routePath: z.string().optional(),
  component: z.string().optional(),
  perm: z.string().optional(),
  icon: z.string().optional(),
  sort: z.number().min(0),
  visible: z.number(),
  redirect: z.string().optional(),
  alwaysShow: z.number().optional(),
  keepAlive: z.number().optional(),
  params: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
});

export type MenuFormValues = z.infer<typeof menuFormSchema>;
