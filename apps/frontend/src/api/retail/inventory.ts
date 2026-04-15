import request from "@/utils/request";

const INVENTORY_BASE_URL = "/api/v1/retail/inventories";
const TRANSACTION_BASE_URL = "/api/v1/retail/inventory-transactions";

/** 在庫状態コード */
export type InventoryStatusCode = "EXPIRED" | "LOW_STOCK" | "EXPIRY_SOON" | "HIGH_STOCK" | "NORMAL";

/** 在庫ページングVO */
export interface InventoryPageVO {
  id: number;
  storeId: number;
  storeName: string;
  productId: number;
  productName: string;
  productCode: string;
  lotNumber: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  expiryDate: string;
  location: string;
  status: InventoryStatusCode;
  statusLabel: string;
  statusColor: string;
  hasExpiredLot: boolean;
  daysUntilExpiry: number | null;
  lastCountDate: string;
  remarks: string;
  createTime: string;
  updateTime: string;
}

/** 在庫一覧レスポンス */
export interface InventoryListData {
  list: InventoryPageVO[];
  total: number;
}

/** 在庫検索パラメータ */
export interface InventoryPageQuery {
  pageNum: number;
  pageSize: number;
  storeId?: number;
  productId?: number;
  productName?: string;
  lotNumber?: string;
  status?: InventoryStatusCode | "";
  expiryDateStart?: string;
  expiryDateEnd?: string;
  location?: string;
  expiredOnly?: boolean;
}

/** 在庫フォーム */
export interface InventoryForm {
  storeId: number;
  productId: number;
  lotNumber: string;
  quantity: number;
  minStock?: number;
  maxStock?: number;
  expiryDate?: string;
  location?: string;
  status?: string;
  remarks?: string;
}

/** 廃棄フォーム（v1.1対応） */
export interface DiscardForm {
  quantity: number;
  reason: string;
  remarks?: string;
}

/** 入出庫履歴VO */
export interface InventoryTransactionVO {
  id: number;
  storeId: number;
  storeName: string;
  productId: number;
  productName: string;
  lotNumber: string;
  transactionType: string;
  quantity: number;
  transactionDate: string;
  expiryDate: string;
  status: string;
  reason: string;
  referenceNo: string;
  sourceDest: string;
  operator: string;
  remarks: string;
  createTime: string;
}

/** 入出庫履歴一覧レスポンス */
export interface TransactionListData {
  list: InventoryTransactionVO[];
  total: number;
}

/** 入出庫履歴検索パラメータ */
export interface TransactionPageQuery {
  pageNum: number;
  pageSize: number;
  storeId?: number;
  productId?: number;
  lotNumber?: string;
  transactionType?: string;
}

/** 在庫状態オプション */
export const INVENTORY_STATUS_OPTIONS = [
  { value: "", label: "すべて" },
  { value: "EXPIRED", label: "期限切れ", color: "#F56C6C" },
  { value: "LOW_STOCK", label: "在庫切れ", color: "#F56C6C" },
  { value: "EXPIRY_SOON", label: "期限接近", color: "#E6A23C" },
  { value: "HIGH_STOCK", label: "在庫過多", color: "#E6A23C" },
  { value: "NORMAL", label: "正常", color: "#67C23A" },
];

/** 廃棄理由オプション */
export const DISCARD_REASON_OPTIONS = [
  { value: "期限切れ", label: "期限切れ" },
  { value: "破損", label: "破損" },
  { value: "品質不良", label: "品質不良" },
  { value: "棚卸差異", label: "棚卸差異" },
  { value: "その他", label: "その他" },
];

const InventoryAPI = {
  /** 在庫一覧を取得（ページング） */
  getPage(params: InventoryPageQuery) {
    return request<any, InventoryListData>({
      url: `${INVENTORY_BASE_URL}/page`,
      method: "get",
      params,
    });
  },

  /** 在庫詳細を取得 */
  getDetail(id: number) {
    return request<any, InventoryPageVO>({
      url: `${INVENTORY_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /** 在庫を新規作成 */
  create(data: InventoryForm) {
    return request({
      url: `${INVENTORY_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /** 在庫を更新 */
  update(id: number, data: InventoryForm) {
    return request({
      url: `${INVENTORY_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /** 在庫を削除 */
  delete(id: number) {
    return request({
      url: `${INVENTORY_BASE_URL}/${id}`,
      method: "delete",
    });
  },

  /** 在庫廃棄（v1.1対応） */
  discard(id: number, data: DiscardForm) {
    return request({
      url: `${INVENTORY_BASE_URL}/${id}/discard`,
      method: "post",
      data,
    });
  },
};

const InventoryTransactionAPI = {
  /** 入出庫履歴一覧を取得（ページング） */
  getPage(params: TransactionPageQuery) {
    return request<any, TransactionListData>({
      url: `${TRANSACTION_BASE_URL}/page`,
      method: "get",
      params,
    });
  },

  /** 入庫履歴一覧を取得（ページング） */
  getInboundPage(params: TransactionPageQuery) {
    return request<any, TransactionListData>({
      url: `${TRANSACTION_BASE_URL}/inbound/page`,
      method: "get",
      params,
    });
  },

  /** 出庫履歴一覧を取得（ページング） */
  getOutboundPage(params: TransactionPageQuery) {
    return request<any, TransactionListData>({
      url: `${TRANSACTION_BASE_URL}/outbound/page`,
      method: "get",
      params,
    });
  },
};

export { InventoryAPI, InventoryTransactionAPI };
export default InventoryAPI;
