import request from "@/utils/request";

const DEVICE_BASE_URL = "/api/v1/retail/devices";

export interface Device {
  id: number;
  storeId: number;
  deviceCode: string;
  deviceType: string;
  deviceName: string;
  status: string;
  lastHeartbeat: string | null;
  errorCode: string | null;
  metadata: string | null;
  createTime: string;
  updateTime: string;
}

export interface DeviceForm {
  storeId: number;
  deviceCode?: string;
  deviceType: string;
  deviceName: string;
  status?: string;
  lastHeartbeat?: string;
  errorCode?: string;
  metadata?: string;
}

export interface DevicePageVO {
  id: number;
  storeId: number;
  storeName: string;
  deviceCode: string;
  deviceType: string;
  deviceName: string;
  status: string;
  lastHeartbeat: string | null;
  errorCode: string | null;
  metadata: string | null;
  createTime: string;
  updateTime: string;
}

export interface DeviceListData {
  list: DevicePageVO[];
  total: number;
}

export interface DeviceListParams {
  pageNum: number;
  pageSize: number;
  storeId?: number;
  deviceType?: string;
  status?: string;
  deviceName?: string;
  deviceCode?: string;
}

// デバイスタイプ定義
export const DEVICE_TYPE_OPTIONS = [
  { value: "PAYMENT_TERMINAL", label: "決済端末", icon: "credit-card" },
  { value: "CAMERA", label: "カメラ", icon: "camera" },
  { value: "GATE", label: "ゲート", icon: "door" },
  { value: "REFRIGERATOR_SENSOR", label: "冷蔵庫センサー", icon: "thermometer" },
  { value: "PRINTER", label: "プリンター", icon: "printer" },
  { value: "NETWORK_ROUTER", label: "ネットワーク機器", icon: "globe" },
];

// デバイスステータス定義
export const DEVICE_STATUS_OPTIONS = [
  { value: "ONLINE", label: "オンライン", type: "success" },
  { value: "OFFLINE", label: "オフライン", type: "danger" },
  { value: "ERROR", label: "エラー", type: "warning" },
  { value: "MAINTENANCE", label: "メンテナンス", type: "info" },
];

const DeviceAPI = {
  /** デバイス一覧を取得（ページング） - クライアントサイドページング */
  async getPage(params: DeviceListParams): Promise<DeviceListData> {
    const allDevices = await request<any, Device[]>({
      url: `${DEVICE_BASE_URL}`,
      method: "get",
      params: { storeId: params.storeId },
    });

    // フィルタリング
    let filtered = (allDevices || []) as DevicePageVO[];
    if (params.deviceType) {
      filtered = filtered.filter((d) => d.deviceType === params.deviceType);
    }
    if (params.status) {
      filtered = filtered.filter((d) => d.status === params.status);
    }
    if (params.deviceName) {
      filtered = filtered.filter((d) =>
        d.deviceName?.toLowerCase().includes(params.deviceName!.toLowerCase())
      );
    }
    if (params.deviceCode) {
      filtered = filtered.filter((d) =>
        d.deviceCode?.toLowerCase().includes(params.deviceCode!.toLowerCase())
      );
    }

    // ページング
    const total = filtered.length;
    const start = (params.pageNum - 1) * params.pageSize;
    const end = start + params.pageSize;
    const list = filtered.slice(start, end);

    return { list, total };
  },

  /** デバイス一覧を取得（全件） */
  getList(storeId?: number) {
    return request<any, Device[]>({
      url: `${DEVICE_BASE_URL}`,
      method: "get",
      params: storeId ? { storeId } : undefined,
    });
  },

  /** 店舗別デバイス一覧を取得 */
  getListByStoreId(storeId: number) {
    return request<any, Device[]>({
      url: `${DEVICE_BASE_URL}`,
      method: "get",
      params: { storeId },
    });
  },

  /** デバイス詳細を取得 */
  getDetail(id: number) {
    return request<any, Device>({
      url: `${DEVICE_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /** デバイスを新規作成 */
  create(data: DeviceForm) {
    return request({
      url: `${DEVICE_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /** デバイスを更新 */
  update(id: number, data: DeviceForm) {
    return request({
      url: `${DEVICE_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /** デバイスを削除 */
  delete(id: number) {
    return request({
      url: `${DEVICE_BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default DeviceAPI;
