import request from "@/utils/request";

const ALERT_BASE_URL = "/api/v1/retail/alerts";

/** アラートタイプ */
export type AlertType =
  | "LOW_STOCK"
  | "EXPIRY_SOON"
  | "HIGH_STOCK"
  | "COMMUNICATION_DOWN"
  | "PAYMENT_TERMINAL_DOWN";

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
  /** アラート一覧を取得（ページング） - クライアントサイドページング */
  async getPage(params: AlertListParams): Promise<AlertListData> {
    const allAlerts = await request<any, AlertPageVO[]>({
      url: `${ALERT_BASE_URL}`,
      method: "get",
      params: {
        storeId: params.storeId,
        status: params.status,
      },
    });

    // フィルタリング
    let filtered = allAlerts || [];
    if (params.alertType) {
      filtered = filtered.filter((a) => a.alertType === params.alertType);
    }
    if (params.priority) {
      filtered = filtered.filter((a) => a.priority === params.priority);
    }
    if (params.productId) {
      filtered = filtered.filter((a) => a.productId === params.productId);
    }
    if (params.lotNumber) {
      filtered = filtered.filter((a) =>
        a.lotNumber?.toLowerCase().includes(params.lotNumber!.toLowerCase())
      );
    }

    // ページング
    const total = filtered.length;
    const start = (params.pageNum - 1) * params.pageSize;
    const end = start + params.pageSize;
    const list = filtered.slice(start, end);

    return { list, total };
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
      method: "patch",
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
