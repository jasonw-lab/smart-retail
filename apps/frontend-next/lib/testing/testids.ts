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
  SIDEBAR_LOGOUT: 'sidebar-logout',
  SIDEBAR_NAV_LINK: 'sidebar-nav-link',

  // Header
  HEADER_MENU_TOGGLE: 'header-menu-toggle',
  HEADER_BREADCRUMB: 'header-breadcrumb',
  HEADER_FULLSCREEN: 'header-fullscreen',
  HEADER_LANGUAGE_SWITCHER: 'header-language-switcher',
  HEADER_LANGUAGE_OPTION_JA: 'header-language-option-ja',
  HEADER_LANGUAGE_OPTION_EN: 'header-language-option-en',
  HEADER_NOTIFICATIONS: 'header-notifications',
  HEADER_USER_MENU: 'header-user-menu',
  HEADER_LOGOUT: 'header-logout',

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
  STORE_RESET_BUTTON: 'store-reset-button',
  STORE_NEW_BUTTON: 'store-new-button',
  STORE_EDIT_BUTTON: 'store-edit-button',
  STORE_INVENTORY_BUTTON: 'store-inventory-button',
  STORE_DELETE_BUTTON: 'store-delete-button',

  // Store Form
  STORE_FORM: 'store-form',
  STORE_FORM_CODE: 'store-form-code',
  STORE_FORM_NAME: 'store-form-name',
  STORE_FORM_ADDRESS: 'store-form-address',
  STORE_FORM_PHONE: 'store-form-phone',
  STORE_FORM_EMAIL: 'store-form-email',
  STORE_FORM_STATUS: 'store-form-status',
  STORE_FORM_SUBMIT: 'store-form-submit',
  STORE_FORM_CANCEL: 'store-form-cancel',

  // ============================================
  // Devices
  // ============================================
  DEVICE_PAGE: 'device-page',
  DEVICE_TABLE: 'device-table',
  DEVICE_TABLE_ROW: 'device-table-row',
  DEVICE_FILTER_STORE: 'device-filter-store',
  DEVICE_FILTER_TYPE: 'device-filter-type',
  DEVICE_FILTER_STATUS: 'device-filter-status',
  DEVICE_SEARCH_INPUT: 'device-search-input',
  DEVICE_SEARCH_BUTTON: 'device-search-button',
  DEVICE_RESET_BUTTON: 'device-reset-button',
  DEVICE_NEW_BUTTON: 'device-new-button',
  DEVICE_EDIT_BUTTON: 'device-edit-button',
  DEVICE_DELETE_BUTTON: 'device-delete-button',
  DEVICE_SUMMARY_TOTAL: 'device-summary-total',
  DEVICE_SUMMARY_ONLINE: 'device-summary-online',
  DEVICE_SUMMARY_DISCONNECTED: 'device-summary-disconnected',
  DEVICE_SUMMARY_MAINTENANCE: 'device-summary-maintenance',

  // Device Form
  DEVICE_FORM: 'device-form',
  DEVICE_FORM_CODE: 'device-form-code',
  DEVICE_FORM_NAME: 'device-form-name',
  DEVICE_FORM_STORE: 'device-form-store',
  DEVICE_FORM_TYPE: 'device-form-type',
  DEVICE_FORM_STATUS: 'device-form-status',
  DEVICE_FORM_LAST_HEARTBEAT: 'device-form-last-heartbeat',
  DEVICE_FORM_ERROR_CODE: 'device-form-error-code',
  DEVICE_FORM_METADATA: 'device-form-metadata',
  DEVICE_FORM_SUBMIT: 'device-form-submit',
  DEVICE_FORM_CANCEL: 'device-form-cancel',

  // ============================================
  // Inventory
  // ============================================
  INVENTORY_PAGE: 'inventory-page',
  INVENTORY_TABLE: 'inventory-table',
  INVENTORY_TABLE_ROW: 'inventory-table-row',
  INVENTORY_FILTER_STORE: 'inventory-filter-store',
  INVENTORY_FILTER_STATUS: 'inventory-filter-status',
  INVENTORY_SEARCH_INPUT: 'inventory-search-input',
  INVENTORY_SEARCH_BUTTON: 'inventory-search-button',
  INVENTORY_RESET_BUTTON: 'inventory-reset-button',
  INVENTORY_EXPORT_BUTTON: 'inventory-export-button',
  INVENTORY_NEW_BUTTON: 'inventory-new-button',
  INVENTORY_ROW_EXPAND: 'inventory-row-expand',
  INVENTORY_REPLENISH_BUTTON: 'inventory-replenish-button',
  INVENTORY_HISTORY_BUTTON: 'inventory-history-button',
  INVENTORY_DISPOSE_BUTTON: 'inventory-dispose-button',
  INVENTORY_PREV_PAGE: 'inventory-prev-page',
  INVENTORY_NEXT_PAGE: 'inventory-next-page',
  INVENTORY_SUMMARY_QUANTITY: 'inventory-summary-quantity',
  INVENTORY_SUMMARY_LOW_STOCK: 'inventory-summary-low-stock',
  INVENTORY_SUMMARY_EXPIRING: 'inventory-summary-expiring',
  INVENTORY_SUMMARY_TURNOVER: 'inventory-summary-turnover',

  // Inventory Form
  INVENTORY_FORM: 'inventory-form',
  INVENTORY_FORM_STORE: 'inventory-form-store',
  INVENTORY_FORM_PRODUCT: 'inventory-form-product',
  INVENTORY_FORM_LOT: 'inventory-form-lot',
  INVENTORY_FORM_QUANTITY: 'inventory-form-quantity',
  INVENTORY_FORM_EXPIRY: 'inventory-form-expiry',
  INVENTORY_FORM_LOCATION: 'inventory-form-location',
  INVENTORY_FORM_REMARKS: 'inventory-form-remarks',
  INVENTORY_FORM_SUBMIT: 'inventory-form-submit',
  INVENTORY_FORM_CANCEL: 'inventory-form-cancel',

  // Inventory Dialogs
  INVENTORY_REPLENISH_DIALOG: 'inventory-replenish-dialog',
  INVENTORY_REPLENISH_QUANTITY: 'inventory-replenish-quantity',
  INVENTORY_REPLENISH_LOT: 'inventory-replenish-lot',
  INVENTORY_REPLENISH_EXPIRY: 'inventory-replenish-expiry',
  INVENTORY_REPLENISH_NOTE: 'inventory-replenish-note',
  INVENTORY_REPLENISH_SUBMIT: 'inventory-replenish-submit',
  INVENTORY_REPLENISH_CANCEL: 'inventory-replenish-cancel',
  INVENTORY_DISPOSE_DIALOG: 'inventory-dispose-dialog',
  INVENTORY_DISPOSE_QUANTITY: 'inventory-dispose-quantity',
  INVENTORY_DISPOSE_REASON: 'inventory-dispose-reason',
  INVENTORY_DISPOSE_NOTE: 'inventory-dispose-note',
  INVENTORY_DISPOSE_SUBMIT: 'inventory-dispose-submit',
  INVENTORY_DISPOSE_CANCEL: 'inventory-dispose-cancel',
  INVENTORY_HISTORY_DIALOG: 'inventory-history-dialog',
  INVENTORY_HISTORY_TABLE: 'inventory-history-table',
  INVENTORY_HISTORY_CLOSE: 'inventory-history-close',

  // ============================================
  // Transactions
  // ============================================
  TRANSACTION_PAGE: 'transaction-page',
  TRANSACTION_TABLE: 'transaction-table',
  TRANSACTION_TABLE_ROW: 'transaction-table-row',
  TRANSACTION_FILTER_STORE: 'transaction-filter-store',
  TRANSACTION_FILTER_PAYMENT: 'transaction-filter-payment',
  TRANSACTION_FILTER_PERIOD: 'transaction-filter-period',
  TRANSACTION_FILTER_ORDER: 'transaction-filter-order',
  TRANSACTION_SEARCH_BUTTON: 'transaction-search-button',
  TRANSACTION_RESET_BUTTON: 'transaction-reset-button',
  TRANSACTION_EXPORT_BUTTON: 'transaction-export-button',
  TRANSACTION_SUMMARY_SALES: 'transaction-summary-sales',
  TRANSACTION_SUMMARY_COUNT: 'transaction-summary-count',
  TRANSACTION_SUMMARY_PAYMENT: 'transaction-summary-payment',
  TRANSACTION_DETAIL_LINK: 'transaction-detail-link',
  TRANSACTION_DETAIL_BUTTON: 'transaction-detail-button',
  TRANSACTION_DETAIL_DIALOG: 'transaction-detail-dialog',
  TRANSACTION_DETAIL_CLOSE: 'transaction-detail-close',
  TRANSACTION_DETAIL_ITEMS_TABLE: 'transaction-detail-items-table',
  TRANSACTION_COPY_REFERENCE: 'transaction-copy-reference',

  // ============================================
  // Alerts
  // ============================================
  ALERT_PAGE: 'alert-page',
  ALERT_TABLE: 'alert-table',
  ALERT_TABLE_ROW: 'alert-table-row',
  ALERT_PRIORITY_TABS: 'alert-priority-tabs',
  ALERT_TAB_ALL: 'alert-tab-all',
  ALERT_TAB_P1: 'alert-tab-p1',
  ALERT_TAB_P2: 'alert-tab-p2',
  ALERT_TAB_P3: 'alert-tab-p3',
  ALERT_TAB_P4: 'alert-tab-p4',
  ALERT_FILTER_PRIORITY: 'alert-filter-priority',
  ALERT_FILTER_STATUS: 'alert-filter-status',
  ALERT_FILTER_CATEGORY: 'alert-filter-category',
  ALERT_FILTER_STORE: 'alert-filter-store',
  ALERT_FILTER_SEARCH: 'alert-filter-search',
  ALERT_FILTER_RESET: 'alert-filter-reset',
  ALERT_CONNECTION_STATUS: 'alert-connection-status',
  ALERT_NOTIFICATION_SETTINGS: 'alert-notification-settings',
  ALERT_NETWORK_STABILITY: 'alert-network-stability',
  ALERT_INCIDENT_STORES: 'alert-incident-stores',
  ALERT_REALTIME_CARD: 'alert-realtime-card',

  // ============================================
  // System - Users
  // ============================================
  USER_PAGE: 'user-page',
  USER_TABLE: 'user-table',
  USER_TABLE_ROW: 'user-table-row',
  USER_DEPT_TREE: 'user-dept-tree',
  USER_KEYWORD_INPUT: 'user-keyword-input',
  USER_STATUS_SELECT: 'user-status-select',
  USER_START_DATE: 'user-start-date',
  USER_END_DATE: 'user-end-date',
  USER_SEARCH_BUTTON: 'user-search-button',
  USER_RESET_BUTTON: 'user-reset-button',
  USER_ADD_BUTTON: 'user-add-button',
  USER_BULK_DELETE_BUTTON: 'user-bulk-delete-button',
  USER_IMPORT_BUTTON: 'user-import-button',
  USER_EDIT_BUTTON: 'user-edit-button',
  USER_DELETE_BUTTON: 'user-delete-button',
  USER_RESET_PASSWORD_BUTTON: 'user-reset-password-button',
  USER_DIALOG: 'user-dialog',
  USER_DIALOG_USERNAME: 'user-dialog-username',
  USER_DIALOG_NICKNAME: 'user-dialog-nickname',
  USER_DIALOG_DEPT: 'user-dialog-dept',
  USER_DIALOG_GENDER: 'user-dialog-gender',
  USER_DIALOG_ROLES: 'user-dialog-roles',
  USER_DIALOG_MOBILE: 'user-dialog-mobile',
  USER_DIALOG_EMAIL: 'user-dialog-email',
  USER_DIALOG_STATUS: 'user-dialog-status',
  USER_DIALOG_SUBMIT: 'user-dialog-submit',
  USER_DIALOG_CANCEL: 'user-dialog-cancel',
  RESET_PASSWORD_DIALOG: 'reset-password-dialog',
  RESET_PASSWORD_INPUT: 'reset-password-input',
  RESET_PASSWORD_SUBMIT: 'reset-password-submit',

  // ============================================
  // System - Roles
  // ============================================
  ROLE_PAGE: 'role-page',
  ROLE_TABLE: 'role-table',
  ROLE_TABLE_ROW: 'role-table-row',
  ROLE_KEYWORD_INPUT: 'role-keyword-input',
  ROLE_STATUS_SELECT: 'role-status-select',
  ROLE_SEARCH_BUTTON: 'role-search-button',
  ROLE_RESET_BUTTON: 'role-reset-button',
  ROLE_ADD_BUTTON: 'role-add-button',
  ROLE_BULK_DELETE_BUTTON: 'role-bulk-delete-button',
  ROLE_PERMISSIONS_BUTTON: 'role-permissions-button',
  ROLE_EDIT_BUTTON: 'role-edit-button',
  ROLE_DELETE_BUTTON: 'role-delete-button',
  ROLE_DIALOG: 'role-dialog',
  ROLE_DIALOG_NAME: 'role-dialog-name',
  ROLE_DIALOG_CODE: 'role-dialog-code',
  ROLE_DIALOG_DATA_SCOPE: 'role-dialog-data-scope',
  ROLE_DIALOG_STATUS: 'role-dialog-status',
  ROLE_DIALOG_SORT: 'role-dialog-sort',
  ROLE_DIALOG_SUBMIT: 'role-dialog-submit',
  ROLE_DIALOG_CANCEL: 'role-dialog-cancel',
  ROLE_PERMISSION_DIALOG: 'role-permission-dialog',
  ROLE_PERMISSION_SEARCH: 'role-permission-search',
  ROLE_PERMISSION_TREE: 'role-permission-tree',
  ROLE_PERMISSION_SUBMIT: 'role-permission-submit',

  // ============================================
  // System - Menu / Dept / Dict / Log
  // ============================================
  MENU_PAGE: 'menu-page',
  MENU_TABLE: 'menu-table',
  MENU_TABLE_ROW: 'menu-table-row',
  MENU_SEARCH_INPUT: 'menu-search-input',
  MENU_STATUS_SELECT: 'menu-status-select',
  MENU_TAB_BASIC: 'menu-tab-basic',
  MENU_TAB_API: 'menu-tab-api',
  MENU_SEARCH_BUTTON: 'menu-search-button',
  MENU_RESET_BUTTON: 'menu-reset-button',
  MENU_CREATE_BUTTON: 'menu-create-button',
  MENU_EXPAND_ALL_BUTTON: 'menu-expand-all-button',
  MENU_ADD_CHILD_BUTTON: 'menu-add-child-button',
  MENU_EDIT_BUTTON: 'menu-edit-button',
  MENU_DELETE_BUTTON: 'menu-delete-button',
  MENU_DIALOG: 'menu-dialog',
  MENU_DIALOG_NAME: 'menu-dialog-name',
  MENU_DIALOG_PATH: 'menu-dialog-path',
  MENU_DIALOG_SUBMIT: 'menu-dialog-submit',
  MENU_DIALOG_CANCEL: 'menu-dialog-cancel',

  DEPT_PAGE: 'dept-page',
  DEPT_TABLE: 'dept-table',
  DEPT_TABLE_ROW: 'dept-table-row',
  DEPT_TREE: 'dept-tree',
  DEPT_SEARCH_INPUT: 'dept-search-input',
  DEPT_STATUS_SELECT: 'dept-status-select',
  DEPT_TAB_BASIC: 'dept-tab-basic',
  DEPT_TAB_POSITION: 'dept-tab-position',
  DEPT_SEARCH_BUTTON: 'dept-search-button',
  DEPT_RESET_BUTTON: 'dept-reset-button',
  DEPT_CREATE_BUTTON: 'dept-create-button',
  DEPT_EXPAND_ALL_BUTTON: 'dept-expand-all-button',
  DEPT_EDIT_BUTTON: 'dept-edit-button',
  DEPT_ADD_SUB_BUTTON: 'dept-add-sub-button',
  DEPT_DELETE_BUTTON: 'dept-delete-button',
  DEPT_DIALOG: 'dept-dialog',
  DEPT_DIALOG_NAME: 'dept-dialog-name',
  DEPT_DIALOG_PARENT: 'dept-dialog-parent',
  DEPT_DIALOG_SUBMIT: 'dept-dialog-submit',
  DEPT_DIALOG_CANCEL: 'dept-dialog-cancel',

  DICT_PAGE: 'dict-page',
  DICT_TABLE: 'dict-table',
  DICT_TABLE_ROW: 'dict-table-row',
  DICT_SEARCH_INPUT: 'dict-search-input',
  DICT_STATUS_SELECT: 'dict-status-select',
  DICT_SEARCH_BUTTON: 'dict-search-button',
  DICT_RESET_BUTTON: 'dict-reset-button',
  DICT_CREATE_BUTTON: 'dict-create-button',
  DICT_BULK_DELETE_BUTTON: 'dict-bulk-delete-button',
  DICT_EDIT_BUTTON: 'dict-edit-button',
  DICT_DELETE_BUTTON: 'dict-delete-button',
  DICT_DIALOG: 'dict-dialog',
  DICT_DIALOG_NAME: 'dict-dialog-name',
  DICT_DIALOG_CODE: 'dict-dialog-code',
  DICT_DIALOG_REMARK: 'dict-dialog-remark',
  DICT_DIALOG_SUBMIT: 'dict-dialog-submit',
  DICT_DIALOG_CANCEL: 'dict-dialog-cancel',

  LOG_PAGE: 'log-page',
  LOG_TABLE: 'log-table',
  LOG_TABLE_ROW: 'log-table-row',
  LOG_SEARCH_INPUT: 'log-search-input',
  LOG_START_DATE: 'log-start-date',
  LOG_END_DATE: 'log-end-date',
  LOG_SEARCH_BUTTON: 'log-search-button',
  LOG_RESET_BUTTON: 'log-reset-button',
  LOG_PAGE_SIZE: 'log-page-size',
  LOG_PREV_PAGE: 'log-prev-page',
  LOG_NEXT_PAGE: 'log-next-page',
  LOG_GOTO_PAGE: 'log-goto-page',
  LOG_MODULE_CHART: 'log-module-chart',
  LOG_RESPONSE_TIME_CHART: 'log-response-time-chart',

  // ============================================
  // Common Components
  // ============================================
  DATA_TABLE: 'data-table',
  FILTER_BAR: 'filter-bar',
  FILTER_BAR_SEARCH: 'filter-bar-search',
  FILTER_BAR_RESET: 'filter-bar-reset',
  PAGINATION: 'pagination',
  PAGINATION_PREV: 'pagination-prev',
  PAGINATION_NEXT: 'pagination-next',
  PAGINATION_SIZE: 'pagination-size',
  PAGINATION_TOTAL: 'pagination-total',
  PAGINATION_GOTO: 'pagination-goto',

  CONFIRM_DIALOG: 'confirm-dialog',
  CONFIRM_DIALOG_OK: 'confirm-dialog-ok',
  CONFIRM_DIALOG_CANCEL: 'confirm-dialog-cancel',

  LOADING_SPINNER: 'loading-spinner',
  EMPTY_STATE: 'empty-state',
  ERROR_BOUNDARY: 'error-boundary',

  LANGUAGE_SWITCHER: 'language-switcher',
  LANGUAGE_OPTION_JA: 'language-option-ja',
  LANGUAGE_OPTION_EN: 'language-option-en',
} as const;

export type TestId = (typeof TESTIDS)[keyof typeof TESTIDS];

/**
 * Helper to generate dynamic test IDs
 * Example: testId(TESTIDS.PRODUCT_TABLE_ROW, 1) => "product-table-row-1"
 */
export function testId(base: TestId, suffix: string | number): string {
  return `${base}-${suffix}`;
}
