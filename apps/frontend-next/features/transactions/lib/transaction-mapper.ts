import {
  PaymentMethod,
  type PaymentMethodType,
  type Transaction,
  type TransactionDetail,
  type TransactionPageResult,
  type TransactionQuery,
  type TransactionSummary,
  DEFAULT_PAYMENT_CONFIG,
} from '../types/transaction';

const backendToFrontendPaymentMethod: Record<string, PaymentMethodType> = {
  CARD: PaymentMethod.CARD,
  QR: PaymentMethod.QR,
  CASH: PaymentMethod.CASH,
  OTHER: PaymentMethod.OTHER,
};

/**
 * バックエンドの決済方法文字列を安全にフロントエンドの型にマッピング（フォールバック付き）
 */
export function mapBackendPaymentMethod(method?: string | null): PaymentMethodType {
  if (!method || typeof method !== 'string') {
    return DEFAULT_PAYMENT_CONFIG.method;
  }
  const normalized = method.toUpperCase();
  return backendToFrontendPaymentMethod[normalized] ?? DEFAULT_PAYMENT_CONFIG.method;
}

/**
 * バックエンドの日時が検索範囲内かを判定する
 * saleTimestamp は 'yyyy-MM-dd HH:mm:ss' または ISO形式を想定
 */
export function isSaleDateInRange(
  saleTimestamp?: string,
  startDate?: string,
  endDate?: string
): boolean {
  if (!startDate && !endDate) {
    return true;
  }
  if (!saleTimestamp || typeof saleTimestamp !== 'string') {
    return false;
  }
  const saleDate = saleTimestamp.slice(0, 10);
  if (startDate && saleDate < startDate) {
    return false;
  }
  if (endDate && saleDate > endDate) {
    return false;
  }
  return true;
}

/**
 * 単一の取引エンティティを多層防衛的に正規化マッピング
 */
export function mapTransactionItem(raw: unknown): Transaction {
  if (!raw || typeof raw !== 'object') {
    return {
      id: 0,
      orderNumber: '',
      storeId: 0,
      totalAmount: 0,
      paymentMethod: DEFAULT_PAYMENT_CONFIG.method,
      transactionTime: '',
      details: [],
    };
  }

  const item = raw as Record<string, unknown>;

  const id = Number(item.id ?? 0);
  const orderNumber = String(item.orderNumber ?? '');
  const storeId = Number(item.storeId ?? 0);
  const storeName = typeof item.storeName === 'string' ? item.storeName : undefined;
  const totalAmount = Number(item.totalAmount ?? 0);
  const paymentMethod = mapBackendPaymentMethod(
    typeof item.paymentMethod === 'string' ? item.paymentMethod : undefined
  );
  const paymentProvider =
    typeof item.paymentProvider === 'string' ? item.paymentProvider : undefined;
  const referenceId =
    typeof item.paymentReferenceId === 'string'
      ? item.paymentReferenceId
      : typeof item.referenceId === 'string'
        ? item.referenceId
        : undefined;
  const transactionTime =
    typeof item.saleTimestamp === 'string'
      ? item.saleTimestamp
      : typeof item.transactionTime === 'string'
        ? item.transactionTime
        : typeof item.createTime === 'string'
          ? item.createTime
          : '';

  const rawDetails = Array.isArray(item.details)
    ? item.details
    : Array.isArray(item.items)
      ? item.items
      : [];

  const details: TransactionDetail[] = rawDetails.map(
    (d: unknown, idx: number): TransactionDetail => {
      const detailObj = (d && typeof d === 'object' ? d : {}) as Record<string, unknown>;
      const quantity = Number(detailObj.quantity ?? 0);
      const unitPrice = Number(detailObj.unitPrice ?? 0);
      const subtotal = Number(detailObj.subtotal ?? quantity * unitPrice);

      return {
        id: Number(detailObj.id ?? idx + 1),
        productId: Number(detailObj.productId ?? 0),
        productName: String(detailObj.productName ?? ''),
        quantity,
        unitPrice,
        subtotal,
      };
    }
  );

  const createTime = typeof item.createTime === 'string' ? item.createTime : undefined;

  return {
    id,
    orderNumber,
    storeId,
    storeName,
    totalAmount,
    paymentMethod,
    paymentProvider,
    referenceId,
    transactionTime,
    details,
    createTime,
  };
}

