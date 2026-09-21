import { z } from 'zod';
import type { useTranslations } from 'next-intl';

type ValidationTranslation = ReturnType<typeof useTranslations<'validation'>>;

export const createMenuFormSchema = (t: ValidationTranslation) =>
  z.object({
    id: z.number().optional(),
    parentId: z.number(),
    name: z.string().min(1, t('required')),
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

export type MenuFormValues = z.infer<ReturnType<typeof createMenuFormSchema>>;

export const menuFormSchema = createMenuFormSchema(
  ((key: string) => (key === 'required' ? '必須です' : 'エラー')) as unknown as ValidationTranslation
);

