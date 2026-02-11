import { defineMock } from "../../base";
import type { InboundItem } from "@/api/retail/inventory/in";

const inboundList: InboundItem[] = [
  {
    id: 1,
    createTime: "2024-03-20 10:00:00",
    storeId: 1,
    storeName: "東京本店",
    productId: 1,
    productName: "プレミアムコーヒー",
    quantity: 100,
    lotNumber: "LOT20240320-001",
    expiryDate: "2024-06-20",
    restockType: "通常入庫",
    operator: "山田太郎",
    status: "完了",
    shippingTime: "2024-03-20 10:00:00",
    registrationTime: "2024-03-20 09:30:00",
  },
  {
    id: 2,
    createTime: "2024-03-20 11:00:00",
    storeId: 2,
    storeName: "横浜駅前店",
    productId: 2,
    productName: "石鹸",
    quantity: 200,
    lotNumber: "LOT20240320-002",
    expiryDate: "2025-06-30",
    restockType: "返品入庫",
    operator: "鈴木一郎",
    status: "完了",
    shippingTime: "2024-03-20 11:00:00",
    registrationTime: "2024-03-20 10:30:00",
  },
  {
    id: 3,
    createTime: "2024-03-20 12:00:00",
    storeId: 3,
    storeName: "金沢店",
    productId: 3,
    productName: "シャンプー",
    quantity: 150,
    lotNumber: "LOT20240320-003",
    expiryDate: "2025-03-31",
    restockType: "調整入庫",
    operator: "佐藤花子",
    status: "完了",
    shippingTime: "2024-03-20 12:00:00",
    registrationTime: "2024-03-20 11:30:00",
  },
  {
    id: 4,
    createTime: "2024-03-19 09:00:00",
    storeId: 1,
    storeName: "東京本店",
    productId: 4,
    productName: "緑茶",
    quantity: 200,
    lotNumber: "LOT20240319-001",
    expiryDate: "2024-11-30",
    restockType: "normal",
    operator: "田中次郎",
    status: "completed",
    shippingTime: "2024-03-19 09:00:00",
  },
  {
    id: 5,
    createTime: "2024-03-19 10:30:00",
    storeId: 2,
    storeName: "横浜駅前店",
    productId: 5,
    productName: "オーガニックティー",
    quantity: 150,
    lotNumber: "LOT20240319-002",
    expiryDate: "2025-06-30",
    restockType: "return",
    operator: "中村三郎",
    status: "completed",
    shippingTime: "2024-03-19 10:30:00",
  },
  {
    id: 6,
    createTime: "2024-03-19 14:00:00",
    storeId: 3,
    storeName: "金沢店",
    productId: 6,
    productName: "天然水",
    quantity: 300,
    lotNumber: "LOT20240319-003",
    expiryDate: "2025-03-31",
    restockType: "adjustment",
    operator: "小林四郎",
    status: "completed",
    shippingTime: "2024-03-19 14:00:00",
  },
  {
    id: 7,
    createTime: "2024-03-18 08:00:00",
    storeId: 1,
    storeName: "東京本店",
    productId: 7,
    productName: "チョコレート",
    quantity: 250,
    lotNumber: "LOT20240318-001",
    expiryDate: "2024-12-31",
    restockType: "normal",
    operator: "加藤五郎",
    status: "completed",
    shippingTime: "2024-03-18 08:00:00",
  },
  {
    id: 8,
    createTime: "2024-03-18 11:00:00",
    storeId: 2,
    storeName: "横浜駅前店",
    productId: 8,
    productName: "クッキー",
    quantity: 180,
    lotNumber: "LOT20240318-002",
    expiryDate: "2024-09-30",
    restockType: "return",
    operator: "渡辺六郎",
    status: "completed",
    shippingTime: "2024-03-18 11:00:00",
  },
  {
    id: 9,
    createTime: "2024-03-18 15:00:00",
    storeId: 3,
    storeName: "金沢店",
    productId: 9,
    productName: "紅茶",
    quantity: 120,
    lotNumber: "LOT20240318-003",
    expiryDate: "2025-06-30",
    restockType: "adjustment",
    operator: "伊藤七郎",
    status: "completed",
    shippingTime: "2024-03-18 15:00:00",
  },
  {
    id: 10,
    createTime: "2024-03-17 09:30:00",
    storeId: 1,
    storeName: "東京本店",
    productId: 10,
    productName: "ポテトチップス",
    quantity: 200,
    lotNumber: "LOT20240317-001",
    expiryDate: "2025-03-31",
    restockType: "normal",
    operator: "山本八郎",
    status: "completed",
    shippingTime: "2024-03-17 09:30:00",
  },
  {
    id: 11,
    createTime: "2024-03-17 13:00:00",
    storeId: 2,
    storeName: "横浜駅前店",
    productId: 11,
    productName: "キャンディー",
    quantity: 400,
    lotNumber: "LOT20240317-002",
    expiryDate: "2025-06-30",
    restockType: "return",
    operator: "吉田九郎",
    status: "completed",
    shippingTime: "2024-03-17 13:00:00",
  },
  {
    id: 12,
    createTime: "2024-03-17 16:00:00",
    storeId: 3,
    storeName: "金沢店",
    productId: 12,
    productName: "ハンドソープ",
    quantity: 150,
    lotNumber: "LOT20240317-003",
    expiryDate: "2025-06-30",
    restockType: "adjustment",
    operator: "高橋十郎",
    status: "completed",
    shippingTime: "2024-03-17 16:00:00",
  },
  {
    id: 13,
    createTime: "2024-03-16 10:00:00",
    storeId: 1,
    storeName: "東京本店",
    productId: 13,
    productName: "歯ブラシ",
    quantity: 300,
    lotNumber: "LOT20240316-001",
    expiryDate: "2026-12-31",
    restockType: "normal",
    operator: "佐々木十一郎",
    status: "completed",
    shippingTime: "2024-03-16 10:00:00",
  },
  {
    id: 14,
    createTime: "2024-03-16 14:30:00",
    storeId: 2,
    storeName: "横浜駅前店",
    productId: 14,
    productName: "ノート",
    quantity: 500,
    lotNumber: "LOT20240316-002",
    expiryDate: "2026-12-31",
    restockType: "return",
    operator: "山口十二郎",
    status: "completed",
    shippingTime: "2024-03-16 14:30:00",
  },
  {
    id: 15,
    createTime: "2024-03-16 16:00:00",
    storeId: 3,
    storeName: "金沢店",
    productId: 15,
    productName: "ハーブティー",
    quantity: 100,
    lotNumber: "LOT20240316-003",
    expiryDate: "2025-12-31",
    restockType: "adjustment",
    operator: "松本十三郎",
    status: "completed",
    shippingTime: "2024-03-16 16:00:00",
  },
  {
    id: 16,
    createTime: "2024-03-15 09:00:00",
    storeId: 1,
    storeName: "東京本店",
    productId: 16,
    productName: "スポンジ",
    quantity: 200,
    lotNumber: "LOT20240315-001",
    expiryDate: "2025-06-30",
    restockType: "normal",
    operator: "井上十四郎",
    status: "completed",
    shippingTime: "2024-03-15 09:00:00",
  },
  {
    id: 17,
    createTime: "2024-03-15 11:30:00",
    storeId: 2,
    storeName: "横浜駅前店",
    productId: 17,
    productName: "収納ボックス",
    quantity: 50,
    lotNumber: "LOT20240315-002",
    expiryDate: "2025-12-31",
    restockType: "return",
    operator: "木村十五郎",
    status: "completed",
    shippingTime: "2024-03-15 11:30:00",
  },
  {
    id: 18,
    createTime: "2024-03-15 15:00:00",
    storeId: 3,
    storeName: "金沢店",
    productId: 18,
    productName: "フォトフレーム",
    quantity: 80,
    lotNumber: "LOT20240315-003",
    expiryDate: "2025-06-30",
    restockType: "adjustment",
    operator: "清水十六郎",
    status: "completed",
    shippingTime: "2024-03-15 15:00:00",
  },
  {
    id: 19,
    createTime: "2024-03-14 08:30:00",
    storeId: 1,
    storeName: "東京本店",
    productId: 1,
    productName: "プレミアムコーヒー",
    quantity: 150,
    lotNumber: "LOT20240314-001",
    expiryDate: "2024-06-20",
    restockType: "normal",
    operator: "斎藤十七郎",
    status: "completed",
    shippingTime: "2024-03-14 08:30:00",
  },
  {
    id: 20,
    createTime: "2024-03-14 13:00:00",
    storeId: 2,
    storeName: "横浜駅前店",
    productId: 2,
    productName: "石鹸",
    quantity: 250,
    lotNumber: "LOT20240314-002",
    expiryDate: "2025-06-30",
    restockType: "return",
    operator: "山崎十八郎",
    status: "completed",
    shippingTime: "2024-03-14 13:00:00",
  },
  {
    id: 21,
    createTime: "2024-03-14 16:30:00",
    storeId: 3,
    storeName: "金沢店",
    productId: 3,
    productName: "シャンプー",
    quantity: 180,
    lotNumber: "LOT20240314-003",
    expiryDate: "2025-03-31",
    restockType: "adjustment",
    operator: "森十九郎",
    status: "completed",
    shippingTime: "2024-03-14 16:30:00",
  },
  {
    id: 22,
    createTime: "2024-03-13 09:00:00",
    storeId: 1,
    storeName: "東京本店",
    productId: 4,
    productName: "緑茶",
    quantity: 220,
    lotNumber: "LOT20240313-001",
    expiryDate: "2024-11-30",
    restockType: "normal",
    operator: "池田二十郎",
    status: "completed",
    shippingTime: "2024-03-13 09:00:00",
  },
  {
    id: 23,
    createTime: "2024-03-13 14:00:00",
    storeId: 2,
    storeName: "横浜駅前店",
    productId: 5,
    productName: "オーガニックティー",
    quantity: 170,
    lotNumber: "LOT20240313-002",
    expiryDate: "2025-06-30",
    restockType: "return",
    operator: "橋本二十一郎",
    status: "completed",
    shippingTime: "2024-03-13 14:00:00",
  },
  {
    id: 24,
    createTime: "2024-03-13 17:00:00",
    storeId: 3,
    storeName: "金沢店",
    productId: 6,
    productName: "天然水",
    quantity: 350,
    lotNumber: "LOT20240313-003",
    expiryDate: "2025-03-31",
    restockType: "adjustment",
    operator: "阿部二十二郎",
    status: "completed",
    shippingTime: "2024-03-13 17:00:00",
  },
  {
    id: 25,
    createTime: "2024-03-12 08:00:00",
    storeId: 1,
    storeName: "東京本店",
    productId: 7,
    productName: "チョコレート",
    quantity: 280,
    lotNumber: "LOT20240312-001",
    expiryDate: "2024-12-31",
    restockType: "normal",
    operator: "石川二十三郎",
    status: "completed",
    shippingTime: "2024-03-12 08:00:00",
  },
  {
    id: 26,
    createTime: "2024-03-12 12:00:00",
    storeId: 2,
    storeName: "横浜駅前店",
    productId: 8,
    productName: "クッキー",
    quantity: 200,
    lotNumber: "LOT20240312-002",
    expiryDate: "2024-09-30",
    restockType: "return",
    operator: "前田二十四郎",
    status: "completed",
    shippingTime: "2024-03-12 12:00:00",
  },
  {
    id: 27,
    createTime: "2024-03-12 15:30:00",
    storeId: 3,
    storeName: "金沢店",
    productId: 9,
    productName: "紅茶",
    quantity: 140,
    lotNumber: "LOT20240312-003",
    expiryDate: "2025-06-30",
    restockType: "adjustment",
    operator: "藤田二十五郎",
    status: "completed",
    shippingTime: "2024-03-12 15:30:00",
  },
  {
    id: 28,
    createTime: "2024-03-11 09:30:00",
    storeId: 1,
    storeName: "東京本店",
    productId: 10,
    productName: "ポテトチップス",
    quantity: 220,
    lotNumber: "LOT20240311-001",
    expiryDate: "2025-03-31",
    restockType: "normal",
    operator: "後藤二十六郎",
    status: "completed",
    shippingTime: "2024-03-11 09:30:00",
  },
  {
    id: 29,
    createTime: "2024-03-11 13:30:00",
    storeId: 2,
    storeName: "横浜駅前店",
    productId: 11,
    productName: "キャンディー",
    quantity: 450,
    lotNumber: "LOT20240311-002",
    expiryDate: "2025-06-30",
    restockType: "return",
    operator: "近藤二十七郎",
    status: "completed",
    shippingTime: "2024-03-11 13:30:00",
  },
  {
    id: 30,
    createTime: "2024-03-11 16:00:00",
    storeId: 3,
    storeName: "金沢店",
    productId: 12,
    productName: "ハンドソープ",
    quantity: 180,
    lotNumber: "LOT20240311-003",
    expiryDate: "2025-06-30",
    restockType: "adjustment",
    operator: "村上二十八郎",
    status: "completed",
    shippingTime: "2024-03-11 16:00:00",
  },
];

