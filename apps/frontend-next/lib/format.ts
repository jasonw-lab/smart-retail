/**
 * フォーマットユーティリティ
 */

/**
 * 金額をフォーマット
 */
export function formatCurrency(value: number): string {
  return `¥${value.toLocaleString('ja-JP')}`;
}

/**
 * 相対時刻を表示
 * - 60分未満: N分前
 * - 本日中: N時間前
 * - 前日: 昨日 HH:MM
 * - 2日以上前: MM/DD HH:MM
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - target.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  // 今日かどうか
  const isToday =
    target.getDate() === now.getDate() &&
    target.getMonth() === now.getMonth() &&
    target.getFullYear() === now.getFullYear();

  // 昨日かどうか
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    target.getDate() === yesterday.getDate() &&
    target.getMonth() === yesterday.getMonth() &&
    target.getFullYear() === yesterday.getFullYear();

  if (diffMinutes < 1) {
    return 'たった今';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分前`;
  } else if (isToday) {
    return `${diffHours}時間前`;
  } else if (isYesterday) {
    return `昨日 ${formatTime(target)}`;
  } else {
    return formatDateShort(target);
  }
}

/**
 * 日時を MM/DD HH:MM 形式でフォーマット
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${month}/${day} ${formatTime(d)}`;
}

/**
 * 時刻を HH:MM 形式でフォーマット
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 日付を YYYY-MM-DD 形式でフォーマット
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 日時を YYYY-MM-DD HH:MM:SS 形式でフォーマット
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${formatDate(d)} ${formatTime(d)}:${seconds}`;
}

/**
 * パーセント表示
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 増減率表示 (+15.5% / -3.2%)
 */
export function formatChangeRate(value: number): string {
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${(value * 100).toFixed(1)}%`;
}
