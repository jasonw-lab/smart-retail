import { GoodsDetail, GoodsPageResult, GoodsQuery } from "./types";
import request from "@/utils/request";
import { AxiosPromise } from "axios";
import { UserPageVO } from "@/api/system/user";

const PMS_SPUS_BASE_URL = "/api/v1/pmsSpus";

const GoodsAPI = {
  /**
   * 获取商品分页列表
   *
   * @param queryParams
   */
  // export function getSpuPage(
  //   queryParams: GoodsQuery
  // ): AxiosPromise<GoodsPageResult> {
  //   return request({
  //     url: `${PMS_SPUS_BASE_URL}/page`,
  //     method: "get",
  //     params: queryParams,
  //   });
  // }

  getSpuPage(queryParams: GoodsQuery) {
    return request<any, GoodsPageResult>({
      url: `${PMS_SPUS_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },

  // /**
  //  * 获取商品详情
  //  *
  //  * @param id
  //  */
  // export function getSpuDetail(id: string): AxiosPromise<GoodsDetail> {
  //   return request({
  //     url: `${PMS_SPUS_BASE_URL}/${id}/detail`,
  //     method: "get",
  //   });
  // }
  //
  // /**
  //  * 添加商品
  //  *
  //  * @param data
  //  */
  // export function addSpu(data: object) {
  //   return request({
  //     url: `${PMS_SPUS_BASE_URL}`,
  //     method: "post",
  //     data: data,
  //   });
  // }
  //
  // /**
  //  * 修改商品
  //  *
  //  * @param id
  //  * @param data
  //  */
  // export function updateSpu(id: number, data: object) {
  //   return request({
  //     url: `${PMS_SPUS_BASE_URL}/${id}`,
  //     method: "put",
  //     data: data,
  //   });
  // }
  //
  // /**
  //  * 删除商品
  //  *
  //  * @param ids
  //  */
  // export function deleteSpu(ids: string) {
  //   return request({
  //     url: `${PMS_SPUS_BASE_URL}/${ids}`,
  //     method: "delete",
  //   });
  // }
};

export default GoodsAPI;
