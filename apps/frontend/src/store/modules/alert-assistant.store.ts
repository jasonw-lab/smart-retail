import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import type { AlertAssistantResponse } from "@/api/retail/ai";

const DEFAULT_QUESTION = "今日対応すべき優先アラートは？";

export const useAlertAssistantStore = defineStore("alertAssistant", () => {
  const question = useStorage("alertAssistant.question", DEFAULT_QUESTION);
  const selectedLlm = useStorage("alertAssistant.selectedLlm", "kimi");
  const response = useStorage<AlertAssistantResponse | null>("alertAssistant.response", null);

  function reset() {
    question.value = DEFAULT_QUESTION;
    selectedLlm.value = "kimi";
    response.value = null;
  }

  return {
    question,
    selectedLlm,
    response,
    reset,
  };
});

export function useAlertAssistantStoreHook() {
  return useAlertAssistantStore();
}