/**
 * 取引リストからサマリ（合計金額、件数、決済種別比率）を算出
 */
export function calculateTransactionSummary(transactions: Transaction[]): TransactionSummary {
  const totalCount = transactions.length;
  const totalAmount = transactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  const methods: PaymentMethodType[] = [
    PaymentMethod.CARD,
    PaymentMethod.QR,
    PaymentMethod.CASH,
    PaymentMethod.OTHER,
  ];

  const byPaymentMethod = methods.map((method) => {
    const matching = transactions.filter((t) => t.paymentMethod === method);
    const amount = matching.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    const count = matching.length;
    const ratio = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return {
      method,
      amount,
      count,
      ratio,
    };
  });

  return {
    totalAmount,
    totalCount,
    byPaymentMethod,
  };
}

/**
 * バックエンド API（List<Sales> または { list, total }）のレスポンスを安全に解釈し、
 * クライアント/SSR 側の防衛的フィルタリングとページネーションスライスを適用する
 */
export function aggregateTransactions(
  items: unknown,
  query?: TransactionQuery
): TransactionPageResult {
  if (!items) {
    return {
      list: [],
      total: 0,
      summary: calculateTransactionSummary([]),
    };
  }

  let rawList: unknown[] = [];
  let serverTotal: number | undefined;
  let serverSummary: TransactionSummary | undefined;

  if (Array.isArray(items)) {
    rawList = items;
  } else if (typeof items === 'object') {
    const obj = items as Record<string, unknown>;
    if (Array.isArray(obj.list)) {
      rawList = obj.list;
    }
    if (typeof obj.total === 'number') {
      serverTotal = obj.total;
    }
    if (obj.summary && typeof obj.summary === 'object') {
      serverSummary = obj.summary as TransactionSummary;
    }
  }

  let list: Transaction[] = rawList.map(mapTransactionItem);

  // サーバーが既にページング済みで全件ではない場合（serverTotal が rawList.length より大きい）
  // は、クライアントフィルタによる意図しない全除外や二重スライスを避ける
  const isServerPaginated =
    serverTotal !== undefined && serverTotal > rawList.length;

  if (!isServerPaginated) {
    // クライアント/SSR 側防衛フィルタリング
    if (query) {
      if (
        query.storeId !== undefined &&
        query.storeId !== null &&
        !Number.isNaN(Number(query.storeId)) &&
        Number(query.storeId) !== 0
      ) {
        const targetStoreId = Number(query.storeId);
        list = list.filter((item) => item.storeId === targetStoreId);
      }
      if (query.paymentMethod) {
        list = list.filter((item) => item.paymentMethod === query.paymentMethod);
      }
      if (query.orderNumber && query.orderNumber.trim() !== '') {
        const keyword = query.orderNumber.trim().toLowerCase();
        list = list.filter((item) => item.orderNumber.toLowerCase().includes(keyword));
      }
      if (query.startDate || query.endDate) {
        list = list.filter((item) =>
          isSaleDateInRange(item.transactionTime, query.startDate, query.endDate)
        );
      }
    }

    const total = list.length;
    const summary = serverSummary ?? calculateTransactionSummary(list);

    // ページネーションスライス
    if (query?.pageNum && query?.pageSize) {
      const start = (query.pageNum - 1) * query.pageSize;
      list = list.slice(start, start + query.pageSize);
    }

    return { list, total, summary };
  }

  // サーバー側で既にページングされている場合
  const total = serverTotal ?? list.length;
  const summary = serverSummary ?? calculateTransactionSummary(list);
  return { list, total, summary };
}
