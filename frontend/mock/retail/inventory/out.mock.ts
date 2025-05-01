import { defineMock } from "../../base";
import type { OutboundItem } from "@/api/retail/inventory/out";

const outboundList: OutboundItem[] = [
  {
    id: 1,
    createTime: "2024-03-20 10:00:00",
    storeId: 1,
    storeName: "東京本店",
    productId: 1,
    productName: "プレミアムコーヒー",
    quantity: 50,
    lotNumber: "LOT20240320-001",
    expiryDate: "2024-06-20",
    outboundType: "通常出庫",
    status: "完了",
    shippingTime: "2024-03-20 10:00:00",
    operator: "山田太郎"
  },
  {
    id: 2,
    createTime: "2024-03-20 11:00:00",
    storeId: 2,
    storeName: "横浜駅前店",
    productId: 2,
    productName: "石鹸",
    quantity: 100,
    lotNumber: "LOT20240320-002",
    expiryDate: "2025-06-30",
    outboundType: "返品出庫",
    status: "完了",
    shippingTime: "2024-03-20 11:00:00",
    operator: "鈴木一郎"
  },
  {
    id: 3,
    createTime: "2024-03-20 12:00:00",
    storeId: 3,
    storeName: "金沢店",
    productId: 3,
    productName: "シャンプー",
    quantity: 75,
    lotNumber: "LOT20240320-003",
    expiryDate: "2025-03-31",
    outboundType: "調整出庫",
    status: "完了",
    shippingTime: "2024-03-20 12:00:00",
    operator: "佐藤花子"
  },
  {
    id: 4,
    createTime: "2024-03-19 09:00:00",
    storeId: 1,
    storeName: "東京本店",
    productId: 4,
    productName: "緑茶",
    quantity: 100,
    lotNumber: "LOT20240319-001",
    expiryDate: "2024-11-30",
    outboundType: "通常出庫",
    status: "完了",
    shippingTime: "2024-03-19 09:00:00",
    operator: "田中次郎"
  },
  {
    id: 5,
    createTime: "2024-03-19 10:30:00",
    storeId: 2,
    storeName: "横浜駅前店",
    productId: 5,
    productName: "オーガニックティー",
    quantity: 75,
    lotNumber: "LOT20240319-002",
    expiryDate: "2025-06-30",
    outboundType: "返品出庫",
    status: "完了",
    shippingTime: "2024-03-19 10:30:00",
    operator: "中村三郎"
  },
  {
    id: 6,
    createTime: "2024-03-19 14:00:00",
    storeId: 3,
    storeName: "金沢店",
    productId: 6,
    productName: "天然水",
    quantity: 150,
    lotNumber: "LOT20240319-003",
    expiryDate: "2025-03-31",
    outboundType: "調整出庫",
    status: "完了",
    shippingTime: "2024-03-19 14:00:00",
    operator: "小林四郎"
  },
  {
    id: 7,
    createTime: "2024-03-18 08:00:00",
    storeId: 1,
    storeName: "東京本店",
    productId: 7,
    productName: "チョコレート",
    quantity: 125,
    lotNumber: "LOT20240318-001",
    expiryDate: "2024-12-31",
    outboundType: "通常出庫",
    operator: "加藤五郎",
    status: "完了",
    shippingTime: "2024-03-18 08:00:00",
  },
  {
    id: 8,
    createTime: "2024-03-18 11:00:00",
    storeId: 2,
    storeName: "横浜駅前店",
    productId: 8,
    productName: "クッキー",
    quantity: 90,
    lotNumber: "LOT20240318-002",
    expiryDate: "2024-09-30",
    outboundType: "返品出庫",
    operator: "渡辺六郎",
    status: "完了",
    shippingTime: "2024-03-18 11:00:00",
  },
  {
    id: 9,
    createTime: "2024-03-18 15:00:00",
    storeId: 3,
    storeName: "金沢店",
    productId: 9,
    productName: "紅茶",
    quantity: 60,
    lotNumber: "LOT20240318-003",
    expiryDate: "2025-06-30",
    outboundType: "調整出庫",
    operator: "伊藤七郎",
    status: "完了",
    shippingTime: "2024-03-18 15:00:00",
  },
  {
    id: 10,
    createTime: "2024-03-17 09:30:00",
    storeId: 1,
    storeName: "東京本店",
    productId: 10,
    productName: "ポテトチップス",
    quantity: 100,
    lotNumber: "LOT20240317-001",
    expiryDate: "2025-03-31",
    outboundType: "通常出庫",
    operator: "山本八郎",
    status: "完了",
    shippingTime: "2024-03-17 09:30:00",
  },
  {
    id: 11,
    createTime: "2024-03-17 13:00:00",
    storeId: 2,
    storeName: "横浜駅前店",
    productId: 11,
    productName: "キャンディー",
    quantity: 200,
    lotNumber: "LOT20240317-002",
    expiryDate: "2025-06-30",
    outboundType: "返品出庫",
    operator: "吉田九郎",
    status: "完了",
    shippingTime: "2024-03-17 13:00:00",
  },
  {
    id: 12,
    createTime: "2024-03-17 16:00:00",
    storeId: 3,
    storeName: "金沢店",
    productId: 12,
    productName: "ハンドソープ",
    quantity: 75,
    lotNumber: "LOT20240317-003",
    expiryDate: "2025-06-30",
    outboundType: "調整出庫",
    operator: "高橋十郎",
    status: "完了",
    shippingTime: "2024-03-17 16:00:00",
  },
  {
    id: 13,
    createTime: "2024-03-16 10:00:00",
    storeId: 1,
    storeName: "東京本店",
    productId: 13,
    productName: "歯ブラシ",
    quantity: 150,
    lotNumber: "LOT20240316-001",
    expiryDate: "2026-12-31",
    outboundType: "通常出庫",
    operator: "佐々木十一郎",
    status: "完了",
    shippingTime: "2024-03-16 10:00:00",
  },
  {
    id: 14,
    createTime: "2024-03-16 14:30:00",
    storeId: 2,
    storeName: "横浜駅前店",
    productId: 14,
    productName: "ノート",
    quantity: 250,
    lotNumber: "LOT20240316-002",
    expiryDate: "2026-12-31",
    outboundType: "返品出庫",
    operator: "山口十二郎",
    status: "完了",
    shippingTime: "2024-03-16 14:30:00",
  },
  {
    id: 15,
    createTime: "2024-03-16 16:00:00",
    storeId: 3,
    storeName: "金沢店",
    productId: 15,
    productName: "ハーブティー",
    quantity: 50,
    lotNumber: "LOT20240316-003",
    expiryDate: "2025-12-31",
    outboundType: "調整出庫",
    operator: "松本十三郎",
    status: "完了",
    shippingTime: "2024-03-16 16:00:00",
  },
  {
    id: 16,
    createTime: "2024-03-15 09:00:00",
    storeId: 1,
    storeName: "東京本店",
    productId: 16,
    productName: "スポンジ",
    quantity: 100,
    lotNumber: "LOT20240315-001",
    expiryDate: "2025-06-30",
    outboundType: "通常出庫",
    operator: "井上十四郎",
    status: "完了",
    shippingTime: "2024-03-15 09:00:00",
  },
  {
    id: 17,
    createTime: "2024-03-15 11:30:00",
    storeId: 2,
    storeName: "横浜駅前店",
    productId: 17,
    productName: "収納ボックス",
    quantity: 25,
    lotNumber: "LOT20240315-002",
    expiryDate: "2025-12-31",
    outboundType: "返品出庫",
    operator: "木村十五郎",
    status: "完了",
    shippingTime: "2024-03-15 11:30:00",
  },
  {
    id: 18,
    createTime: "2024-03-15 15:00:00",
    storeId: 3,
    storeName: "金沢店",
    productId: 18,
    productName: "フォトフレーム",
    quantity: 40,
    lotNumber: "LOT20240315-003",
    expiryDate: "2025-06-30",
    outboundType: "調整出庫",
    operator: "清水十六郎",
    status: "完了",
    shippingTime: "2024-03-15 15:00:00",
  },
  {
    id: 19,
    createTime: "2024-03-14 08:30:00",
    storeId: 1,
    storeName: "東京本店",
    productId: 1,
    productName: "プレミアムコーヒー",
    quantity: 75,
    lotNumber: "LOT20240314-001",
    expiryDate: "2024-06-20",
    outboundType: "通常出庫",
    operator: "斎藤十七郎",
    status: "完了",
    shippingTime: "2024-03-14 08:30:00",
  },
  {
    id: 20,
    createTime: "2024-03-14 13:00:00",
    storeId: 2,
    storeName: "横浜駅前店",
    productId: 2,
    productName: "石鹸",
    quantity: 125,
    lotNumber: "LOT20240314-002",
    expiryDate: "2025-06-30",
    outboundType: "返品出庫",
    operator: "山崎十八郎",
    status: "完了",
    shippingTime: "2024-03-14 13:00:00",
  },
  {
    id: 21,
    createTime: "2024-03-14 16:30:00",
    storeId: 3,
    storeName: "金沢店",
    productId: 3,
    productName: "シャンプー",
    quantity: 90,
    lotNumber: "LOT20240314-003",
    expiryDate: "2025-03-31",
    outboundType: "調整出庫",
    operator: "森十九郎",
    status: "完了",
    shippingTime: "2024-03-14 16:30:00",
  },
  {
    id: 22,
    createTime: "2024-03-13 09:00:00",
    storeId: 1,
    storeName: "東京本店",
    productId: 4,
    productName: "緑茶",
    quantity: 110,
    lotNumber: "LOT20240313-001",
    expiryDate: "2024-11-30",
    outboundType: "通常出庫",
    operator: "池田二十郎",
    status: "完了",
    shippingTime: "2024-03-13 09:00:00",
  },
  {
    id: 23,
    createTime: "2024-03-13 14:00:00",
    storeId: 2,
    storeName: "横浜駅前店",
    productId: 5,
    productName: "オーガニックティー",
    quantity: 85,
    lotNumber: "LOT20240313-002",
    expiryDate: "2025-06-30",
    outboundType: "返品出庫",
    operator: "橋本二十一郎",
    status: "完了",
    shippingTime: "2024-03-13 14:00:00",
  },
  {
    id: 24,
    createTime: "2024-03-13 17:00:00",
    storeId: 3,
    storeName: "金沢店",
    productId: 6,
    productName: "天然水",
    quantity: 175,
    lotNumber: "LOT20240313-003",
    expiryDate: "2025-03-31",
    outboundType: "調整出庫",
    operator: "阿部二十二郎",
    status: "完了",
    shippingTime: "2024-03-13 17:00:00",
  },
  {
    id: 25,
    createTime: "2024-03-12 08:00:00",
    storeId: 1,
    storeName: "東京本店",
    productId: 7,
    productName: "チョコレート",
    quantity: 140,
    lotNumber: "LOT20240312-001",
    expiryDate: "2024-12-31",
    outboundType: "通常出庫",
    operator: "石川二十三郎",
    status: "完了",
    shippingTime: "2024-03-12 08:00:00",
  },
  {
    id: 26,
    createTime: "2024-03-12 12:00:00",
    storeId: 2,
    storeName: "横浜駅前店",
    productId: 8,
    productName: "クッキー",
    quantity: 100,
    lotNumber: "LOT20240312-002",
    expiryDate: "2024-09-30",
    outboundType: "返品出庫",
    operator: "前田二十四郎",
    status: "完了",
    shippingTime: "2024-03-12 12:00:00",
  },
  {
    id: 27,
    createTime: "2024-03-12 15:30:00",
    storeId: 3,
    storeName: "金沢店",
    productId: 9,
    productName: "紅茶",
    quantity: 70,
    lotNumber: "LOT20240312-003",
    expiryDate: "2025-06-30",
    outboundType: "調整出庫",
    operator: "藤田二十五郎",
    status: "完了",
    shippingTime: "2024-03-12 15:30:00",
  },
  {
    id: 28,
    createTime: "2024-03-11 09:30:00",
    storeId: 1,
    storeName: "東京本店",
    productId: 10,
    productName: "ポテトチップス",
    quantity: 110,
    lotNumber: "LOT20240311-001",
    expiryDate: "2025-03-31",
    outboundType: "通常出庫",
    operator: "後藤二十六郎",
    status: "完了",
    shippingTime: "2024-03-11 09:30:00",
  },
  {
    id: 29,
    createTime: "2024-03-11 13:30:00",
    storeId: 2,
    storeName: "横浜駅前店",
    productId: 11,
    productName: "キャンディー",
    quantity: 225,
    lotNumber: "LOT20240311-002",
    expiryDate: "2025-06-30",
    outboundType: "返品出庫",
    operator: "近藤二十七郎",
    status: "完了",
    shippingTime: "2024-03-11 13:30:00",
  },
  {
    id: 30,
    createTime: "2024-03-11 16:00:00",
    storeId: 3,
    storeName: "金沢店",
    productId: 12,
    productName: "ハンドソープ",
    quantity: 90,
    lotNumber: "LOT20240311-003",
    expiryDate: "2025-06-30",
    outboundType: "調整出庫",
    operator: "村上二十八郎",
    status: "完了",
    shippingTime: "2024-03-11 16:00:00",
  },
];

