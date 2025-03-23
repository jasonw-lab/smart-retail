import request from "@/utils/request";

const PMS_BRAND_BASE_URL = "/api/v1/attributes";

/**
 * 获取商品属性列表
 *
 * @param params
 */
export function getAttributeList(params: object) {
  return request({
    url: PMS_BRAND_BASE_URL,
    method: "get",
    params: params,
  });
}

/**
 * 批量修改商品属性
 *
 * @param data
 */
export function saveAttributeBatch(data: object) {
  return request({
    url: `${PMS_BRAND_BASE_URL}/batch`,
    method: "post",
    data: data,
  });
}
