import { defineMock } from "../../base";
import type { Product } from "@/api/retail/product/list";

const products: Product[] = [
  {
    id: 1,
    name: "プレミアムコーヒー",
    code: "P0001",
    categoryId: 1,
    categoryName: "飲料",
    price: 980,
    stock: 100,
    expiryDate: "2024-12-31",
    sales: 50,
    description: "高品質なコーヒー豆を使用したプレミアムコーヒー",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop",
  },
  {
    id: 2,
    name: "石鹸",
    code: "P0002",
    categoryId: 2,
    categoryName: "日用品",
    price: 280,
    stock: 200,
    expiryDate: "2025-06-30",
    sales: 30,
    description: "肌に優しい天然成分配合の石鹸",
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=200&h=200&fit=crop",
  },
  {
    id: 3,
    name: "シャンプー",
    code: "P0003",
    categoryId: 2,
    categoryName: "日用品",
    price: 680,
    stock: 150,
    expiryDate: "2025-03-31",
    sales: 20,
    description: "髪の毛に潤いを与える高級シャンプー",
    imageUrl: "https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=200&h=200&fit=crop",
  },
  {
    id: 4,
    name: "緑茶",
    code: "P0004",
    categoryId: 2,
    categoryName: "飲料",
    price: 380,
    stock: 150,
    sales: 30,
    description: "香り高い日本の緑茶です。",
    expiryDate: "2024-11-30",
    imageUrl: "https://images.unsplash.com/photo-1582793988951-9aed5509eb97?w=200&h=200&fit=crop",
  },
  {
    id: 5,
    name: "オーガニックティー",
    code: "P0005",
    categoryId: 1,
    categoryName: "飲料",
    price: 780,
    stock: 50,
    sales: 75,
    imageUrl: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=200&h=200&fit=crop",
    description: "有機栽培された茶葉を使用したオーガニックティー",
    expiryDate: "2025-06-30",
  },
  {
    id: 6,
    name: "天然水",
    code: "P0006",
    categoryId: 2,
    categoryName: "食品",
    price: 120,
    stock: 200,
    sales: 250,
    imageUrl: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=200&h=200&fit=crop",
    description: "天然のミネラルを豊富に含む天然水",
    expiryDate: "2025-03-31",
  },
  {
    id: 7,
    name: "チョコレート",
    code: "P0007",
    categoryId: 3,
    categoryName: "食品",
    price: 280,
    stock: 150,
    sales: 180,
    imageUrl: "https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=200&h=200&fit=crop",
    description: "カカオ70%の高品質チョコレート",
    expiryDate: "2024-12-31",
  },
  {
    id: 8,
    name: "クッキー",
    code: "P0008",
    categoryId: 3,
    categoryName: "食品",
    price: 380,
    stock: 80,
    sales: 90,
    imageUrl: "https://images.unsplash.com/photo-1558964122-2e32e1612f2d?w=200&h=200&fit=crop",
    description: "バターの風味が豊かなクッキー",
    expiryDate: "2024-09-30",
  },
  {
    id: 9,
    name: "紅茶",
    code: "P0009",
    categoryId: 1,
    categoryName: "飲料",
    price: 680,
    stock: 120,
    sales: 150,
    imageUrl: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=200&h=200&fit=crop",
    description: "芳醇な香りのセイロン紅茶",
    expiryDate: "2025-06-30",
  },
  {
    id: 10,
    name: "ポテトチップス",
    code: "P0010",
    categoryId: 2,
    categoryName: "食品",
    price: 180,
    stock: 200,
    sales: 90,
    imageUrl: "https://images.unsplash.com/photo-1565402170291-8491f14678db?w=200&h=200&fit=crop",
    description: "サクサク食感のポテトチップス",
    expiryDate: "2025-03-31",
  },
  {
    id: 11,
    name: "キャンディー",
    code: "P0011",
    categoryId: 2,
    categoryName: "食品",
    price: 150,
    stock: 300,
    sales: 365,
    imageUrl: "https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=200&h=200&fit=crop",
    description: "フルーツ味のキャンディー",
    expiryDate: "2025-06-30",
  },
  {
    id: 12,
    name: "ハンドソープ",
    code: "P0012",
    categoryId: 3,
    categoryName: "日用品",
    price: 380,
    stock: 150,
    sales: 180,
    imageUrl: "https://images.unsplash.com/photo-1606813907290-d86a9c56a3b4?w=200&h=200&fit=crop",
    description: "保湿成分配合のハンドソープ",
    expiryDate: "2025-06-30",
  },
  {
    id: 13,
    name: "歯ブラシ",
    code: "P0013",
    categoryId: 3,
    categoryName: "日用品",
    price: 320,
    stock: 200,
    sales: 60,
    description: "使いやすい柔らかめの歯ブラシです。",
    expiryDate: "2026-12-31",
    imageUrl: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=200&h=200&fit=crop",
  },
  {
    id: 14,
    name: "ノート",
    code: "P0014",
    categoryId: 4,
    categoryName: "雑貨",
    price: 280,
    stock: 300,
    sales: 100,
    description: "書きやすい上質な紙のノートです。",
    expiryDate: "2026-12-31",
    imageUrl: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=200&h=200&fit=crop",
  },
  {
    id: 15,
    name: "ハーブティー",
    code: "P0015",
    categoryId: 1,
    categoryName: "飲料",
    price: 580,
    stock: 90,
    sales: 180,
    imageUrl: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=200&h=200&fit=crop",
    description: "リラックス効果のあるハーブティー",
    expiryDate: "2025-12-31",
  },
  {
    id: 16,
    name: "スポンジ",
    code: "P0016",
    categoryId: 3,
    categoryName: "日用品",
    price: 280,
    stock: 200,
    sales: 365,
    imageUrl: "https://images.unsplash.com/photo-1606813907290-d86a9c56a3b4?w=200&h=200&fit=crop",
    description: "キッチン用スポンジ",
    expiryDate: "2025-06-30",
  },
  {
    id: 17,
    name: "収納ボックス",
    code: "P0017",
    categoryId: 4,
    categoryName: "日用品",
    price: 1280,
    stock: 50,
    sales: 1825,
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop",
    description: "スタッキング可能な収納ボックス",
    expiryDate: "2025-12-31",
  },
  {
    id: 18,
    name: "フォトフレーム",
    code: "P0018",
    categoryId: 4,
    categoryName: "日用品",
    price: 980,
    stock: 80,
    sales: 1825,
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=200&fit=crop",
    description: "木製フォトフレーム",
    expiryDate: "2025-06-30",
  },
];

