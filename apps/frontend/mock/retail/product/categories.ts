import { defineMock } from "../../base";

interface Category {
  id: number;
  name: string;
}

const categories: Category[] = [
  { id: 1, name: "飲料" },
  { id: 2, name: "食品" },
  { id: 3, name: "日用品" },
  { id: 4, name: "雑貨" },
  { id: 5, name: "その他" },
];

export default defineMock({
  url: "retail/categories",
  method: "GET",
  body: {
    code: "00000",
    msg: "一切ok",
    data: categories,
  },
}); 