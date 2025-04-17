import { defineMockApi } from "../base2";

const mockAlerts = [
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

export default defineMockApi([
  {
    url: "/api/dashboard/alerts",
    method: ["GET"],
    response: () => {
      return {
        code: "00000",
        data: mockAlerts,
        msg: "一切ok",
      };
    },
  },
]); 