const stores: Record<number, string> = {
  1: "東京本店",
  2: "横浜駅前店",
  3: "金沢店",
};

const historyData = [
  {
    id: 1,
    type: "入庫",
    quantity: 100,
    date: "2024-03-20 10:00:00",
    reason: "通常入庫",
    operator: "山田太郎"
  },
  {
    id: 2,
    type: "出庫",
    quantity: -50,
    date: "2024-03-20 11:00:00",
    reason: "店舗出荷",
    operator: "鈴木一郎"
  },
  {
    id: 3,
    type: "入庫",
    quantity: 75,
    date: "2024-03-19 09:00:00",
    reason: "返品入庫",
    operator: "佐藤花子"
  },
  {
    id: 4,
    type: "出庫",
    quantity: -25,
    date: "2024-03-19 14:00:00",
    reason: "破損品廃棄",
    operator: "田中次郎"
  },
  {
    id: 5,
    type: "入庫",
    quantity: 150,
    date: "2024-03-18 10:00:00",
    reason: "通常入庫",
    operator: "中村三郎"
  },
  {
    id: 6,
    type: "出庫",
    quantity: -100,
    date: "2024-03-18 15:00:00",
    reason: "店舗出荷",
    operator: "小林四郎"
  },
  {
    id: 7,
    type: "入庫",
    quantity: 50,
    date: "2024-03-17 09:00:00",
    reason: "返品入庫",
    operator: "加藤五郎"
  },
  {
    id: 8,
    type: "出庫",
    quantity: -30,
    date: "2024-03-17 13:00:00",
    reason: "破損品廃棄",
    operator: "渡辺六郎"
  },
  {
    id: 9,
    type: "入庫",
    quantity: 200,
    date: "2024-03-16 10:00:00",
    reason: "通常入庫",
    operator: "伊藤七郎"
  },
  {
    id: 10,
    type: "出庫",
    quantity: -150,
    date: "2024-03-16 15:00:00",
    reason: "店舗出荷",
    operator: "山本八郎"
  },
  {
    id: 11,
    type: "入庫",
    quantity: 80,
    date: "2024-03-15 09:00:00",
    reason: "返品入庫",
    operator: "吉田九郎"
  },
  {
    id: 12,
    type: "出庫",
    quantity: -40,
    date: "2024-03-15 14:00:00",
    reason: "破損品廃棄",
    operator: "高橋十郎"
  }
];

