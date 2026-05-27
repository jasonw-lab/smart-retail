500 Internal Server Error /**
 * WebSocket用短寿命チケットストア
 * 本番環境ではRedis等の分散キャッシュを使用
 */

interface TicketEntry {
  accessToken: string;
  expiresAt: number;
}

const ticketStore = new Map<string, TicketEntry>();

/**
 * チケットを保存
 */
export function storeTicket(ticket: string, accessToken: string, ttlSeconds: number = 30): void {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  ticketStore.set(ticket, { accessToken, expiresAt });

  // 古いチケットをクリーンアップ
  const now = Date.now();
  for (const [key, value] of ticketStore.entries()) {
    if (value.expiresAt < now) {
      ticketStore.delete(key);
    }
  }
}

/**
 * チケット検証用（ワンタイム使用）
 */
export function validateAndConsumeTicket(ticket: string): string | null {
  const entry = ticketStore.get(ticket);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    ticketStore.delete(ticket);
    return null;
  }

  // ワンタイム使用：検証後に削除
  ticketStore.delete(ticket);
  return entry.accessToken;
}