export default defineMock([
  {
    url: "retail/inventory/in/list",
    response(req, res) {
      const { query = {} } = req;
      const { storeId, productName, lotNumber, restockType, page = "1", pageSize = "10" } = query;

      let filteredList = [...inboundList];

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

      if (restockType) {
        filteredList = filteredList.filter((item) => item.restockType === restockType);
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
            pageSize: parseInt(String(pageSize)),
          },
        })
      );
    },
  },
  {
    url: "retail/inventory/in/:id",
    method: "GET",
    response(req, res) {
      const { params } = req;
      const item = inboundList.find((i) => i.id === Number(params.id));

      if (!item) {
        res.statusCode = 404;
        res.end(JSON.stringify({ code: "404", message: "入庫記録が見つかりません" }));
        return;
      }

      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify({ code: "00000", message: "success", data: item }));
    },
  },
  {
    url: "retail/inventory/in",
    method: "POST",
    response(req, res) {
      const { body } = req;
      const operators = ["山田太郎", "鈴木一郎", "佐藤花子"];
      const stores = {
        1: "東京本店",
        2: "横浜駅前店",
        3: "金沢店"
      };
      const newItem: InboundItem = {
        id: inboundList.length + 1,
        createTime: new Date().toISOString(),
        storeId: body.storeId,
        storeName: stores[body.storeId] || "店舗" + String.fromCharCode(64 + body.storeId),
        productId: body.productId,
        productName: "商品" + String.fromCharCode(64 + body.productId),
        quantity: body.quantity,
        lotNumber: body.lotNumber,
        expiryDate: body.expiryDate,
        restockType: body.restockType,
        operator: operators[Math.floor(Math.random() * 3)],
        status: "完了",
        shippingTime: new Date().toISOString(),
        registrationTime: new Date().toISOString(),
      };
      inboundList.push(newItem);

      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify({ code: "00000", message: "success", data: newItem }));
    },
  },
  {
    url: "retail/inventory/in/:id",
    method: "PUT",
    response(req, res) {
      const { params, body } = req;
      const index = inboundList.findIndex((i) => i.id === Number(params.id));

      if (index === -1) {
        res.statusCode = 404;
        res.end(JSON.stringify({ code: "404", message: "入庫記録が見つかりません" }));
        return;
      }

      const updatedItem: InboundItem = {
        ...inboundList[index],
        ...body,
      };
      inboundList[index] = updatedItem;

      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify({ code: "00000", message: "success", data: updatedItem }));
    },
  },
  {
    url: "retail/inventory/in/:id",
    method: "DELETE",
    response(req, res) {
      const { params } = req;
      const index = inboundList.findIndex((i) => i.id === Number(params.id));

      if (index === -1) {
        res.statusCode = 404;
        res.end(JSON.stringify({ code: "404", message: "入庫記録が見つかりません" }));
        return;
      }

      try {
        inboundList.splice(index, 1);
        res.statusCode = 200;
        res.end(JSON.stringify({ code: "00000", message: "success", data: null }));
      } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ code: "500", message: "入庫記録の削除に失敗しました" }));
      }
    },
  },
]); 