export default defineMock([
  {
    url: "retail/product/list",
    response(req, res) {
      const { query = {} } = req;
      const { keyword, categoryId, page = "1", pageSize = "10" } = query;

      let filteredProducts = [...products];

      if (keyword) {
        filteredProducts = filteredProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(String(keyword).toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(String(keyword).toLowerCase()))
        );
      }

      if (categoryId) {
        filteredProducts = filteredProducts.filter(
          (p) => p.categoryId === parseInt(String(categoryId))
        );
      }

      const total = filteredProducts.length;
      const start = (parseInt(String(page)) - 1) * parseInt(String(pageSize));
      const end = start + parseInt(String(pageSize));
      const data = filteredProducts.slice(start, end);

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
    url: "retail/product/:id",
    method: "GET",
    response(req, res) {
      const { params } = req;
      const product = products.find((p) => p.id === Number(params.id));

      if (!product) {
        res.statusCode = 404;
        res.end(JSON.stringify({ code: "404", message: "商品が見つかりません" }));
        return;
      }

      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify({ code: "00000", message: "success", data: product }));
    },
  },
  {
    url: "retail/product",
    method: "POST",
    response(req, res) {
      const { body } = req;
      const newProduct: Product = {
        id: products.length + 1,
        name: body.name,
        categoryId: body.categoryId,
        categoryName: products.find((p) => p.categoryId === body.categoryId)?.categoryName || "",
        price: body.price,
        stock: body.stock || 0,
        expiryDate: body.expiryDate,
        sales: 0,
        description: body.description || "",
        imageUrl: body.imageUrl || "",
      };
      products.push(newProduct);

      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify({ code: "00000", message: "success", data: newProduct }));
    },
  },
  {
    url: "retail/product/:id",
    method: "PUT",
    response(req, res) {
      const { params, body } = req;
      const index = products.findIndex((p) => p.id === Number(params.id));

      if (index === -1) {
        res.statusCode = 404;
        res.end(JSON.stringify({ code: "404", message: "商品が見つかりません" }));
        return;
      }

      const updatedProduct: Product = {
        ...products[index],
        name: body.name,
        categoryId: body.categoryId,
        categoryName: products.find((p) => p.categoryId === body.categoryId)?.categoryName || "",
        price: body.price,
        stock: body.stock,
        expiryDate: body.expiryDate,
        description: body.description,
        imageUrl: body.imageUrl,
      };
      products[index] = updatedProduct;

      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify({ code: "00000", message: "success", data: updatedProduct }));
    },
  },
  {
    url: "retail/product/:id",
    method: "DELETE",
    response(req, res) {
      const { params } = req;
      const index = products.findIndex((p) => p.id === Number(params.id));

      if (index === -1) {
        res.statusCode = 404;
        res.end(JSON.stringify({ code: "404", message: "商品が見つかりません" }));
        return;
      }

      try {
        products.splice(index, 1);
        res.statusCode = 200;
        res.end(JSON.stringify({ code: "00000", message: "success", data: null }));
      } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ code: "500", message: "商品の削除に失敗しました" }));
      }
    },
  },
]);
