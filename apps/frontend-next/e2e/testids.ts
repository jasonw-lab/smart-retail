/**
 * E2E Test IDs
 *
 * Central definition of all data-testid values used in the application.
 * Both tests and components should reference these constants.
 *
 * Naming convention: COMPONENT_ELEMENT
 * Example: LOGIN_SUBMIT, PRODUCT_TABLE, SIDEBAR_NAV
 */

export const TESTIDS = {
  // ============================================
  // Auth / Login
  // ============================================
  LOGIN_FORM: 'login-form',
  LOGIN_USERNAME: 'login-username',
  LOGIN_PASSWORD: 'login-password',
  LOGIN_CAPTCHA: 'login-captcha',
  LOGIN_CAPTCHA_IMAGE: 'login-captcha-image',
  LOGIN_SUBMIT: 'login-submit',
  LOGIN_ERROR: 'login-error',

  // ============================================
  // Layout
  // ============================================
  LAYOUT_SIDEBAR: 'layout-sidebar',
  LAYOUT_HEADER: 'layout-header',
  LAYOUT_MAIN: 'layout-main',

  // Sidebar
  SIDEBAR_NAV: 'sidebar-nav',
  SIDEBAR_MENU_ITEM: 'sidebar-menu-item',
  SIDEBAR_TOGGLE: 'sidebar-toggle',

  // Header
  HEADER_USER_MENU: 'header-user-menu',
  HEADER_LOGOUT: 'header-logout',
  HEADER_NOTIFICATIONS: 'header-notifications',

  // ============================================
  // Dashboard
  // ============================================
  DASHBOARD_PAGE: 'dashboard-page',
  DASHBOARD_STATS: 'dashboard-stats',
  DASHBOARD_STAT_PRODUCTS: 'dashboard-stat-products',
  DASHBOARD_STAT_SALES: 'dashboard-stat-sales',
  DASHBOARD_STAT_LOW_STOCK: 'dashboard-stat-low-stock',
  DASHBOARD_STAT_ALERTS: 'dashboard-stat-alerts',

  // ============================================
  // Products
  // ============================================
  PRODUCT_PAGE: 'product-page',
  PRODUCT_TABLE: 'product-table',
  PRODUCT_TABLE_ROW: 'product-table-row',
  PRODUCT_SEARCH_INPUT: 'product-search-input',
  PRODUCT_SEARCH_BUTTON: 'product-search-button',
  PRODUCT_RESET_BUTTON: 'product-reset-button',
  PRODUCT_NEW_BUTTON: 'product-new-button',
  PRODUCT_EDIT_BUTTON: 'product-edit-button',
  PRODUCT_DELETE_BUTTON: 'product-delete-button',

  // Product Form
  PRODUCT_FORM: 'product-form',
  PRODUCT_FORM_CODE: 'product-form-code',
  PRODUCT_FORM_NAME: 'product-form-name',
  PRODUCT_FORM_CATEGORY: 'product-form-category',
  PRODUCT_FORM_PRICE: 'product-form-price',
  PRODUCT_FORM_DESCRIPTION: 'product-form-description',
  PRODUCT_FORM_SUBMIT: 'product-form-submit',
  PRODUCT_FORM_CANCEL: 'product-form-cancel',

  // ============================================
  // Stores
  // ============================================
  STORE_PAGE: 'store-page',
  STORE_TABLE: 'store-table',
  STORE_TABLE_ROW: 'store-table-row',
  STORE_SEARCH_INPUT: 'store-search-input',
  STORE_SEARCH_BUTTON: 'store-search-button',
  STORE_NEW_BUTTON: 'store-new-button',

  // ============================================
  // Devices
  // ============================================
  DEVICE_PAGE: 'device-page',
  DEVICE_TABLE: 'device-table',
  DEVICE_TABLE_ROW: 'device-table-row',
  DEVICE_FILTER_STORE: 'device-filter-store',
  DEVICE_FILTER_STATUS: 'device-filter-status',

  // ============================================
  // Inventory
  // ============================================
  INVENTORY_PAGE: 'inventory-page',
  INVENTORY_TABLE: 'inventory-table',
  INVENTORY_TABLE_ROW: 'inventory-table-row',
  INVENTORY_FILTER_STORE: 'inventory-filter-store',
  INVENTORY_FILTER_STATUS: 'inventory-filter-status',

  // ============================================
  // Transactions
  // ============================================
  TRANSACTION_PAGE: 'transaction-page',
  TRANSACTION_TABLE: 'transaction-table',
  TRANSACTION_TABLE_ROW: 'transaction-table-row',
  TRANSACTION_FILTER_DATE: 'transaction-filter-date',
  TRANSACTION_FILTER_STORE: 'transaction-filter-store',

  // ============================================
  // Alerts
  // ============================================
  ALERT_PAGE: 'alert-page',
  ALERT_LIST: 'alert-list',
  ALERT_ITEM: 'alert-item',
  ALERT_FILTER_TYPE: 'alert-filter-type',
  ALERT_FILTER_STATUS: 'alert-filter-status',

  // ============================================
  // System - Users
  // ============================================
  USER_PAGE: 'user-page',
  USER_TABLE: 'user-table',
  USER_TABLE_ROW: 'user-table-row',
  USER_SEARCH_INPUT: 'user-search-input',
  USER_SEARCH_BUTTON: 'user-search-button',
  USER_RESET_BUTTON: 'user-reset-button',
  USER_NEW_BUTTON: 'user-new-button',
  USER_DELETE_BUTTON: 'user-delete-button',
  USER_DEPT_TREE: 'user-dept-tree',

  // ============================================
  // System - Roles
  // ============================================
  ROLE_PAGE: 'role-page',
  ROLE_TABLE: 'role-table',
  ROLE_TABLE_ROW: 'role-table-row',
  ROLE_SEARCH_INPUT: 'role-search-input',
  ROLE_SEARCH_BUTTON: 'role-search-button',
  ROLE_NEW_BUTTON: 'role-new-button',

  // ============================================
  // System - Menus
  // ============================================
  MENU_PAGE: 'menu-page',
  MENU_TABLE: 'menu-table',
  MENU_TABLE_ROW: 'menu-table-row',
  MENU_NEW_BUTTON: 'menu-new-button',

  // ============================================
  // System - Departments
  // ============================================
  DEPT_PAGE: 'dept-page',
  DEPT_TABLE: 'dept-table',
  DEPT_TABLE_ROW: 'dept-table-row',
  DEPT_SEARCH_INPUT: 'dept-search-input',
  DEPT_SEARCH_BUTTON: 'dept-search-button',
  DEPT_NEW_BUTTON: 'dept-new-button',

  // ============================================
  // System - Dictionaries
  // ============================================
  DICT_PAGE: 'dict-page',
  DICT_TABLE: 'dict-table',
  DICT_TABLE_ROW: 'dict-table-row',
  DICT_SEARCH_INPUT: 'dict-search-input',
  DICT_SEARCH_BUTTON: 'dict-search-button',
  DICT_NEW_BUTTON: 'dict-new-button',

  // ============================================
  // System - Logs
  // ============================================
  LOG_PAGE: 'log-page',
  LOG_TABLE: 'log-table',
  LOG_TABLE_ROW: 'log-table-row',
  LOG_SEARCH_INPUT: 'log-search-input',
  LOG_SEARCH_BUTTON: 'log-search-button',
  LOG_DATE_START: 'log-date-start',
  LOG_DATE_END: 'log-date-end',

  // ============================================
  // Common Components
  // ============================================
  PAGINATION: 'pagination',
  PAGINATION_PREV: 'pagination-prev',
  PAGINATION_NEXT: 'pagination-next',
  PAGINATION_SIZE: 'pagination-size',
  PAGINATION_TOTAL: 'pagination-total',

  CONFIRM_DIALOG: 'confirm-dialog',
  CONFIRM_DIALOG_OK: 'confirm-dialog-ok',
  CONFIRM_DIALOG_CANCEL: 'confirm-dialog-cancel',

  LOADING_SPINNER: 'loading-spinner',
  EMPTY_STATE: 'empty-state',
  ERROR_BOUNDARY: 'error-boundary',
} as const;

export type TestId = (typeof TESTIDS)[keyof typeof TESTIDS];

/**
 * Helper to generate dynamic test IDs
 * Example: testId(TESTIDS.PRODUCT_TABLE_ROW, 1) => "product-table-row-1"
 */
export function testId(base: TestId, suffix: string | number): string {
  return `${base}-${suffix}`;
}
