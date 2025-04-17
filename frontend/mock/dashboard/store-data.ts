import { defineMockApi } from "../base2";

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
  const totalSales = 1000000; // 仮の総売上
  const baseSales = totalSales / stores.length;

  return stores.map((store) => ({
    ...store,
    sales: Math.floor(baseSales * (0.8 + Math.random() * 0.4)), // 店舗ごとに±20%の変動
  }));
};

export default defineMockApi([
  {
    url: "/api/dashboard/store-data",
    method: ["GET"],
    response: () => {
      return {
        code: "00000",
        data: mockStoreData(),
        msg: "一切ok",
      };
    },
  },
]); 