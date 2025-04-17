import { defineMockApi } from "../base2";

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

export default defineMockApi([
  {
    url: "/api/dashboard/product-ranking",
    method: ["GET"],
    response: () => {
      return {
        code: "00000",
        data: mockProductRanking,
        msg: "一切ok",
      };
    },
  },
]); 