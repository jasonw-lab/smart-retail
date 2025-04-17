import { defineMockApi } from "../base2";

const mockDashboardData = {
  totalSales: 210000,
  salesGrowthRate: 15.5,
  restockStoreCount: 3,
  totalStoreCount: 10,
  totalProductCount: 150,
};

export default defineMockApi([
  {
    url: "/api/dashboard/overview",
    method: ["GET"],
    response: () => {
      return {
        code: "00000",
        data: mockDashboardData,
        msg: "一切ok",
      };
    },
  },
]); 