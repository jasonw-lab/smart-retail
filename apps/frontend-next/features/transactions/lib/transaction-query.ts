import { formatDate } from '@/lib/format';
import type { TransactionQuery } from '../types/transaction';

/**
 * 期間プリセットを startDate / endDate（YYYY-MM-DD）に変換する
 */
export function getDateRangeFromPeriod(
  period?: string
): { startDate?: string; endDate?: string } {
  const today = new Date();

  switch (period) {
    case 'today': {
      const date = formatDate(today);
      return { startDate: date, endDate: date };
    }
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const date = formatDate(yesterday);
      return { startDate: date, endDate: date };
    }
    case '7days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return { startDate: formatDate(start), endDate: formatDate(today) };
    }
    case '30days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      return { startDate: formatDate(start), endDate: formatDate(today) };
    }
    default:
      return {};
  }
}

/**
 * UI 用クエリ（period を含む）を API 送信用クエリ（startDate / endDate を含む）に変換する
 */
export function buildTransactionQuery(params: TransactionQuery): TransactionQuery {
  const { startDate, endDate } = getDateRangeFromPeriod(params.period);

  return {
    pageNum: params.pageNum,
    pageSize: params.pageSize,
    ...(params.orderNumber ? { orderNumber: params.orderNumber } : {}),
    ...(params.storeId ? { storeId: params.storeId } : {}),
    ...(params.paymentMethod ? { paymentMethod: params.paymentMethod } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  };
}
