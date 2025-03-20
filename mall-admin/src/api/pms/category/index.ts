import request from "@/utils/request";
import { AxiosPromise } from "axios";

const PMS_CATEGORY_BASE_URL = "/api/v1/categories";

/**
 * 获取商品分类列表
 *
 * @param queryParams
 */
export function listCategories(queryParams: object) {
  return request({
    url: `${PMS_CATEGORY_BASE_URL}`,
    method: "get",
    params: queryParams,
  });
}

/**
 * 获取商品分类级联器树形列表
 *
 * @param queryParams
 */
export function getCategoryOptions(): AxiosPromise<OptionType[]> {
  return request({
    url: `${PMS_CATEGORY_BASE_URL}/options`,
    method: "get",
  });
}

/**
 * 获取商品分类详情
 *
 * @param id
 */
export function getCategoryDetail(id: number) {
  return request({
    url: `${PMS_CATEGORY_BASE_URL}/${id}`,
    method: "get",
  });
}

/**
 * 添加商品分类
 *
 * @param data
 */
export function addCategory(data: object) {
  return request({
    url: `${PMS_CATEGORY_BASE_URL}`,
    method: "post",
    data: data,
  });
}

/**
 * 修改商品分类
 *
 * @param id
 * @param data
 */
export function updateCategory(id: number, data: object) {
  return request({
    url: `${PMS_CATEGORY_BASE_URL}/${id}`,
    method: "put",
    data: data,
  });
}

/**
 * 删除商品分类
 *
 * @param ids
 */
export function deleteCategories(ids: string) {
  return request({
    url: `/mall-pms/api/v1/categories/${ids}`,
    method: "delete",
  });
}

/**
 * 选择性修改商品分类
 *
 * @param id
 * @param data
 */
export function updateCategoryPart(id: number, data: object) {
  return request({
    url: `/mall-pms/api/v1/categories/${id}`,
    method: "patch",
    data: data,
  });
}
