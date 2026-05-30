import { Suspense } from 'react';
import { MenuTableClient } from '@/features/system/components/menu-table-client';
import { MenuType, type Menu } from '@/features/system/types/menu';

// Mock data for development (replace with actual API call)
async function getMenus(): Promise<Menu[]> {
  // TODO: Replace with actual API call
  return [
    {
      id: 1,
      parentId: 0,
      name: 'System Management',
      type: MenuType.CATALOG,
      routePath: '/system',
      component: 'Layout',
      icon: 'Settings',
      sort: 1,
      visible: 1,
      redirect: '/system/user',
      children: [
        {
          id: 2,
          parentId: 1,
          name: 'User Management',
          type: MenuType.MENU,
          routeName: 'SystemUser',
          routePath: '/system/user',
          component: 'views/system/user/index',
          icon: 'Users',
          sort: 101,
          visible: 1,
        },
        {
          id: 6,
          parentId: 1,
          name: 'Menu Management',
          type: MenuType.MENU,
          routeName: 'SystemMenu',
          routePath: '/system/menu',
          component: 'views/system/menu/index',
          icon: 'Menu',
          sort: 102,
          visible: 1,
        },
      ],
    },
    {
      id: 10,
      parentId: 0,
      name: 'System Tools',
      type: MenuType.CATALOG,
      routePath: '/tool',
      component: 'Layout',
      icon: 'Tools',
      sort: 2,
      visible: 1,
      children: [],
    },
    {
      id: 11,
      parentId: 0,
      name: 'Interface Docs',
      type: MenuType.CATALOG,
      routePath: '/api',
      component: 'Layout',
      icon: 'FileText',
      sort: 7,
      visible: 1,
      children: [],
    },
    {
      id: 12,
      parentId: 0,
      name: 'Platform Docs',
      type: MenuType.CATALOG,
      routePath: '/doc',
      component: 'Layout',
      icon: 'Book',
      sort: 8,
      visible: 1,
      children: [],
    },
    {
      id: 13,
      parentId: 0,
      name: 'Multi-level Menu',
      type: MenuType.CATALOG,
      routePath: '/multi-level',
      component: 'Layout',
      icon: 'Layers',
      sort: 9,
      visible: 1,
      children: [],
    },
  ];
}

export default async function MenuPage() {
  const data = await getMenus();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <p className="text-muted-foreground">
          Manage system navigation menus and permissions
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <MenuTableClient initialData={data} />
      </Suspense>
    </div>
  );
}
