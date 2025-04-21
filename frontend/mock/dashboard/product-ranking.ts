import { defineMockApi } from "../base2";

const mockProductRanking = [
  {
    name: "プレミアムコーヒー",
    sales: 21000 * 10,
    count: 3 * 10,
    growth: 12.5,
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=100&h=100&fit=crop",
  },
  {
    name: "オーガニックティー",
    sales: 18000 * 10,
    count: 5 * 10,
    growth: 8.3,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop",
  },
  {
    name: "スペシャルブレンド",
    sales: 15000 * 10,
    count: 4 * 10,
    growth: -2.1,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop",
  },
  {
    name: "デカフェコーヒー",
    sales: 12000 * 10,
    count: 6 * 10,
    growth: 15.7,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop",
  },
  {
    name: "フルーツティー",
    sales: 10000 * 10,
    count: 8 * 10,
    growth: 5.2,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=100&h=100&fit=crop",
  },
];

export default defineMockApi([
  {
    url: "dashboard/product-ranking",
    method: ["GET"],
    response: (req, res) => {
      res.end(
        JSON.stringify({
          code: "00000",
          data: mockProductRanking,
          msg: "一切ok",
        })
      );
    },
  },
]); 