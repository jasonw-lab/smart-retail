//import { defineMock } from "vite-plugin-mock-dev-server";
import { defineMock } from "../../base";
import type { Inventory } from "@/api/retail/inventory";

const inventoryList: Inventory[] = [
  {
    id: 1,
    storeId: 1,
    storeName: "東京本店",
    productId: 1,
    productName: "チキン",
    stock: 5,
    expiryDate: "2024-04-20",
    status: "low",
  },
  {
    id: 2,
    storeId: 2,
    storeName: "横浜駅前店",
    productId: 2,
    productName: "ハンバーガー",
    stock: 15,
    expiryDate: "2024-04-25",
    status: "normal",
  },
  {
    id: 3,
    storeId: 3,
    storeName: "金沢店",
    productId: 3,
    productName: "フライドポテト",
    stock: 30,
    expiryDate: "2024-05-01",
    status: "high",
  },
];

const historyData = [
  {
    id: 1,
    type: "入庫",
    quantity: 100,
    date: "2024-03-20 10:00:00",
    reason: "通常入庫",
    operator: "山田太郎",
  },
  {
    id: 2,
    type: "出庫",
    quantity: -50,
    date: "2024-03-20 11:00:00",
    reason: "店舗出荷",
    operator: "鈴木一郎",
  },
  {
    id: 3,
    type: "入庫",
    quantity: 75,
    date: "2024-03-19 09:00:00",
    reason: "返品入庫",
    operator: "佐藤花子",
  },
  {
    id: 4,
    type: "出庫",
    quantity: -25,
    date: "2024-03-19 14:00:00",
    reason: "破損品廃棄",
    operator: "田中次郎",
  },
  {
    id: 5,
    type: "入庫",
    quantity: 150,
    date: "2024-03-18 10:00:00",
    reason: "通常入庫",
    operator: "中村三郎",
  },
  {
    id: 6,
    type: "出庫",
    quantity: -100,
    date: "2024-03-18 15:00:00",
    reason: "店舗出荷",
    operator: "小林四郎",
  },
  {
    id: 7,
    type: "入庫",
    quantity: 50,
    date: "2024-03-17 09:00:00",
    reason: "返品入庫",
    operator: "加藤五郎",
  },
  {
    id: 8,
    type: "出庫",
    quantity: -30,
    date: "2024-03-17 13:00:00",
    reason: "破損品廃棄",
    operator: "渡辺六郎",
  },
  {
    id: 9,
    type: "入庫",
    quantity: 200,
    date: "2024-03-16 10:00:00",
    reason: "通常入庫",
    operator: "伊藤七郎",
  },
  {
    id: 10,
    type: "出庫",
    quantity: -150,
    date: "2024-03-16 15:00:00",
    reason: "店舗出荷",
    operator: "山本八郎",
  },
  {
    id: 11,
    type: "入庫",
    quantity: 80,
    date: "2024-03-15 09:00:00",
    reason: "返品入庫",
    operator: "吉田九郎",
  },
  {
    id: 12,
    type: "出庫",
    quantity: -40,
    date: "2024-03-15 14:00:00",
    reason: "破損品廃棄",
    operator: "高橋十郎",
  },
  {
    id: 13,
    type: "入庫",
    quantity: 120,
    date: "2024-03-14 10:00:00",
    reason: "通常入庫",
    operator: "佐々木十一郎",
  },
  {
    id: 14,
    type: "出庫",
    quantity: -60,
    date: "2024-03-14 15:00:00",
    reason: "店舗出荷",
    operator: "山口十二郎",
  },
  {
    id: 15,
    type: "入庫",
    quantity: 90,
    date: "2024-03-13 09:00:00",
    reason: "返品入庫",
    operator: "松本十三郎",
  },
  {
    id: 16,
    type: "出庫",
    quantity: -45,
    date: "2024-03-13 14:00:00",
    reason: "破損品廃棄",
    operator: "井上十四郎",
  },
  {
    id: 17,
    type: "入庫",
    quantity: 180,
    date: "2024-03-12 10:00:00",
    reason: "通常入庫",
    operator: "木村十五郎",
  },
  {
    id: 18,
    type: "出庫",
    quantity: -90,
    date: "2024-03-12 15:00:00",
    reason: "店舗出荷",
    operator: "清水十六郎",
  },
  {
    id: 19,
    type: "入庫",
    quantity: 70,
    date: "2024-03-11 09:00:00",
    reason: "返品入庫",
    operator: "斎藤十七郎",
  },
  {
    id: 20,
    type: "出庫",
    quantity: -35,
    date: "2024-03-11 14:00:00",
    reason: "破損品廃棄",
    operator: "山崎十八郎",
  },
];

export default defineMock([
  {
    url: "retail/inventory/list",
    method: ["GET"],
    body: ({ query }) => {
      const { page = 1, pageSize = 10, storeId, productName, stockStatus } = query;
      
      let filteredList = [...inventoryList];
      
      if (storeId) {
        filteredList = filteredList.filter((item) => item.storeId === Number(storeId));
      }
      
      if (productName) {
        filteredList = filteredList.filter((item) =>
          item.productName.includes(productName as string)
        );
      }
      
      if (stockStatus) {
        filteredList = filteredList.filter((item) => item.status === stockStatus);
      }
      
      const start = (Number(page) - 1) * Number(pageSize);
      const end = start + Number(pageSize);
      
      return {
        code: "00000",
        data: {
          list: filteredList.slice(start, end),
          total: filteredList.length,
        },
        msg: "一切ok",
      };
    },
  },
  {
    url: "retail/inventory/restock",
    method: ["POST"],
    body: ({ body }) => {
      const { id, amount, expiryDate } = body;
      const item = inventoryList.find((item) => item.id === id);
      if (!item) {
        return {
          code: "10001",
          msg: "在庫が見つかりません",
        };
      }
      item.stock += amount;
      item.expiryDate = expiryDate;
      // 在庫状態を更新
      if (item.stock < 10) {
        item.status = "low";
      } else if (item.stock > 20) {
        item.status = "high";
      } else {
        item.status = "normal";
      }
      return {
        code: "00000",
        msg: "補充が完了しました",
      };
    },
  },
  {
    url: "retail/inventory/history/:id",
    method: ["GET"],
    body: ({ query }) => {
      const { page = 1, pageSize = 10 } = query;
      const start = (Number(page) - 1) * Number(pageSize);
      const end = start + Number(pageSize);
      const list = historyData.slice(start, end);
      
      return {
        code: "00000",
        data: {
          list,
          total: historyData.length,
        },
        msg: "一切ok",
      };
    },
  },
]);
