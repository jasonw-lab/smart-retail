import { http, HttpResponse } from 'msw';

const BACKEND_URL = 'http://localhost:8091/api/v1';

/**
 * Mock data
 */
export const mockUsers = {
  admin: {
    userId: 1,
    username: 'admin',
    password: '123456',
    nickname: '管理者',
    avatar: null,
    roles: ['ADMIN'],
    perms: ['*'],
  },
  demo: {
    userId: 2,
    username: 'demo',
    password: 'demo123',
    nickname: 'Demo User',
    avatar: null,
    roles: ['ADMIN'],
    perms: ['*'],
  },
  user: {
    userId: 3,
    username: 'user',
    password: 'password',
    nickname: '一般ユーザー',
    avatar: null,
    roles: ['USER'],
    perms: ['product:read'],
  },
};

export const mockProducts = [
  {
    id: 1,
    productCode: 'PRD-001',
    productName: 'テスト商品1',
    categoryId: 1,
    categoryName: 'カテゴリA',
    unitPrice: 1000,
    description: 'テスト商品1の説明',
    imageUrl: 'https://picsum.photos/seed/prd001/200/200',
    stockQuantity: 173,
    salesCount: 453,
    status: 1,
    createTime: '2026-01-01T00:00:00',
    updateTime: '2026-01-01T00:00:00',
  },
  {
    id: 2,
    productCode: 'PRD-002',
    productName: 'テスト商品2',
    categoryId: 1,
    categoryName: 'カテゴリA',
    unitPrice: 2000,
    description: 'テスト商品2の説明',
    imageUrl: 'https://picsum.photos/seed/prd002/200/200',
    stockQuantity: 136,
    salesCount: 320,
    status: 1,
    createTime: '2026-01-02T00:00:00',
    updateTime: '2026-01-02T00:00:00',
  },
  {
    id: 3,
    productCode: 'PRD-003',
    productName: 'サンプル商品',
    categoryId: 2,
    categoryName: 'カテゴリB',
    unitPrice: 1500,
    description: 'サンプル商品の説明',
    imageUrl: '',
    stockQuantity: 1,
    salesCount: 314,
    status: 0,
    createTime: '2026-01-03T00:00:00',
    updateTime: '2026-01-03T00:00:00',
  },
];

export const mockDashboardStats = {
  productCount: 1234,
  totalSales: 12345678,
  lowStockCount: 12,
  alertCount: 5,
};

export const mockDashboardKpi = {
  sales: {
    value: 107316,
    change: 8.8,
    changeType: 'increase',
  },
  outOfStockSKU: {
    value: 7,
    label: 'SKU',
  },
  activeStores: {
    active: 29,
    total: 30,
  },
  suspendedAlerts: {
    value: 218,
    requiresAction: true,
  },
  systemUptime: {
    value: 99.98,
  },
  newCustomers: {
    value: 1240,
    change: 12.5,
  },
  averageOrderValue: {
    value: 3480,
  },
};

export const mockDashboardSales = {
  '7d': [
    { date: '5/26', sales: 123478, profit: 30869 },
    { date: '5/27', sales: 114248, profit: 28562 },
    { date: '5/28', sales: 80452, profit: 20113 },
    { date: '5/29', sales: 97698, profit: 24424 },
    { date: '5/30', sales: 100106, profit: 25026 },
    { date: '5/31', sales: 83781, profit: 20945 },
    { date: '6/1', sales: 98559, profit: 24639 },
  ],
  '30d': [
    { date: '5/3', sales: 122173, profit: 28099 },
    { date: '5/4', sales: 111097, profit: 25552 },
    { date: '5/5', sales: 70543, profit: 16224 },
    { date: '5/6', sales: 91237, profit: 20984 },
    { date: '5/7', sales: 94127, profit: 21649 },
    { date: '5/8', sales: 74538, profit: 17143 },
    { date: '5/9', sales: 92271, profit: 21222 },
    { date: '5/10', sales: 125928, profit: 28963 },
    { date: '5/11', sales: 95491, profit: 21962 },
    { date: '5/12', sales: 88494, profit: 20353 },
    { date: '5/13', sales: 108236, profit: 24894 },
    { date: '5/14', sales: 75886, profit: 17453 },
    { date: '5/15', sales: 109653, profit: 25220 },
    { date: '5/16', sales: 73296, profit: 16858 },
    { date: '5/17', sales: 95972, profit: 22073 },
    { date: '5/18', sales: 120693, profit: 27759 },
    { date: '5/19', sales: 113096, profit: 26012 },
    { date: '5/20', sales: 89907, profit: 20678 },
    { date: '5/21', sales: 84219, profit: 19370 },
    { date: '5/22', sales: 87974, profit: 20234 },
    { date: '5/23', sales: 107259, profit: 24669 },
    { date: '5/24', sales: 115266, profit: 26511 },
    { date: '5/25', sales: 89832, profit: 20661 },
    { date: '5/26', sales: 85969, profit: 19772 },
    { date: '5/27', sales: 93683, profit: 21547 },
    { date: '5/28', sales: 104992, profit: 24148 },
    { date: '5/29', sales: 101133, profit: 23260 },
    { date: '5/30', sales: 96369, profit: 22164 },
    { date: '5/31', sales: 128427, profit: 29538 },
    { date: '6/1', sales: 107282, profit: 24674 },
  ],
  '1y': [
    { date: '2026/1', sales: 2185595, profit: 480830 },
    { date: '2026/2', sales: 2466069, profit: 542535 },
    { date: '2026/3', sales: 2212432, profit: 486735 },
    { date: '2026/4', sales: 2154123, profit: 473907 },
    { date: '2026/5', sales: 2318637, profit: 510100 },
    { date: '2026/6', sales: 2049052, profit: 450791 },
    { date: '2026/7', sales: 2434781, profit: 535651 },
    { date: '2026/8', sales: 2342481, profit: 515345 },
    { date: '2026/9', sales: 2004526, profit: 440995 },
    { date: '2026/10', sales: 2176982, profit: 478936 },
    { date: '2026/11', sales: 2201060, profit: 484233 },
    { date: '2026/12', sales: 2537818, profit: 558319 },
  ],
};

