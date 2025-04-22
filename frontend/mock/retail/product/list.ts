import { defineMock } from "../../base";

interface Product {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: number;
  stock: number;
  sales: number;
  imageUrl: string;
  description: string;
  expiryDate: string;
}

// 商品一覧のmockデータ
const products: Product[] = [
  {
    id: 1,
    name: "プレミアムコーヒー",
    categoryId: 1,
    categoryName: "飲料",
    price: 980,
    stock: 100,
    sales: 150,
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop",
    description: "厳選された豆を使用した最高級のコーヒー",
    expiryDate: "2025-12-31",
  },
  {
    id: 2,
    name: "オーガニックティー",
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
    id: 3,
    name: "天然水",
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
    id: 4,
    name: "チョコレート",
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
    id: 5,
    name: "クッキー",
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
    id: 6,
    name: "石鹸",
    categoryId: 4,
    categoryName: "日用品",
    price: 480,
    stock: 120,
    sales: 150,
    imageUrl: "https://images.unsplash.com/photo-1606811841030-8ffda4d7f6a3?w=200&h=200&fit=crop",
    description: "天然成分を使用した肌に優しい石鹸",
    expiryDate: "2025-12-31",
  },
  {
    id: 7,
    name: "歯ブラシ",
    categoryId: 4,
    categoryName: "日用品",
    price: 180,
    stock: 300,
    sales: 365,
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop",
    description: "やわらかい毛先の歯ブラシ",
    expiryDate: "2025-06-30",
  },
  {
    id: 8,
    name: "タオル",
    categoryId: 5,
    categoryName: "日用品",
    price: 680,
    stock: 60,
    sales: 1095,
    imageUrl: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=200&h=200&fit=crop",
    description: "吸水性の高い高品質タオル",
    expiryDate: "2025-03-31",
  },
  {
    id: 9,
    name: "マグカップ",
    categoryId: 5,
    categoryName: "日用品",
    price: 880,
    stock: 40,
    sales: 1095,
    imageUrl: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=200&h=200&fit=crop",
    description: "保温性の高いマグカップ",
    expiryDate: "2025-06-30",
  },
  {
    id: 10,
    name: "ノート",
    categoryId: 5,
    categoryName: "日用品",
    price: 280,
    stock: 200,
    sales: 1095,
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=200&fit=crop",
    description: "書き心地の良いノート",
    expiryDate: "2025-03-31",
  },
  {
    id: 11,
    name: "緑茶",
    categoryId: 1,
    categoryName: "飲料",
    price: 580,
    stock: 150,
    sales: 180,
    imageUrl: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=200&h=200&fit=crop",
    description: "香り高い日本産緑茶",
    expiryDate: "2025-12-31",
  },
  {
    id: 12,
    name: "紅茶",
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
    id: 13,
    name: "ポテトチップス",
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
    id: 14,
    name: "キャンディー",
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
    id: 15,
    name: "シャンプー",
    categoryId: 3,
    categoryName: "日用品",
    price: 780,
    stock: 100,
    sales: 150,
    imageUrl: "https://images.unsplash.com/photo-1606811841030-8ffda4d7f6a3?w=200&h=200&fit=crop",
    description: "ダメージケア用シャンプー",
    expiryDate: "2025-12-31",
  },
  {
    id: 16,
    name: "ハンドソープ",
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
    id: 17,
    name: "収納ボックス",
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
    categoryId: 4,
    categoryName: "日用品",
    price: 980,
    stock: 80,
    sales: 1825,
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=200&fit=crop",
    description: "木製フォトフレーム",
    expiryDate: "2025-06-30",
  },
  {
    id: 19,
    name: "ハーブティー",
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
    id: 20,
    name: "スポンジ",
    categoryId: 3,
    categoryName: "日用品",
    price: 280,
    stock: 200,
    sales: 365,
    imageUrl: "https://images.unsplash.com/photo-1606813907290-d86a9c56a3b4?w=200&h=200&fit=crop",
    description: "キッチン用スポンジ",
    expiryDate: "2025-06-30",
  }
];

export default defineMock({
  url: "retail/product/list",
  method: "GET",
  response: (req, res) => {
    const { query = {} } = req;
    const { keyword, categoryId, page = "1", pageSize = "10" } = query;
    
    let filteredProducts = [...products];
    
    if (keyword) {
      filteredProducts = filteredProducts.filter(
        (p) => 
          p.name.toLowerCase().includes(String(keyword).toLowerCase()) ||
          p.description.toLowerCase().includes(String(keyword).toLowerCase()),
      );
    }
    
    if (categoryId) {
      filteredProducts = filteredProducts.filter(
        (p) => p.categoryId === parseInt(String(categoryId)),
      );
    }
    
    const total = filteredProducts.length;
    const start = (parseInt(String(page)) - 1) * parseInt(String(pageSize));
    const end = start + parseInt(String(pageSize));
    const data = filteredProducts.slice(start, end);
    
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.end(JSON.stringify({
      code: "00000",
      message: "success",
      data: {
        list: data,
        total,
        page: parseInt(String(page)),
        pageSize: parseInt(String(pageSize)),
      },
    }));
  },
}); 