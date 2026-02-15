import type { App } from "vue";
import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

export const Layout = () => import("@/layout/index.vue");

// 静态路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index.vue"),
      },
    ],
  },

  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: { hidden: true },
  },

  {
    path: "/",
    name: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        // 用于 keep-alive 功能，需要与 SFC 中自动推导或显式声明的组件名称一致
        // 参考文档: https://cn.vuejs.org/guide/built-ins/keep-alive.html#include-exclude
        name: "Dashboard",
        meta: {
          title: "Home",
          icon: "homepage",
          affix: true,
          keepAlive: true,
        },
      },
      {
        path: "401",
        component: () => import("@/views/error/401.vue"),
        meta: { hidden: true },
      },
      {
        path: "404",
        component: () => import("@/views/error/404.vue"),
        meta: { hidden: true },
      },
      {
        path: "profile",
        name: "Profile",
        component: () => import("@/views/profile/index.vue"),
        meta: { title: "个人中心", icon: "user", hidden: true },
      },
      {
        path: "my-notice",
        name: "MyNotice",
        component: () => import("@/views/system/notice/components/MyNotice.vue"),
        meta: { title: "我的通知", icon: "user", hidden: true },
      },
    ],
  },

  {
    path: "/retail/product",
    component: Layout,
    name: "Product",
    meta: { title: "商品管理", icon: "el-icon-Goods" },
    children: [
      {
        path: "list",
        component: () => import("@/views/retail/product/index.vue"),
        name: "ProductList",
        meta: { title: "商品一覧", icon: "el-icon-Goods" },
      },
    ],
  },
  {
    path: "/retail/store",
    component: Layout,
    name: "Store",
    meta: { title: "店舗管理", icon: "el-icon-Shop" },
    children: [
      {
        path: "list",
        component: () => import("@/views/retail/store/index.vue"),
        name: "StoreList",
        meta: { title: "店舗一覧", icon: "el-icon-Shop", keepAlive: true },
      },
    ],
  },
  {
    path: "/retail/device",
    component: Layout,
    name: "Device",
    meta: { title: "デバイス管理", icon: "el-icon-Monitor" },
    children: [
      {
        path: "list",
        component: () => import("@/views/retail/device/index.vue"),
        name: "DeviceList",
        meta: { title: "デバイス一覧", icon: "el-icon-Monitor", keepAlive: true },
      },
    ],
  },
  {
    path: "/retail/inventory",
    component: Layout,
    name: "Inventory",
    meta: { title: "在庫管理", icon: "el-icon-Box" },
    children: [
      {
        path: "list",
        component: () => import("@/views/retail/inventory/index.vue"),
        name: "InventoryList",
        meta: { title: "在庫一覧", icon: "el-icon-Box", keepAlive: true },
      },
    ],
  },
  {
    path: "/retail/alert",
    component: Layout,
    name: "Alert",
    meta: { title: "アラート管理", icon: "el-icon-Bell" },
    children: [
      {
        path: "list",
        component: () => import("@/views/retail/alert/index.vue"),
        name: "AlertList",
        meta: { title: "アラート一覧", icon: "el-icon-Bell", keepAlive: true },
      },
    ],
  },
];

/**
 * 创建路由
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  // 刷新时，滚动条位置还原
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// 全局注册 router
export function setupRouter(app: App<Element>) {
  app.use(router);
}

export default router;