const dashboardAlertBaseTime = new Date('2026-06-01T10:00:00+09:00').getTime();

export const mockDashboardAlerts = [
  {
    id: 'dashboard-alert-1',
    type: 'out_of_stock',
    title: '在庫切れ',
    description: '商品の在庫がなくなりました',
    lotNumber: 'LOT-2026-0921-890',
    timestamp: new Date(dashboardAlertBaseTime - 30 * 60000).toISOString(),
    actionLabel: '在庫確認',
    actionLink: '/inventory',
  },
  {
    id: 'dashboard-alert-2',
    type: 'low_stock',
    title: '在庫確認要',
    description: '在庫が少なくなっています',
    lotNumber: 'LOT-2026-0922-650',
    timestamp: new Date(dashboardAlertBaseTime - 2 * 60 * 60000).toISOString(),
    actionLabel: '在庫確認',
    actionLink: '/inventory',
  },
  {
    id: 'dashboard-alert-3',
    type: 'out_of_stock',
    title: '在庫切れ',
    description: '商品の在庫がなくなりました',
    lotNumber: 'LOT-2026-0912-194',
    timestamp: new Date(dashboardAlertBaseTime - 5 * 60 * 60000).toISOString(),
    actionLabel: '在庫確認',
    actionLink: '/inventory',
  },
  {
    id: 'dashboard-alert-4',
    alertType: 'EXPIRY_SOON',
    message: '賞味期限接近: 梅おにぎり',
    lotNumber: 'LOT-2026-0423',
    detectedAt: '2026-06-01 08:30:00',
  },
  {
    id: 'dashboard-alert-5',
    alertType: 'COMMUNICATION_DOWN',
    message: '店舗端末通信障害',
    detectedAt: '2026-06-01 09:00:00',
  },
];

export const mockAlerts = [
  {
    id: 'alert-1',
    type: 'LOW_STOCK',
    category: '在庫異常',
    message: '商品「テスト商品1」の在庫が補充点を下回りました',
    productId: 1,
    productName: 'テスト商品1',
    storeId: 1,
    storeName: '東京本店',
    severity: 'warning',
    priority: 2,
    status: 'unread',
    read: false,
    createdAt: '2026-05-26T10:00:00',
  },
  {
    id: 'alert-2',
    type: 'EXPIRING',
    category: '在庫異常',
    message: '商品「テスト商品2」の賞味期限が近づいています',
    productId: 2,
    productName: 'テスト商品2',
    storeId: 1,
    storeName: '東京本店',
    severity: 'info',
    priority: 3,
    status: 'acknowledged',
    read: true,
    createdAt: '2026-05-25T15:30:00',
  },
];

export const mockAlertMonitoring = {
  networkStability: 94.2,
  incidentStores: [
    { name: '新宿国際通り店', issues: 3 },
    { name: '秋田駅前店', issues: 2 },
    { name: '銀座中央通り店', issues: 1 },
  ],
};

export const mockCategories = [
  {
    id: 1,
    categoryCode: 'CAT-001',
    categoryName: 'カテゴリA',
    description: 'カテゴリAの説明',
    sortOrder: 1,
    status: 1,
    createTime: '2026-01-01T00:00:00',
    updateTime: '2026-01-01T00:00:00',
  },
  {
    id: 2,
    categoryCode: 'CAT-002',
    categoryName: 'カテゴリB',
    description: 'カテゴリBの説明',
    sortOrder: 2,
    status: 1,
    createTime: '2026-01-02T00:00:00',
    updateTime: '2026-01-02T00:00:00',
  },
];

