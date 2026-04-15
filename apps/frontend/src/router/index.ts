import type { App } from "vue";
import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

export const Layout = () => import("@/layout/index.vue");

/**
 * サイドメニュー構成（ロール別 2階層）
 *
 * 現在の実装: Admin（本部運営管理者）ロールのメニュー構成
 *
 * [Admin メニュー構成]
 * - ダッシュボード（単一画面）
 * - 店舗管理
 *   - 店舗一覧 (S-01)
 *   - デバイス一覧 (DV-01)
 * - 商品・在庫
 *   - 商品一覧 (P-01)
 *   - 在庫一覧 (I-01)
 * - アラート
 *   - アラート一覧 (A-01)
 *
 * [Phase 2 TODO: Operator（店舗オペレーター）ロールのメニュー構成]
 * - ダッシュボード（担当店舗の KPI 確認）
 * - 店舗
 *   - デバイス一覧 (DV-01) - 担当店舗のデバイス確認
 * - 在庫管理
 *   - 在庫一覧 (I-01) - 担当店舗の在庫・補充記録
 *   - 商品一覧 (P-01) - 商品情報の参照（読み取り専用）
 * - アラート
 *   - アラート一覧 (A-01) - 担当店舗アラートへの対応
 *
 * [Phase 2 実装時の注意事項]
 * - Operator は店舗一覧（S-01）へのアクセス不可
 * - Operator の商品一覧は参照のみ（編集不可）
 * - Operator のデータスコープは担当店舗のみ
 */

// 静的ルート定義
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

  // ダッシュボード（D-01）- 単一画面
  {
    path: "/",
    name: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "ダッシュボード",
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

  // 店舗管理グループ（Admin: S-01 + DV-01 + TX-01）
  // Phase 2 TODO: Operator ロールでは「店舗」グループとし、デバイス一覧のみ表示
  {
    path: "/retail/store-management",
    component: Layout,
    name: "StoreManagement",
    redirect: "/retail/store-management/store",
    meta: { title: "店舗管理", icon: "el-icon-Shop" },
    children: [
      {
        path: "store",
        component: () => import("@/views/retail/store/index.vue"),
        name: "StoreList",
        // Phase 2 TODO: Operator ロールでは hidden: true にする（担当店舗固定のため不要）
        meta: { title: "店舗一覧", icon: "el-icon-Shop", keepAlive: true },
      },
      {
        path: "sales",
        component: () => import("@/views/retail/sales/index.vue"),
        name: "SalesList",
        meta: { title: "決済履歴", icon: "el-icon-Ticket", keepAlive: true },
      },
      {
        path: "device",
        component: () => import("@/views/retail/device/index.vue"),
        name: "DeviceList",
        meta: { title: "デバイス一覧", icon: "el-icon-Monitor", keepAlive: true },
      },
    ],
  },

  // 商品・在庫グループ（Admin: P-01 + I-01）
  // Phase 2 TODO: Operator ロールでは「在庫管理」グループとし、在庫一覧を先に表示
  {
    path: "/retail/product-inventory",
    component: Layout,
    name: "ProductInventory",
    redirect: "/retail/product-inventory/product",
    meta: { title: "商品・在庫", icon: "el-icon-Goods" },
    children: [
      {
        path: "product",
        component: () => import("@/views/retail/product/index.vue"),
        name: "ProductList",
        // Phase 2 TODO: Operator ロールでは参照のみ（編集不可）
        meta: { title: "商品一覧", icon: "el-icon-Goods", keepAlive: true },
      },
      {
        path: "inventory",
        component: () => import("@/views/retail/inventory/index.vue"),
        name: "InventoryList",
        meta: { title: "在庫一覧", icon: "el-icon-Box", keepAlive: true },
      },
    ],
  },

  // アラートグループ（A-01）
  // Phase 2 TODO: Operator ロールでは担当店舗のアラートのみ表示
  {
    path: "/retail/alert",
    component: Layout,
    name: "Alert",
    redirect: "/retail/alert/list",
    meta: { title: "アラート", icon: "el-icon-Bell" },
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
