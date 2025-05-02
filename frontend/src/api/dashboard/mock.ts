import { DashboardDataVO, ProductRankingItem, StoreData, AlertItem, SalesTrendData, StoreSalesData } from './index';
import dayjs from 'dayjs';

// Mock data for dashboard overview
export const mockDashboardData: DashboardDataVO = {
  totalSales: 210000,
  salesGrowthRate: 15.5,
  restockStoreCount: 3,
  totalStoreCount: 10,
  totalProductCount: 150,
};

// Mock data for product ranking
export const mockProductRanking: ProductRankingItem[] = [
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

// Mock data for alerts
export const mockAlerts: AlertItem[] = [
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

// Function to generate sales trend data
const generateSalesTrendData = (days: number): SalesTrendData => {
  const dates: string[] = [];
  const sales: number[] = [];
  const profits: number[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    
    let dateFormat = "MM-DD";
    if (days > 30) {
      dateFormat = "YYYY-MM";
    }
    dates.push(dayjs(date).format(dateFormat));
    
    const baseSales = 1000000 + Math.random() * 2000000;
    const salesValue = Math.floor(baseSales * (0.85 + Math.sin(i / 10) * 0.15));
    sales.push(salesValue);
    
    const profitRate = 0.2 + Math.random() * 0.1;
    profits.push(Math.floor(salesValue * profitRate));
  }
  
  return { dates, sales, profits };
};

// Mock data for store data
export const mockStoreData: StoreData[] = [
  { name: "東京本店", sales: 500000, profit: 100000, target: 450000, status: "open" },
  { name: "大阪店", sales: 450000, profit: 90000, target: 400000, status: "open" },
  { name: "名古屋店", sales: 400000, profit: 80000, target: 380000, status: "open" },
  { name: "福岡店", sales: 350000, profit: 70000, target: 350000, status: "open" },
  { name: "札幌店", sales: 300000, profit: 60000, target: 320000, status: "open" },
  { name: "仙台店", sales: 280000, profit: 56000, target: 300000, status: "open" },
  { name: "広島店", sales: 250000, profit: 50000, target: 280000, status: "open" },
  { name: "京都店", sales: 220000, profit: 44000, target: 250000, status: "open" },
  { name: "横浜店", sales: 200000, profit: 40000, target: 220000, status: "open" },
  { name: "神戸店", sales: 180000, profit: 36000, target: 200000, status: "open" },
];

// Mock data for store sales
export const mockStoreSales: StoreSalesData[] = mockStoreData.map(store => ({
  name: store.name,
  sales: store.sales,
  profit: store.profit,
  target: store.target,
  achievementRate: Math.floor((store.sales / store.target) * 100)
}));

// Export mock API functions
export const mockDashboardAPI = {
  getDashboardData: () => Promise.resolve(mockDashboardData),
  getProductRanking: () => Promise.resolve(mockProductRanking),
  getStoreData: () => Promise.resolve(mockStoreData),
  getAlerts: () => Promise.resolve(mockAlerts),
  getSalesTrend: (params?: { range?: string; rank?: string }) => {
    const days = params?.range ? parseInt(params.range) : 7;
    return Promise.resolve(generateSalesTrendData(days));
  },
  getStoreSales: () => Promise.resolve(mockStoreSales),
}; 