export const mockStores = [
  {
    id: 1,
    storeCode: 'STR-001',
    storeName: '東京本店',
    address: '東京都渋谷区1-1-1',
    phone: '03-1234-5678',
    status: 'ACTIVE',
    openingHours: '09:00-21:00',
    createTime: '2026-01-01T00:00:00',
  },
  {
    id: 2,
    storeCode: 'STR-002',
    storeName: '大阪支店',
    address: '大阪府大阪市北区2-2-2',
    phone: '06-1234-5678',
    status: 'ACTIVE',
    openingHours: '10:00-20:00',
    createTime: '2026-01-15T00:00:00',
  },
  {
    id: 3,
    storeCode: 'STR-010',
    storeName: '横浜支店',
    address: '神奈川県横浜市西区1-2-3',
    phone: '045-123-4567',
    status: 'ACTIVE',
    openingHours: '10:00-21:00',
    createTime: '2026-02-01T00:00:00',
  },
  {
    id: 4,
    storeCode: 'STR-011',
    storeName: '札幌支店',
    address: '北海道札幌市中央区3-4-5',
    phone: '011-123-4567',
    status: 'ACTIVE',
    openingHours: '09:30-20:30',
    createTime: '2026-02-10T00:00:00',
  },
  {
    id: 5,
    storeCode: 'STR-012',
    storeName: '仙台支店',
    address: '宮城県仙台市青葉区2-3-4',
    phone: '022-123-4567',
    status: 'MAINTENANCE',
    openingHours: '10:00-20:00',
    createTime: '2026-02-15T00:00:00',
  },
  {
    id: 6,
    storeCode: 'STR-013',
    storeName: '広島支店',
    address: '広島県広島市中区5-6-7',
    phone: '082-123-4567',
    status: 'MAINTENANCE',
    openingHours: '10:00-20:00',
    createTime: '2026-03-01T00:00:00',
  },
  {
    id: 7,
    storeCode: 'STR-014',
    storeName: '京都支店',
    address: '京都府京都市下京区4-5-6',
    phone: '075-123-4567',
    status: 'INACTIVE',
    openingHours: '10:00-19:00',
    createTime: '2026-03-10T00:00:00',
  },
  {
    id: 8,
    storeCode: 'STR-015',
    storeName: '神戸支店',
    address: '兵庫県神戸市中央区6-7-8',
    phone: '078-123-4567',
    status: 'ACTIVE',
    openingHours: '10:00-20:00',
    createTime: '2026-03-15T00:00:00',
  },
  {
    id: 9,
    storeCode: 'STR-016',
    storeName: '福岡支店',
    address: '福岡県福岡市博多区7-8-9',
    phone: '092-123-4567',
    status: 'ACTIVE',
    openingHours: '09:00-21:00',
    createTime: '2026-03-20T00:00:00',
  },
  {
    id: 10,
    storeCode: 'STR-017',
    storeName: '千葉支店',
    address: '千葉県千葉市中央区1-3-5',
    phone: '043-123-4567',
    status: 'ACTIVE',
    openingHours: '10:00-21:00',
    createTime: '2026-04-01T00:00:00',
  },
  {
    id: 11,
    storeCode: 'STR-018',
    storeName: '静岡支店',
    address: '静岡県静岡市葵区2-4-6',
    phone: '054-123-4567',
    status: 'ACTIVE',
    openingHours: '09:30-20:30',
    createTime: '2026-04-10T00:00:00',
  },
  {
    id: 12,
    storeCode: 'STR-019',
    storeName: '岡山支店',
    address: '岡山県岡山市北区3-5-7',
    phone: '086-123-4567',
    status: 'ACTIVE',
    openingHours: '10:00-20:00',
    createTime: '2026-04-15T00:00:00',
  },
];

export const mockDevices = [
  {
    id: 1,
    deviceCode: 'DEV-001',
    deviceName: 'レジ端末1',
    deviceType: 'PAYMENT_TERMINAL',
    storeId: 1,
    storeName: '東京本店',
    status: 'ONLINE',
    lastHeartbeat: '2026-05-29T10:00:00',
  },
  {
    id: 2,
    deviceCode: 'DEV-002',
    deviceName: 'プリンター1',
    deviceType: 'PRINTER',
    storeId: 1,
    storeName: '東京本店',
    status: 'ONLINE',
    lastHeartbeat: '2026-05-29T10:05:00',
  },
  {
    id: 3,
    deviceCode: 'DEV-003',
    deviceName: 'AI監視カメラ1',
    deviceType: 'CAMERA',
    storeId: 1,
    storeName: '東京本店',
    status: 'ONLINE',
    lastHeartbeat: '2026-05-29T10:06:00',
  },
  {
    id: 4,
    deviceCode: 'DEV-004',
    deviceName: 'スマートゲート1',
    deviceType: 'GATE',
    storeId: 1,
    storeName: '東京本店',
    status: 'ONLINE',
    lastHeartbeat: '2026-05-29T10:07:00',
  },
  {
    id: 5,
    deviceCode: 'DEV-005',
    deviceName: '温度センサー1',
    deviceType: 'REFRIGERATOR_SENSOR',
    storeId: 1,
    storeName: '東京本店',
    status: 'ONLINE',
    lastHeartbeat: '2026-05-29T10:08:00',
  },
  {
    id: 6,
    deviceCode: 'DEV-006',
    deviceName: 'ルーター1',
    deviceType: 'NETWORK_ROUTER',
    storeId: 2,
    storeName: '大阪支店',
    status: 'OFFLINE',
    lastHeartbeat: '2026-05-29T08:00:00',
  },
  {
    id: 7,
    deviceCode: 'DEV-007',
    deviceName: 'レジ端末2',
    deviceType: 'PAYMENT_TERMINAL',
    storeId: 2,
    storeName: '大阪支店',
    status: 'OFFLINE',
    lastHeartbeat: '2026-05-29T08:30:00',
  },
  {
    id: 8,
    deviceCode: 'DEV-008',
    deviceName: 'プリンター2',
    deviceType: 'PRINTER',
    storeId: 2,
    storeName: '大阪支店',
    status: 'MAINTENANCE',
    lastHeartbeat: '2026-05-29T09:00:00',
  },
  {
    id: 9,
    deviceCode: 'DEV-009',
    deviceName: 'AI監視カメラ2',
    deviceType: 'CAMERA',
    storeId: 2,
    storeName: '大阪支店',
    status: 'MAINTENANCE',
    lastHeartbeat: '2026-05-29T09:15:00',
  },
  {
    id: 10,
    deviceCode: 'DEV-010',
    deviceName: 'スマートゲート2',
    deviceType: 'GATE',
    storeId: 2,
    storeName: '大阪支店',
    status: 'ERROR',
    lastHeartbeat: '2026-05-29T09:30:00',
  },
  {
    id: 11,
    deviceCode: 'DEV-011',
    deviceName: '温度センサー2',
    deviceType: 'REFRIGERATOR_SENSOR',
    storeId: 2,
    storeName: '大阪支店',
    status: 'ONLINE',
    lastHeartbeat: '2026-05-29T10:10:00',
  },
  {
    id: 12,
    deviceCode: 'DEV-012',
    deviceName: 'レジ端末3',
    deviceType: 'PAYMENT_TERMINAL',
    storeId: 1,
    storeName: '東京本店',
    status: 'ONLINE',
    lastHeartbeat: '2026-05-29T10:12:00',
  },
];

