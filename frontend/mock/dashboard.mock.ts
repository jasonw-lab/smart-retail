import { defineMock } from "./base";
import dayjs from 'dayjs';

// ダッシュボードのモックデータ
const mockDashboardData = {
  totalSales: 210000,
  salesGrowthRate: 15.5,
  restockStoreCount: 3,
  totalStoreCount: 10,
  totalProductCount: 150,
};

// 商品ランキングのモックデータ
const mockProductRanking = [
  {
    name: "プレミアムコーヒー",
    sales: 21000,
    count: 3,
    growth: 12.5,
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=100&h=100&fit=crop",
  },
  {
    name: "オーガニックティー",
    sales: 18000,
    count: 5,
    growth: 8.3,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop",
  },
  {
    name: "スペシャルブレンド",
    sales: 15000,
    count: 4,
    growth: -2.1,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop",
  },
  {
    name: "デカフェコーヒー",
    sales: 12000,
    count: 6,
    growth: 15.7,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop",
  },
  {
    name: "フルーツティー",
    sales: 10000,
    count: 8,
    growth: 5.2,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=100&h=100&fit=crop",
  },
];

// アラート情報のモックデータ
const mockAlerts = [
  {
    id: "1",
    title: "在庫切れ警告",
    date: "2024-03-20 10:30:00",
    content: "プレミアムコーヒーの在庫が10個を下回りました。緊急の補充が必要です。",
    type: "danger",
  },
  {
    id: "2",
    title: "在庫警告",
    date: "2024-03-20 09:15:00",
    content: "オーガニックティーの在庫が20個を下回りました。補充を検討してください。",
    type: "warning",
  },
  {
    id: "3",
    title: "在庫警告",
    date: "2024-03-19 16:45:00",
    content: "スペシャルブレンドの在庫が15個を下回りました。補充を検討してください。",
    type: "warning",
  },
];

// 売上推移のモックデータ
const mockSalesTrend = {
  dates: ["03-01", "03-02", "03-03", "03-04", "03-05", "03-06", "03-07"],
  sales: [1500000, 1800000, 1600000, 2000000, 1900000, 2200000, 2100000],
  profits: [375000, 450000, 400000, 500000, 475000, 550000, 525000],
};

// 店舗データのモック
const mockStoreData = () => {
  const stores = [
    { id: 1, name: "東京本店", sales: 0 },
    { id: 2, name: "大阪店", sales: 0 },
    { id: 3, name: "名古屋店", sales: 0 },
    { id: 4, name: "福岡店", sales: 0 },
    { id: 5, name: "札幌店", sales: 0 },
    { id: 6, name: "仙台店", sales: 0 },
    { id: 7, name: "広島店", sales: 0 },
    { id: 8, name: "京都店", sales: 0 },
    { id: 9, name: "横浜店", sales: 0 },
    { id: 10, name: "神戸店", sales: 0 },
  ];

  // 各店舗の売上を計算
  const totalSales = mockData().reduce((sum, item) => sum + item.sales, 0);
  const baseSales = totalSales / stores.length;

  return stores.map((store) => ({
    ...store,
    sales: Math.floor(baseSales * (0.8 + Math.random() * 0.4)), // 店舗ごとに±20%の変動
  }));
};

// 売上データのモック
const mockData = () => {
  const data = [];
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 30); // 30日分のデータを生成

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const formattedDate = formatDate(date);
    const sales = Math.floor(Math.random() * 1000000) + 500000;
    const visitors = Math.floor(Math.random() * 1000) + 500;
    const conversionRate = (Math.random() * 5 + 2).toFixed(2);
    const avgOrderValue = Math.floor(Math.random() * 5000) + 3000;

    data.push({
      date: formattedDate,
      sales,
      visitors,
      conversionRate,
      avgOrderValue,
    });
  }

  return data;
};

// 日付フォーマット関数
const formatDate = (date: Date) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
};

export default defineMock([
  {
    url: "dashboard/overview",
    method: ["GET"],
    body: {
      code: "00000",
      data: mockDashboardData,
      msg: "一切ok",
    },
  },
  {
    url: "dashboard/product-ranking",
    method: ["GET"],
    body: {
      code: "00000",
      data: mockProductRanking,
      msg: "一切ok",
    },
  },
  {
    url: "dashboard/alerts",
    method: ["GET"],
    body: {
      code: "00000",
      data: mockAlerts,
      msg: "一切ok",
    },
  },
  {
    url: "dashboard/sales-trend",
    method: ["GET"],
    body: {
      code: "00000",
      data: mockSalesTrend,
      msg: "一切ok",
    },
  },
  {
    url: "dashboard/store-data",
    method: ["GET"],
    body: {
      code: "00000",
      data: mockStoreData(),
      msg: "一切ok",
    },
  },
]); 