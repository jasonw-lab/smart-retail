import request from "@/utils/request";

const CATEGORY_BASE_URL = "/api/v1/retail/categories";

export interface Category {
  id: number;
  name: string;
}

const RetailCategoryAPI = {
  /** カテゴリ一覧を取得 */
  getList() {
    return request<any, Category[]>({
      url: `${CATEGORY_BASE_URL}`,
      method: "get",
    });
  },
};

export default RetailCategoryAPI; 