// Aggregate-format inventory used by UI/tests. Backend returns the same aggregate format.
export const mockInventory = [
  {
    id: 1,
    storeId: 1,
    storeName: '東京本店',
    productId: 1,
    productCode: 'P001',
    productName: 'テスト商品1',
    totalQuantity: 100,
    reorderPoint: 10,
    upperLimit: 200,
    oldestExpiryDate: '2026-12-31',
    status: 'NORMAL',
    turnoverRate: 1.2,
    lots: [{ id: 101, lotNumber: 'LOT-001', quantity: 100, expiryDate: '2026-12-31' }],
    createTime: '2026-01-01T00:00:00',
    updateTime: '2026-05-29T08:00:00',
  },
  {
    id: 2,
    storeId: 1,
    storeName: '東京本店',
    productId: 2,
    productCode: 'P002',
    productName: 'テスト商品2',
    totalQuantity: 5,
    reorderPoint: 10,
    upperLimit: 100,
    oldestExpiryDate: '2026-06-25',
    status: 'LOW_STOCK',
    turnoverRate: 0.8,
    lots: [{ id: 102, lotNumber: 'LOT-002', quantity: 5, expiryDate: '2026-06-25' }],
    createTime: '2026-01-01T00:00:00',
    updateTime: '2026-05-29T08:30:00',
  },
  {
    id: 3,
    storeId: 2,
    storeName: '大阪支店',
    productId: 3,
    productCode: 'PRD-003',
    productName: 'サンプル商品',
    totalQuantity: 50,
    reorderPoint: 20,
    upperLimit: 150,
    oldestExpiryDate: '2026-11-30',
    status: 'NORMAL',
    turnoverRate: 1.5,
    lots: [{ id: 103, lotNumber: 'LOT-003', quantity: 50, expiryDate: '2026-11-30' }],
    createTime: '2026-01-15T00:00:00',
    updateTime: '2026-05-29T09:00:00',
  },
  {
    id: 4,
    storeId: 1,
    storeName: '東京本店',
    productId: 4,
    productCode: 'PRD-004',
    productName: 'おにぎり',
    totalQuantity: 25,
    reorderPoint: 10,
    upperLimit: 50,
    oldestExpiryDate: '2026-01-30',
    status: 'EXPIRED',
    turnoverRate: 2.1,
    lots: [{ id: 104, lotNumber: 'LOT-2026-0112', quantity: 25, expiryDate: '2026-01-30' }],
    createTime: '2026-01-20T00:00:00',
    updateTime: '2026-01-30T10:00:00',
  },
  {
    id: 5,
    storeId: 1,
    storeName: '東京本店',
    productId: 5,
    productCode: 'PRD-005',
    productName: 'サラダ',
    totalQuantity: 18,
    reorderPoint: 10,
    upperLimit: 40,
    oldestExpiryDate: '2026-01-30',
    status: 'EXPIRED',
    turnoverRate: 1.8,
    lots: [{ id: 105, lotNumber: 'LOT-2026-0113', quantity: 18, expiryDate: '2026-01-30' }],
    createTime: '2026-01-20T00:00:00',
    updateTime: '2026-01-30T10:00:00',
  },
  {
    id: 6,
    storeId: 1,
    storeName: '東京本店',
    productId: 6,
    productCode: 'PRD-006',
    productName: '弁当',
    totalQuantity: 12,
    reorderPoint: 5,
    upperLimit: 30,
    oldestExpiryDate: '2026-01-30',
    status: 'EXPIRED',
    turnoverRate: 1.5,
    lots: [{ id: 106, lotNumber: 'LOT-2026-0114', quantity: 12, expiryDate: '2026-01-30' }],
    createTime: '2026-01-20T00:00:00',
    updateTime: '2026-01-30T10:00:00',
  },
];

const formatMockDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const mockToday = new Date();
const mockTodayStr = formatMockDate(mockToday);
const mockYesterday = new Date(mockToday);
mockYesterday.setDate(mockYesterday.getDate() - 1);
const mockYesterdayStr = formatMockDate(mockYesterday);
const mock3DaysAgo = new Date(mockToday);
mock3DaysAgo.setDate(mock3DaysAgo.getDate() - 3);
const mock3DaysAgoStr = formatMockDate(mock3DaysAgo);

