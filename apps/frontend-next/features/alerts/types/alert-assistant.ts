/**
 * AI アラート優先度要約リクエスト
 */
export interface AlertAssistantReq {
  /** 対象店舗ID（省略時は全店舗） */
  storeId?: number;
  /** 要約対象のアラートIDリスト（省略時は当日全アラート） */
  alertIds?: string[];
  /** 追加コンテキスト */
  context?: string;
}

/**
 * AI アラート優先度要約レスポンス
 */
export interface AlertAssistantVO {
  /** 優先度順にソートされたアラートIDリスト */
  prioritizedAlertIds: string[];
  /** アラート要約 */
  summary: string;
  /** 推奨アクション */
  recommendedActions?: string[];
  /** 生成時刻 */
  generatedAt?: string;
}
