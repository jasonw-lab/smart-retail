'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateMenu,
  useUpdateMenu,
  useMenuOptionsQuery,
} from '../hooks/use-menu';
import {
  MenuType,
  type Menu,
  type MenuForm,
  type MenuOption,
} from '../types/menu';

const menuSchema = z.object({
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
});

type MenuFormData = z.infer<typeof menuSchema>;

interface MenuDialogProps {
  open: boolean;
  onClose: () => void;
  parentId?: number;
  menu?: Menu;
}

export function MenuDialog({ open, onClose, parentId, menu }: MenuDialogProps) {
  const createMutation = useCreateMenu();
  const updateMutation = useUpdateMenu();
  const { data: menuOptions = [] } = useMenuOptionsQuery(true);
  const isEditing = !!menu;

  const form = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      parentId: 0,
      name: '',
      type: MenuType.MENU,
      routeName: '',
      routePath: '',
      component: '',
      perm: '',
      icon: '',
      sort: 1,
      visible: 1,
      redirect: '',
      alwaysShow: 0,
      keepAlive: 1,
    },
  });

  const menuType = form.watch('type');

  useEffect(() => {
    if (open) {
      if (menu) {
        form.reset({
          parentId: menu.parentId,
          name: menu.name,
          type: menu.type,
          routeName: menu.routeName || '',
          routePath: menu.routePath || '',
          component: menu.component || '',
          perm: menu.perm || '',
          icon: menu.icon || '',
          sort: menu.sort,
          visible: menu.visible,
          redirect: menu.redirect || '',
          alwaysShow: menu.alwaysShow || 0,
          keepAlive: menu.keepAlive || 1,
        });
      } else {
        form.reset({
          parentId: parentId ?? 0,
          name: '',
          type: MenuType.MENU,
          routeName: '',
          routePath: '',
          component: '',
          perm: '',
          icon: '',
          sort: 1,
          visible: 1,
          redirect: '',
          alwaysShow: 0,
          keepAlive: 1,
        });
      }
    }
  }, [open, menu, parentId, form]);

  const onSubmit = async (data: MenuFormData) => {
    const formData = data as MenuForm;
    if (isEditing) {
      await updateMutation.mutateAsync({ id: menu.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const flattenOptions = (
    options: MenuOption[],
    level = 0
  ): { value: number; label: string }[] => {
    const result: { value: number; label: string }[] = [];
    for (const opt of options) {
      result.push({ value: opt.value, label: '　'.repeat(level) + opt.label });
      if (opt.children) {
        result.push(...flattenOptions(opt.children, level + 1));
      }
    }
    return result;
  };

  const flatOptions = [
    { value: 0, label: 'トップメニュー' },
    ...flattenOptions(menuOptions),
  ];

  return (
    <Sheet open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? 'メニューの編集' : 'メニューの追加'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>親メニュー</Label>
            <Select
              value={String(form.watch('parentId'))}
              onValueChange={(v: string) =>
                form.setValue('parentId', parseInt(v))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {flatOptions.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">メニュー名 *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="メニュー名を入力"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>タイプ</Label>
            <RadioGroup
              value={String(form.watch('type'))}
              onValueChange={(v: string) => form.setValue('type', parseInt(v))}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={String(MenuType.CATALOG)}
                  id="type-catalog"
                />
                <Label htmlFor="type-catalog">カタログ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={String(MenuType.MENU)} id="type-menu" />
                <Label htmlFor="type-menu">メニュー</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={String(MenuType.BUTTON)}
                  id="type-button"
                />
                <Label htmlFor="type-button">ボタン</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={String(MenuType.EXTLINK)}
                  id="type-extlink"
                />
                <Label htmlFor="type-extlink">外部リンク</Label>
              </div>
            </RadioGroup>
          </div>

          {menuType === MenuType.MENU && (
            <div className="space-y-2">
              <Label htmlFor="routeName">ルート名</Label>
              <Input
                id="routeName"
                {...form.register('routeName')}
                placeholder="例: ProductList"
              />
            </div>
          )}

          {(menuType === MenuType.CATALOG || menuType === MenuType.MENU) && (
            <div className="space-y-2">
              <Label htmlFor="routePath">パス</Label>
              <Input
                id="routePath"
                {...form.register('routePath')}
                placeholder={
                  menuType === MenuType.CATALOG ? '例: /system' : '例: list'
                }
              />
            </div>
          )}

          {menuType === MenuType.EXTLINK && (
            <div className="space-y-2">
              <Label htmlFor="routePath">外部URL</Label>
              <Input
                id="routePath"
                {...form.register('routePath')}
                placeholder="https://example.com"
              />
            </div>
          )}

          {menuType === MenuType.MENU && (
            <div className="space-y-2">
              <Label htmlFor="component">コンポーネント</Label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">
                  src/views/
                </span>
                <Input
                  id="component"
                  {...form.register('component')}
                  placeholder="system/user/index"
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">.vue</span>
              </div>
            </div>
          )}

          {menuType === MenuType.BUTTON && (
            <div className="space-y-2">
              <Label htmlFor="perm">権限標識</Label>
              <Input
                id="perm"
                {...form.register('perm')}
                placeholder="例: sys:user:add"
              />
            </div>
          )}

          {menuType !== MenuType.BUTTON && (
            <div className="space-y-2">
              <Label htmlFor="icon">アイコン</Label>
              <Input
                id="icon"
                {...form.register('icon')}
                placeholder="例: Settings, Users"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sort">並び順</Label>
              <Input
                id="sort"
                type="number"
                {...form.register('sort', { valueAsNumber: true })}
                min={0}
              />
            </div>
            {menuType !== MenuType.BUTTON && (
              <div className="space-y-2">
                <Label>表示状態</Label>
                <Select
                  value={String(form.watch('visible'))}
                  onValueChange={(v: string) =>
                    form.setValue('visible', parseInt(v))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">表示</SelectItem>
                    <SelectItem value="0">非表示</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {menuType === MenuType.CATALOG && (
            <div className="space-y-2">
              <Label htmlFor="redirect">リダイレクト</Label>
              <Input
                id="redirect"
                {...form.register('redirect')}
                placeholder="例: /system/user"
              />
            </div>
          )}

          <SheetFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '保存中...' : '保存'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
