<template>
  <div class="alert-assistant-container">
    <el-card shadow="never" class="input-card">
      <div class="input-wrapper">
        <el-input
          v-model="question"
          type="textarea"
          :rows="2"
          placeholder="AIに聞きたい内容を入力してください"
          resize="none"
        />
        <el-button type="primary" :loading="loading" @click="handleAsk">AIに聞く</el-button>
      </div>
    </el-card>

    <el-skeleton v-if="loading" :rows="6" animated />

    <template v-if="response && !loading">
      <el-card shadow="never" class="summary-card">
        <template #header>
          <div class="summary-header">
            <span>AI回答</span>
            <div class="summary-badges">
              <el-tag v-if="response.llmUsed" type="success" size="small">
                {{ response.llmModel }}
              </el-tag>
              <el-tag v-else type="info" size="small">ルールベース</el-tag>
              <el-tag v-if="response.fallback" type="warning" size="small">フォールバック</el-tag>
            </div>
          </div>
        </template>
        <el-alert
          v-if="response.fallback"
          title="AIサービスが利用できないため、ルールベースで結果を表示しています。"
          type="warning"
          :closable="false"
          show-icon
          class="fallback-alert"
        />
        <div class="summary-body">{{ response.summary }}</div>
      </el-card>

      <el-card shadow="never" class="table-card">
        <template #header>
          <span>優先アラート一覧（{{ response.alerts.length }}件）</span>
        </template>
        <el-table :data="response.alerts" border style="width: 100%">
          <el-table-column label="優先度" width="80" prop="priority">
            <template #default="{ row }">
              <el-tag :type="getPriorityType(row.priority)" size="small">
                {{ row.priority }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="種別" width="120" prop="alertType">
            <template #default="{ row }">
              {{ getAlertTypeLabel(row.alertType) }}
            </template>
          </el-table-column>
          <el-table-column label="店舗" width="140" prop="storeName" />
          <el-table-column label="概要" min-width="200">
            <template #default="{ row }">
              {{ row.productName || row.message }}
            </template>
          </el-table-column>
          <el-table-column label="検知日時" width="160" prop="detectedAt">
            <template #default="{ row }">
              {{ formatAbsoluteDateTime(row.detectedAt) }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import AIAPI, { type AlertAssistantResponse } from "@/api/retail/ai";
import type { AlertType, AlertPriority } from "@/api/retail/alert";

const DEFAULT_QUESTION = "今日対応すべき優先アラートは？";

const question = ref(DEFAULT_QUESTION);
const loading = ref(false);
const response = ref<AlertAssistantResponse | null>(null);

const ALERT_TYPE_OPTIONS = [
  { value: "LOW_STOCK", label: "在庫切れ" },
  { value: "EXPIRY_SOON", label: "期限接近" },
  { value: "HIGH_STOCK", label: "在庫過多" },
  { value: "COMMUNICATION_DOWN", label: "通信異常" },
  { value: "PAYMENT_TERMINAL_DOWN", label: "決済端末異常" },
];

const getPriorityType = (priority?: AlertPriority) => {
  switch (priority) {
    case "P1":
      return "danger";
    case "P2":
      return "warning";
    case "P3":
    case "P4":
      return "info";
    default:
      return "info";
  }
};

const getAlertTypeLabel = (alertType?: AlertType) => {
  const option = ALERT_TYPE_OPTIONS.find((item) => item.value === alertType);
  return option?.label || "不明";
};

const formatAbsoluteDateTime = (dateTime?: string) => {
  if (!dateTime) return "";
  const date = new Date(dateTime);
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const handleAsk = async () => {
  if (question.value.trim() !== DEFAULT_QUESTION) {
    ElMessage.error("固定の質問文のみ送信できます");
    return;
  }

  loading.value = true;
  response.value = null;

  try {
    response.value = await AIAPI.getPriorityAlerts(question.value.trim());
  } catch (error) {
    console.error("AI問い合わせエラー", error);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.alert-assistant-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.input-card {
  .input-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 12px;

    .el-input {
      flex: 1;
    }

    .el-button {
      flex-shrink: 0;
      margin-top: 0;
    }
  }
}

.summary-card {
  .summary-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .summary-badges {
    display: flex;
    gap: 8px;
  }

  .fallback-alert {
    margin-bottom: 12px;
  }

  .summary-body {
    white-space: pre-wrap;
    line-height: 1.6;
  }
}

.table-card {
  .el-card__header {
    font-weight: 600;
  }
}
</style>
