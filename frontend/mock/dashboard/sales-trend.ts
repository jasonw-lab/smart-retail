import { defineMockApi } from "../base2";

const mockSalesTrend = {
  dates: ["03-01", "03-02", "03-03", "03-04", "03-05", "03-06", "03-07"],
  sales: [1500000, 1800000, 1600000, 2000000, 1900000, 2200000, 2100000],
  profits: [375000, 450000, 400000, 500000, 475000, 550000, 525000],
};

export default defineMockApi([
  {
    url: "/api/dashboard/sales-trend",
    method: ["GET"],
    response: () => {
      return {
        code: "00000",
        data: mockSalesTrend,
        msg: "一切ok",
      };
    },
  },
]); 