export default defineMock([
  {
    url: "retail/inventory/out/list",
    response(req, res) {
      const { query = {} } = req;
      const { storeId, productName, lotNumber, outboundType, page = "1", pageSize = "10" } = query;

      let filteredList = [...outboundList];

      if (storeId) {
        filteredList = filteredList.filter((item) => item.storeId === Number(storeId));
      }

      if (productName) {
        filteredList = filteredList.filter((item) =>
          item.productName.toLowerCase().includes(String(productName).toLowerCase())
        );
      }

      if (lotNumber) {
        filteredList = filteredList.filter((item) =>
          item.lotNumber.toLowerCase().includes(String(lotNumber).toLowerCase())
        );
      }

      if (outboundType) {
        filteredList = filteredList.filter((item) => item.outboundType === outboundType);
      }

      const total = filteredList.length;
      const start = (parseInt(String(page)) - 1) * parseInt(String(pageSize));
      const end = start + parseInt(String(pageSize));
      const data = filteredList.slice(start, end);

      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          code: "00000",
          message: "success",
          data: {
            list: data,
            total,
            page: parseInt(String(page)),
            pageSize: parseInt(String(pageSize))
          }
        })
      );
    }
  },
  {
    url: "retail/inventory/out/:id",
    method: "GET",
    response(req, res) {
      const { params } = req;
      const item = outboundList.find((i) => i.id === Number(params.id));

      if (!item) {
        res.statusCode = 404;
        res.end(JSON.stringify({ code: "404", message: "出庫記録が見つかりません" }));
        return;
      }

      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify({ code: "00000", message: "success", data: item }));
    }
  },
  {
    url: "retail/inventory/out",
    method: "POST",
    response(req, res) {
      const { body } = req;
      const operators = ["山田太郎", "鈴木一郎", "佐藤花子"];
      const newItem: OutboundItem = {
        id: outboundList.length + 1,
        createTime: new Date().toISOString(),
        storeId: body.storeId,
        storeName: stores[body.storeId] || "店舗" + String.fromCharCode(64 + body.storeId),
        productId: body.productId,
        productName: "商品" + String.fromCharCode(64 + body.productId),
        quantity: body.quantity,
        lotNumber: body.lotNumber,
        expiryDate: body.expiryDate,
        outboundType: body.outboundType,
        operator: operators[Math.floor(Math.random() * 3)],
        status: "処理中",
        shippingTime: new Date().toISOString()
      };
      outboundList.push(newItem);

      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify({ code: "00000", message: "success", data: newItem }));
    }
  },
  {
    url: "retail/inventory/out/:id",
    method: "PUT",
    response(req, res) {
      const { params, body } = req;
      const index = outboundList.findIndex((i) => i.id === Number(params.id));

      if (index === -1) {
        res.statusCode = 404;
        res.end(JSON.stringify({ code: "404", message: "出庫記録が見つかりません" }));
        return;
      }

      const updatedItem: OutboundItem = {
        ...outboundList[index],
        ...body
      };
      outboundList[index] = updatedItem;

      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify({ code: "00000", message: "success", data: updatedItem }));
    }
  },
  {
    url: "retail/inventory/out/:id",
    method: "DELETE",
    response(req, res) {
      const { params } = req;
      const index = outboundList.findIndex((i) => i.id === Number(params.id));

      if (index === -1) {
        res.statusCode = 404;
        res.end(JSON.stringify({ code: "404", message: "出庫記録が見つかりません" }));
        return;
      }

      try {
        outboundList.splice(index, 1);
        res.statusCode = 200;
        res.end(JSON.stringify({ code: "00000", message: "success", data: null }));
      } catch {
        res.statusCode = 500;
        res.end(JSON.stringify({ code: "500", message: "出庫記録の削除に失敗しました" }));
      }
    }
  },
  {
    url: "/api/v1/retail/inventory/history/:id",
    method: "get",
    response(req, res) {
      const { page = 1, pageSize = 10 } = req.query;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const list = historyData.slice(start, end);
      
      return {
        code: 200,
        msg: "success",
        data: {
          list,
          total: historyData.length
        }
      };
    }
  }
]); 