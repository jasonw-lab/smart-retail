import request from "@/utils/request";
import type { AlertPageVO } from "@/api/retail/alert";

const AI_BASE_URL = "/api/v1/retail/ai/alerts/priority";

export interface AlertAssistantResponse {
  summary: string;
  alerts: AlertPageVO[];
  llmUsed: boolean;
  llmModel: string;
  fallback: boolean;
}

export const AIAPI = {
  /**
   * AIに優先アラートを問い合わせる
   * @param message 質問メッセージ
   * @param llm 使用するLLMプロバイダー（kimi / gemini）
   * @returns AIの要約と優先アラート一覧
   */
  async getPriorityAlerts(message: string, llm: string = "kimi"): Promise<AlertAssistantResponse> {
    return request<any, AlertAssistantResponse>({
      url: `${AI_BASE_URL}`,
      method: "post",
      data: { message, llm },
    });
  },
};

export default AIAPI;
