import { BrandForm, Brand, BrandPageResult, BrandQuery } from "./types";
import request from "@/utils/request";
import { AxiosPromise } from "axios";

const PMS_BRAND_BASE_URL = "/api/v1/brands";

const BrandAPI = {
  /**
   * Retrieves a paginated list of brands.
   *
   * This function sends a GET request to fetch a paginated list of brands based on the provided query parameters.
   *
   * @param queryParams - An object of type BrandQuery containing the query parameters for pagination and filtering.
   * @returns A promise that resolves to an AxiosResponse containing a BrandPageResult object.
   *          The BrandPageResult likely includes the list of brands and pagination information.
   */
  getBrandPage(queryParams: BrandQuery): AxiosPromise<BrandPageResult> {
    return request({
      url: `${PMS_BRAND_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 获取品牌列表
   *
   * @param queryParams
   */
  getBrandList(queryParams?: BrandQuery): AxiosPromise<Brand[]> {
    return request({
      url: PMS_BRAND_BASE_URL,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 获取品牌详情
   *
   * @param id
   */
  getBrandFormDetail(id: number): AxiosPromise<BrandForm> {
    return request({
      url: `${PMS_BRAND_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /**
   * 添加品牌
   *
   * @param data
   */
  addBrand(data: BrandForm) {
    return request({
      url: PMS_BRAND_BASE_URL,
      method: "post",
      data: data,
    });
  },

  /**
   * 修改品牌
   *
   * @param id
   * @param data
   */
  updateBrand(id: number, data: BrandForm) {
    return request({
      url: `${PMS_BRAND_BASE_URL}/${id}`,
      method: "put",
      data: data,
    });
  },

  /**
   * 删除品牌
   *
   * @param ids
   */
  deleteBrands(ids: string) {
    return request({
      url: `${PMS_BRAND_BASE_URL}/${ids}`,
      method: "delete",
    });
  },
};

export default BrandAPI;
