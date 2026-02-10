import request from "@/utils/request";

const ALERT_BASE_URL = "/api/v1/retail/alerts";

/** アラートタイプ */
export type AlertType = "LOW_STOCK" | "EXPIRY_SOON" | "HIGH_STOCK" | "COMMUNICATION_DOWN" | "PAYMENT_TERMINAL_DOWN";

/** 優先度 */
export type AlertPriority = "P1" | "P2" | "P3" | "P4";

/** ステータス */
export type AlertStatus = "NEW" | "ACK" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

/** アラートページングVO */
export interface AlertPageVO {
  id: number;
  storeId: number;
  storeName: string;
  productId?: number;
  productName?: string;
  productCode?: string;
  lotNumber?: string;
  alertType: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  message: string;
  thresholdValue?: string;
  currentValue?: string;
  detectedAt: string;
  createTime: string;
  updateTime: string;
}

/** アラート詳細VO */
export interface AlertVO extends AlertPageVO {
  deviceId?: number;
  deviceName?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  resolutionNote?: string;
}

/** アラート状態更新フォーム */
export interface AlertStatusForm {
  status: AlertStatus;
  resolutionNote?: string;
}

/** アラート一覧レスポンス */
export interface AlertListData {
  list: AlertPageVO[];
  total: number;
}

/** アラート一覧パラメータ */
export interface AlertListParams {
  pageNum: number;
  pageSize: number;
  storeId?: number;
  productId?: number;
  lotNumber?: string;
  alertType?: AlertType;
  priority?: AlertPriority;
  status?: AlertStatus;
  detectedAtStart?: string;
  detectedAtEnd?: string;
}

const AlertAPI = {
  /** アラート一覧を取得（ページング） */
  getPage(params: AlertListParams) {
    return request<any, AlertListData>({
      url: `${ALERT_BASE_URL}/page`,
      method: "get",
      params,
    });
  },

  /** アラート詳細を取得 */
  getDetail(id: number) {
    return request<any, AlertVO>({
      url: `${ALERT_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /** アラート状態を更新 */
  updateStatus(id: number, data: AlertStatusForm) {
    return request({
      url: `${ALERT_BASE_URL}/${id}/status`,
      method: "put",
      data,
    });
  },

  /** アラートを削除 */
  delete(id: number) {
    return request({
      url: `${ALERT_BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default AlertAPI;
