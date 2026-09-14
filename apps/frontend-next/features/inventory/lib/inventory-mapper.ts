import {
  InventoryStatus,
  StockHistoryType,
  type Inventory,
  type InventoryLot,
  type InventoryPageItem,
  type InventoryPageResult,
  type InventoryQuery,
  type InventoryStatusType,
  type InventoryTransaction,
  type StockHistory,
  type StockHistoryTypeType,
} from '../types/inventory';

const backendToFrontendStatus: Record<string, InventoryStatusType> = {
  EXPIRED: InventoryStatus.EXPIRED,
  EXPIRY_SOON: InventoryStatus.EXPIRING,
  LOW_STOCK: InventoryStatus.OUT_OF_STOCK,
  HIGH_STOCK: InventoryStatus.OVERSTOCK,
  NORMAL: InventoryStatus.NORMAL,
};

const statusSeverity: Record<InventoryStatusType, number> = {
  [InventoryStatus.EXPIRED]: 4,
  [InventoryStatus.OUT_OF_STOCK]: 3,
  [InventoryStatus.EXPIRING]: 2,
  [InventoryStatus.OVERSTOCK]: 1,
  [InventoryStatus.NORMAL]: 0,
};

export function mapBackendStatus(status: string): InventoryStatusType {
  return backendToFrontendStatus[status] || InventoryStatus.NORMAL;
}

function createLot(item: InventoryPageItem): InventoryLot {
  return {
    id: item.id,
    lotNumber: item.lotNumber,
    quantity: item.quantity,
    expiryDate: item.expiryDate,
  };
}

export function mapInventoryItemToAggregate(item: InventoryPageItem): Inventory {
  // Backendが既に集約形式（lotsを持つ）で返している場合はそのまま利用する
  const aggregateInput = item as Partial<Inventory>;
  if (aggregateInput.lots && aggregateInput.lots.length > 0) {
    return {
      id: item.id,
      storeId: item.storeId,
      storeName: item.storeName,
      productId: item.productId,
      productCode: item.productCode,
      productName: item.productName,
      totalQuantity: aggregateInput.totalQuantity ?? item.quantity,
      reorderPoint: aggregateInput.reorderPoint ?? item.minStock,
      upperLimit: aggregateInput.upperLimit ?? item.maxStock,
      oldestExpiryDate: aggregateInput.oldestExpiryDate ?? item.expiryDate,
      status: mapBackendStatus(item.status),
      lots: aggregateInput.lots,
      turnoverRate: aggregateInput.turnoverRate ?? item.turnoverRate,
      createTime: item.createTime,
      updateTime: item.updateTime,
    };
  }

  return {
    id: item.id,
    storeId: item.storeId,
    storeName: item.storeName,
    productId: item.productId,
    productCode: item.productCode,
    productName: item.productName,
    totalQuantity: item.quantity,
    reorderPoint: item.minStock,
    upperLimit: item.maxStock,
    oldestExpiryDate: item.expiryDate,
    status: mapBackendStatus(item.status),
    lots: [createLot(item)],
    turnoverRate: item.turnoverRate,
    createTime: item.createTime,
    updateTime: item.updateTime,
  };
}

export function aggregateInventoryItems(
  items: InventoryPageItem[],
  query?: InventoryQuery
): InventoryPageResult {
  if (!items || items.length === 0) {
    return { list: [], total: 0 };
  }

  let list: Inventory[];

  // Backendが既に集約形式（lotsを持つ）で返している場合はそのままマッピング
  const first = items[0] as Partial<Inventory>;
  if (first.lots && first.lots.length > 0) {
    list = items.map((item) => mapInventoryItemToAggregate(item));
  } else {
    const groups = new Map<string, Inventory>();

    for (const item of items) {
      const key = `${item.storeId}-${item.productId}`;
      const existing = groups.get(key);
      const lot = createLot(item);

      if (!existing) {
        groups.set(key, mapInventoryItemToAggregate(item));
      } else {
        existing.totalQuantity += item.quantity;
        existing.lots = existing.lots ?? [];
        existing.lots.push(lot);

        if (
          item.expiryDate &&
          (!existing.oldestExpiryDate || item.expiryDate < existing.oldestExpiryDate)
        ) {
          existing.oldestExpiryDate = item.expiryDate;
        }

        const itemStatus = mapBackendStatus(item.status);
        if (statusSeverity[itemStatus] > statusSeverity[existing.status]) {
          existing.status = itemStatus;
        }
      }
    }

    list = Array.from(groups.values());
  }

  // クライアント/SSR側フィルタリング（バックエンドが全ロットを返却した場合の防衛的処理）
  if (query) {
    if (query.storeId && !Number.isNaN(query.storeId)) {
      list = list.filter((item) => item.storeId === query.storeId);
    }
    if (query.productName && query.productName.trim() !== '') {
      const keyword = query.productName.trim().toLowerCase();
      list = list.filter((item) => item.productName.toLowerCase().includes(keyword));
    }
    if (query.status) {
      list = list.filter((item) => item.status === query.status);
    }
  }

  const total = list.length;

  if (query?.pageNum && query?.pageSize) {
    const start = (query.pageNum - 1) * query.pageSize;
    list = list.slice(start, start + query.pageSize);
  }

  return { list, total };
}

export function mapTransactionToHistory(transaction: InventoryTransaction): StockHistory {
  let type: StockHistoryTypeType;

  switch (transaction.txnType) {
    case 'INBOUND':
    case 'TRANSFER_IN':
      type = StockHistoryType.IN;
      break;
    case 'DISPOSAL':
      type = StockHistoryType.DISPOSE;
      break;
    case 'SALE':
      type = StockHistoryType.SALE;
      break;
    case 'TRANSFER_OUT':
      type = StockHistoryType.OUT;
      break;
    case 'ADJUSTMENT':
      type = transaction.quantityDelta >= 0 ? StockHistoryType.IN : StockHistoryType.OUT;
      break;
    default:
      type = transaction.quantityDelta >= 0 ? StockHistoryType.IN : StockHistoryType.OUT;
  }

  return {
    id: transaction.id,
    type,
    quantity: Math.abs(transaction.quantityDelta),
    lotNumber: transaction.lotNumber,
    note: transaction.note || transaction.referenceNo,
    createdAt: transaction.createTime || '',
  };
}