export const mockTransactions = [
  {
    id: 1,
    orderNumber: 'TXN-20260529-001',
    storeId: 1,
    storeName: '東京本店',
    totalAmount: 3500,
    paymentMethod: 'CARD',
    paymentProvider: 'Stripe',
    referenceId: 'REF-001',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T09:15:00`,
    details: [
      {
        id: 1,
        productId: 1,
        productName: 'テスト商品1',
        quantity: 2,
        unitPrice: 1000,
        subtotal: 2000,
      },
      {
        id: 2,
        productId: 2,
        productName: 'テスト商品2',
        quantity: 1,
        unitPrice: 1500,
        subtotal: 1500,
      },
    ],
  },
  {
    id: 2,
    orderNumber: 'TXN-20260529-002',
    storeId: 1,
    storeName: '東京本店',
    totalAmount: 1200,
    paymentMethod: 'CASH',
    referenceId: 'REF-002',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T09:30:00`,
    details: [
      {
        id: 3,
        productId: 1,
        productName: 'テスト商品1',
        quantity: 1,
        unitPrice: 1000,
        subtotal: 1000,
      },
      {
        id: 4,
        productId: 2,
        productName: 'テスト商品2',
        quantity: 1,
        unitPrice: 200,
        subtotal: 200,
      },
    ],
  },
  {
    id: 3,
    orderNumber: 'TXN-20260529-003',
    storeId: 2,
    storeName: '大阪支店',
    totalAmount: 2800,
    paymentMethod: 'QR',
    referenceId: 'REF-003',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T10:00:00`,
    details: [
      {
        id: 5,
        productId: 3,
        productName: 'サンプル商品',
        quantity: 2,
        unitPrice: 1400,
        subtotal: 2800,
      },
    ],
  },
  {
    id: 4,
    orderNumber: 'TXN-20260529-004',
    storeId: 2,
    storeName: '大阪支店',
    totalAmount: 4500,
    paymentMethod: 'CARD',
    referenceId: 'REF-004',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T10:30:00`,
    details: [],
  },
  {
    id: 5,
    orderNumber: 'TXN-20260529-005',
    storeId: 1,
    storeName: '東京本店',
    totalAmount: 2100,
    paymentMethod: 'CASH',
    referenceId: 'REF-005',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T11:00:00`,
    details: [],
  },
  {
    id: 6,
    orderNumber: 'TXN-20260529-006',
    storeId: 2,
    storeName: '大阪支店',
    totalAmount: 1900,
    paymentMethod: 'QR',
    referenceId: 'REF-006',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T11:15:00`,
    details: [],
  },
  {
    id: 7,
    orderNumber: 'TXN-20260529-007',
    storeId: 1,
    storeName: '東京本店',
    totalAmount: 3200,
    paymentMethod: 'CARD',
    referenceId: 'REF-007',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T11:30:00`,
    details: [],
  },
  {
    id: 8,
    orderNumber: 'TXN-20260529-008',
    storeId: 2,
    storeName: '大阪支店',
    totalAmount: 850,
    paymentMethod: 'CASH',
    referenceId: 'REF-008',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T11:45:00`,
    details: [],
  },
  {
    id: 9,
    orderNumber: 'TXN-20260529-009',
    storeId: 1,
    storeName: '東京本店',
    totalAmount: 5600,
    paymentMethod: 'CARD',
    referenceId: 'REF-009',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T12:00:00`,
    details: [],
  },
  {
    id: 10,
    orderNumber: 'TXN-20260529-010',
    storeId: 2,
    storeName: '大阪支店',
    totalAmount: 1400,
    paymentMethod: 'QR',
    referenceId: 'REF-010',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T12:15:00`,
    details: [],
  },
  {
    id: 11,
    orderNumber: 'TXN-20260529-011',
    storeId: 1,
    storeName: '東京本店',
    totalAmount: 2300,
    paymentMethod: 'CASH',
    referenceId: 'REF-011',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T12:30:00`,
    details: [],
  },
  {
    id: 12,
    orderNumber: 'TXN-20260529-012',
    storeId: 2,
    storeName: '大阪支店',
    totalAmount: 3700,
    paymentMethod: 'CARD',
    referenceId: 'REF-012',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T12:45:00`,
    details: [],
  },
  {
    id: 13,
    orderNumber: 'TXN-20260529-013',
    storeId: 1,
    storeName: '東京本店',
    totalAmount: 4100,
    paymentMethod: 'QR',
    referenceId: 'REF-013',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T13:00:00`,
    details: [],
  },
  {
    id: 14,
    orderNumber: 'TXN-20260529-014',
    storeId: 2,
    storeName: '大阪支店',
    totalAmount: 1650,
    paymentMethod: 'CASH',
    referenceId: 'REF-014',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T13:15:00`,
    details: [],
  },
  {
    id: 15,
    orderNumber: 'TXN-20260529-015',
    storeId: 1,
    storeName: '東京本店',
    totalAmount: 2900,
    paymentMethod: 'CARD',
    referenceId: 'REF-015',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T13:30:00`,
    details: [],
  },
  {
    id: 16,
    orderNumber: 'TXN-20260529-016',
    storeId: 2,
    storeName: '大阪支店',
    totalAmount: 3100,
    paymentMethod: 'QR',
    referenceId: 'REF-016',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T13:45:00`,
    details: [],
  },
  {
    id: 17,
    orderNumber: 'TXN-20260529-017',
    storeId: 1,
    storeName: '東京本店',
    totalAmount: 1800,
    paymentMethod: 'CASH',
    referenceId: 'REF-017',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T14:00:00`,
    details: [],
  },
  {
    id: 18,
    orderNumber: 'TXN-20260529-018',
    storeId: 2,
    storeName: '大阪支店',
    totalAmount: 4800,
    paymentMethod: 'CARD',
    referenceId: 'REF-018',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T14:15:00`,
    details: [],
  },
  {
    id: 19,
    orderNumber: 'TXN-20260529-019',
    storeId: 1,
    storeName: '東京本店',
    totalAmount: 2500,
    paymentMethod: 'QR',
    referenceId: 'REF-019',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T14:30:00`,
    details: [],
  },
  {
    id: 20,
    orderNumber: 'TXN-20260529-020',
    storeId: 2,
    storeName: '大阪支店',
    totalAmount: 950,
    paymentMethod: 'CASH',
    referenceId: 'REF-020',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T14:45:00`,
    details: [],
  },
  {
    id: 21,
    orderNumber: 'TXN-20260529-021',
    storeId: 1,
    storeName: '東京本店',
    totalAmount: 3300,
    paymentMethod: 'CARD',
    referenceId: 'REF-021',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T15:00:00`,
    details: [],
  },
  {
    id: 22,
    orderNumber: 'TXN-20260529-022',
    storeId: 2,
    storeName: '大阪支店',
    totalAmount: 2700,
    paymentMethod: 'QR',
    referenceId: 'REF-022',
    status: 'COMPLETED',
    transactionTime: `${mockTodayStr}T15:15:00`,
    details: [],
  },
  {
    id: 23,
    orderNumber: 'TXN-20260529-023',
    storeId: 1,
    storeName: '東京本店',
    totalAmount: 1500,
    paymentMethod: 'CARD',
    referenceId: 'REF-023',
    status: 'COMPLETED',
    transactionTime: `${mockYesterdayStr}T14:00:00`,
    details: [],
  },
  {
    id: 24,
    orderNumber: 'TXN-20260529-024',
    storeId: 2,
    storeName: '大阪支店',
    totalAmount: 2200,
    paymentMethod: 'QR',
    referenceId: 'REF-024',
    status: 'COMPLETED',
    transactionTime: `${mockYesterdayStr}T15:30:00`,
    details: [],
  },
  {
    id: 25,
    orderNumber: 'TXN-20260529-025',
    storeId: 1,
    storeName: '東京本店',
    totalAmount: 3000,
    paymentMethod: 'CASH',
    referenceId: 'REF-025',
    status: 'COMPLETED',
    transactionTime: `${mock3DaysAgoStr}T16:00:00`,
    details: [],
  },
];

// System: Users
export const mockSystemUsers = [
  {
    id: 1,
    username: 'admin',
    nickname: '管理者',
    mobile: '090-1234-5678',
    gender: 1,
    avatar: null,
    email: 'admin@smartretail.pro',
    status: 1,
    deptId: 1,
    deptName: '本社',
    roleIds: [1],
    roleNames: '管理者',
    createTime: '2026-01-01T00:00:00',
  },
  {
    id: 2,
    username: 'user',
    nickname: '一般ユーザー',
    mobile: '090-2345-6789',
    gender: 1,
    avatar: null,
    email: 'user@smartretail.pro',
    status: 1,
    deptId: 2,
    deptName: '営業部',
    roleIds: [2],
    roleNames: '一般',
    createTime: '2026-01-15T00:00:00',
  },
];

// System: Roles
export const mockRoles = [
  {
    id: 1,
    name: '管理者',
    code: 'ADMIN',
    sort: 1,
    status: 1,
    dataScope: 1,
    createTime: '2026-01-01T00:00:00',
  },
  {
    id: 2,
    name: '一般',
    code: 'USER',
    sort: 2,
    status: 1,
    dataScope: 2,
    createTime: '2026-01-01T00:00:00',
  },
];

// System: Departments
export const mockDepts = [
  {
    id: 1,
    name: '本社',
    parentId: 0,
    sort: 1,
    status: 1,
    children: [
      { id: 2, name: '営業部', parentId: 1, sort: 1, status: 1, children: [] },
      { id: 3, name: '開発部', parentId: 1, sort: 2, status: 1, children: [] },
    ],
  },
];

// System: Menus
export const mockMenus = [
  {
    id: 1,
    parentId: 0,
    name: 'ダッシュボード',
    type: 'CATALOG',
    path: '/',
    icon: 'dashboard',
    sort: 1,
    visible: 1,
    children: [],
  },
  {
    id: 2,
    parentId: 0,
    name: '商品管理',
    type: 'CATALOG',
    path: '/products',
    icon: 'product',
    sort: 2,
    visible: 1,
    children: [],
  },
];

// System: Dictionaries
export const mockDicts = [
  {
    id: 1,
    name: 'ステータス',
    code: 'status',
    dictCode: 'status',
    status: 1,
    remark: '有効/無効ステータス',
  },
  {
    id: 2,
    name: '性別',
    code: 'gender',
    dictCode: 'gender',
    status: 1,
    remark: '性別',
  },
];

// System: Dictionary Items
export const mockDictItems = [
  {
    id: 1,
    dictId: 1,
    dictCode: 'status',
    label: '有効',
    value: '1',
    sort: 1,
    status: 1,
    remark: '有効状態',
  },
  {
    id: 2,
    dictId: 1,
    dictCode: 'status',
    label: '無効',
    value: '0',
    sort: 2,
    status: 1,
    remark: '無効状態',
  },
  {
    id: 3,
    dictId: 2,
    dictCode: 'gender',
    label: '男性',
    value: '1',
    sort: 1,
    status: 1,
  },
  {
    id: 4,
    dictId: 2,
    dictCode: 'gender',
    label: '女性',
    value: '2',
    sort: 2,
    status: 1,
  },
];

// System: Logs
export const mockLogs = [
  {
    id: 1,
    module: '認証',
    content: 'ユーザーログイン',
    requestUri: '/api/v1/auth/login',
    method: 'POST',
    ip: '127.0.0.1',
    executionTime: 150,
    createTime: '2026-05-29T09:00:00',
    operator: 'admin',
  },
  {
    id: 2,
    module: '商品',
    content: '商品一覧取得',
    requestUri: '/api/v1/retail/products/page',
    method: 'GET',
    ip: '127.0.0.1',
    executionTime: 50,
    createTime: '2026-05-29T09:05:00',
    operator: 'admin',
  },
];

/**
 * Helper to wrap response in API format
 */
function apiResponse<T>(data: T) {
  return HttpResponse.json({
    code: '00000',
    msg: 'success',
    data,
  });
}

/**
 * MSW handlers for backend API mocking
 */
export const handlers = [
  // Auth: Login
  http.post(`${BACKEND_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as {
      username: string;
      password: string;
    };
    const user = Object.values(mockUsers).find(
      (u) => u.username === body.username && u.password === body.password
    );

    if (!user) {
      return HttpResponse.json(
        { code: 'A0001', msg: 'Invalid credentials', data: null },
        { status: 401 }
      );
    }

    return apiResponse({
      accessToken: `mock_token_${user.username}_${Date.now()}`,
      refreshToken: `mock_refresh_${user.username}`,
      tokenType: 'Bearer',
      expiresIn: 3600,
    });
  }),

  // Auth: Get current user
  http.get(`${BACKEND_URL}/users/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer mock_token_')) {
      return HttpResponse.json({ code: 'A0002', msg: 'Unauthorized', data: null }, { status: 401 });
    }

    // Extract username from token
    const match = authHeader.match(/mock_token_(\w+)_/);
    const username = match?.[1] || 'admin';
    const user = mockUsers[username as keyof typeof mockUsers] || mockUsers.admin;

    return apiResponse({
      userId: user.userId,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      roles: user.roles,
      perms: user.perms,
    });
  }),

  // Auth: Refresh token
  http.post(`${BACKEND_URL}/auth/refresh`, () => {
    return apiResponse({
      accessToken: `mock_token_admin_${Date.now()}`,
      refreshToken: `mock_refresh_admin`,
      tokenType: 'Bearer',
      expiresIn: 3600,
    });
  }),

  // Dashboard: Stats
  http.get(`${BACKEND_URL}/retail/dashboard/stats`, () => {
    return apiResponse(mockDashboardStats);
  }),

  // Dashboard: KPI
  http.get(`${BACKEND_URL}/retail/dashboard/kpi`, () => {
    return apiResponse(mockDashboardKpi);
  }),

  // Dashboard: Alerts
  http.get(`${BACKEND_URL}/retail/dashboard/alerts`, () => {
    return apiResponse(mockDashboardAlerts);
  }),

  // Dashboard: Sales chart
  http.get(`${BACKEND_URL}/retail/dashboard/sales`, () => {
    return apiResponse(mockDashboardSales);
  }),

  // Products: List with pagination
  http.get(`${BACKEND_URL}/retail/products/page`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    const productName = url.searchParams.get('productName') || '';

    let filtered = [...mockProducts];
    if (productName) {
      filtered = filtered.filter((p) =>
        p.productName.toLowerCase().includes(productName.toLowerCase())
      );
    }

    const start = (pageNum - 1) * pageSize;
    const list = filtered.slice(start, start + pageSize);

    return apiResponse({ list, total: filtered.length });
  }),

  // Products: Get by ID
  http.get(`${BACKEND_URL}/retail/products/:id`, ({ params }) => {
    const id = Number(params.id);
    const product = mockProducts.find((p) => p.id === id);
    if (!product) {
      return HttpResponse.json(
        { code: 'B0001', msg: 'Product not found', data: null },
        { status: 404 }
      );
    }
    return apiResponse(product);
  }),

  // Products: Create
  http.post(`${BACKEND_URL}/retail/products`, async ({ request }) => {
    const body = await request.json();
    const newProduct = {
      id: mockProducts.length + 1,
      ...body,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    };
    return apiResponse(newProduct);
  }),

  // Products: Update
  http.put(`${BACKEND_URL}/retail/products/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const body = await request.json();
    const product = mockProducts.find((p) => p.id === id);
    if (!product) {
      return HttpResponse.json(
        { code: 'B0001', msg: 'Product not found', data: null },
        { status: 404 }
      );
    }
    return apiResponse({
      ...product,
      ...body,
      updateTime: new Date().toISOString(),
    });
  }),

  // Products: Delete
  http.delete(`${BACKEND_URL}/retail/products/:id`, ({ params }) => {
    const id = Number(params.id);
    const product = mockProducts.find((p) => p.id === id);
    if (!product) {
      return HttpResponse.json(
        { code: 'B0001', msg: 'Product not found', data: null },
        { status: 404 }
      );
    }
    return apiResponse(null);
  }),

  // Alerts: List
  http.get(`${BACKEND_URL}/retail/alerts`, () => {
    return apiResponse(mockAlerts);
  }),

  // Alerts: Monitoring summary
  http.get(`${BACKEND_URL}/retail/alerts/monitoring`, () => {
    return apiResponse(mockAlertMonitoring);
  }),

  // Stores: List with pagination
  http.get(`${BACKEND_URL}/retail/stores/page`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockStores.slice(start, start + pageSize);

    return apiResponse({ list, total: mockStores.length });
  }),

  // Stores: List all (for select boxes)
  http.get(`${BACKEND_URL}/retail/stores/list`, () => {
    return apiResponse(mockStores);
  }),

  // Devices: List with pagination
  http.get(`${BACKEND_URL}/retail/devices/page`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockDevices.slice(start, start + pageSize);

    return apiResponse({ list, total: mockDevices.length });
  }),

  // Inventory: List with pagination
  http.get(`${BACKEND_URL}/retail/inventory/page`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockInventory.slice(start, start + pageSize);

    return apiResponse({ list, total: mockInventory.length });
  }),

  // Transactions: List with pagination
  http.get(`${BACKEND_URL}/retail/transactions/page`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 20;

    const start = (pageNum - 1) * pageSize;
    const list = mockTransactions.slice(start, start + pageSize);

    return apiResponse({ list, total: mockTransactions.length });
  }),

  // WebSocket ticket
  http.post(`${BACKEND_URL}/ws/ticket`, () => {
    return apiResponse({
      ticket: `mock_ws_ticket_${Date.now()}`,
      expiresIn: 30,
    });
  }),

  // System: Users list
  http.get(`${BACKEND_URL}/users`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockSystemUsers.slice(start, start + pageSize);

    return apiResponse({ list, total: mockSystemUsers.length });
  }),

  // System: Users page (alias)
  http.get(`${BACKEND_URL}/users/page`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockSystemUsers.slice(start, start + pageSize);

    return apiResponse({ list, total: mockSystemUsers.length });
  }),

  // System: Roles list
  http.get(`${BACKEND_URL}/roles`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockRoles.slice(start, start + pageSize);

    return apiResponse({ list, total: mockRoles.length });
  }),

  // System: Roles page (alias)
  http.get(`${BACKEND_URL}/roles/page`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockRoles.slice(start, start + pageSize);

    return apiResponse({ list, total: mockRoles.length });
  }),

  // System: Departments
  http.get(`${BACKEND_URL}/depts`, () => {
    return apiResponse(mockDepts);
  }),

  // System: Menus
  http.get(`${BACKEND_URL}/menus`, () => {
    return apiResponse(mockMenus);
  }),

  // System: Menu options
  http.get(`${BACKEND_URL}/menus/options`, () => {
    return apiResponse(mockMenus);
  }),

  // System: Dictionaries
  http.get(`${BACKEND_URL}/dicts`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockDicts.slice(start, start + pageSize);

    return apiResponse({ list, total: mockDicts.length });
  }),

  // System: Dictionaries page (alias)
  http.get(`${BACKEND_URL}/dicts/page`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockDicts.slice(start, start + pageSize);

    return apiResponse({ list, total: mockDicts.length });
  }),

  // System: Dictionary Items
  http.get(`${BACKEND_URL}/dicts/:dictCode/items`, ({ request, params }) => {
    const { dictCode } = params;
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    const keywords = url.searchParams.get('keywords') || '';

    let filtered = mockDictItems.filter((d) => d.dictCode === dictCode);
    if (keywords) {
      const kw = keywords.toLowerCase();
      filtered = filtered.filter(
        (d) => d.label.toLowerCase().includes(kw) || d.value.toLowerCase().includes(kw)
      );
    }
    const start = (pageNum - 1) * pageSize;
    const list = filtered.slice(start, start + pageSize);

    return apiResponse({ list, total: filtered.length });
  }),

  // System: Dictionary Item Form Data
  http.get(`${BACKEND_URL}/dicts/:dictCode/items/:itemId/form`, ({ params }) => {
    const { dictCode, itemId } = params;
    const item = mockDictItems.find((d) => d.dictCode === dictCode && d.id === Number(itemId));
    if (!item) {
      return HttpResponse.json(
        { code: 'B0001', msg: 'Dict item not found', data: null },
        { status: 404 }
      );
    }
    return apiResponse(item);
  }),

  // System: Create Dictionary Item
  http.post(`${BACKEND_URL}/dicts/:dictCode/items`, async ({ request, params }) => {
    const { dictCode } = params;
    const body = (await request.json()) as Record<string, unknown>;
    const dict = mockDicts.find((d) => d.code === dictCode);
    const newItem = {
      id: mockDictItems.length + 1,
      dictId: dict?.id || 1,
      dictCode: String(dictCode),
      label: String(body.label || ''),
      value: String(body.value || ''),
      sort: Number(body.sort) || 1,
      status: Number(body.status) ?? 1,
      remark: body.remark ? String(body.remark) : undefined,
    };
    mockDictItems.push(newItem);
    return apiResponse(null);
  }),

  // System: Update Dictionary Item
  http.put(`${BACKEND_URL}/dicts/:dictCode/items/:itemId`, async ({ request, params }) => {
    const { dictCode, itemId } = params;
    const body = (await request.json()) as Record<string, unknown>;
    const item = mockDictItems.find((d) => d.dictCode === dictCode && d.id === Number(itemId));
    if (item) {
      Object.assign(item, body);
    }
    return apiResponse(null);
  }),

  // System: Delete Dictionary Items
  http.delete(`${BACKEND_URL}/dicts/:dictCode/items/:ids`, ({ params }) => {
    const { dictCode, ids } = params;
    const idList = String(ids).split(',').map(Number);
    const remaining = mockDictItems.filter(
      (d) => !(d.dictCode === dictCode && idList.includes(d.id))
    );
    mockDictItems.length = 0;
    mockDictItems.push(...remaining);
    return apiResponse(null);
  }),

  // System: Logs
  http.get(`${BACKEND_URL}/logs`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockLogs.slice(start, start + pageSize);

    return apiResponse({ list, total: mockLogs.length });
  }),

  // System: Logs page (alias)
  http.get(`${BACKEND_URL}/logs/page`, ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get('pageNum')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    const start = (pageNum - 1) * pageSize;
    const list = mockLogs.slice(start, start + pageSize);

    return apiResponse({ list, total: mockLogs.length });
  }),

  // Captcha
  http.get(`${BACKEND_URL}/auth/captcha`, () => {
    return apiResponse({
      captchaId: `mock_captcha_${Date.now()}`,
      captchaBase64:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzMzMyI+QTFCMjwvdGV4dD48L3N2Zz4=',
    });
  }),
];
