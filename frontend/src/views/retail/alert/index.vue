<template>
  <div class="alert-container">
    <!-- 検索フォーム -->
    <el-card shadow="never" class="mb-4">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="優先度" prop="priority">
          <el-select
            v-model="queryParams.priority"
            placeholder="すべて"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="option in PRIORITY_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状態" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="すべて"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="option in STATUS_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="種別" prop="alertType">
          <el-select
            v-model="queryParams.alertType"
            placeholder="すべて"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="option in ALERT_TYPE_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="店舗" prop="storeId">
          <el-select
            v-model="queryParams.storeId"
            placeholder="すべて"
            clearable
            filterable
            style="width: 180px"
          >
            <el-option
              v-for="store in storeList"
              :key="store.id"
              :label="store.storeName"
              :value="store.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">検索</el-button>
          <el-button @click="resetQuery">リセット</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- アラート一覧 -->
    <el-card shadow="never">
      <template #header>
        <div class="flex-x-between">
          <span>アラート一覧</span>
          <span class="total-text">全{{ total }}件</span>
        </div>
      </template>

      <div v-loading="loading" class="alert-list">
        <div v-if="alertList.length === 0 && !loading" class="empty-state">
          <el-empty description="アラートはありません" />
        </div>

        <div
          v-for="alert in alertList"
          :key="alert.id"
          class="alert-card"
          :class="getPriorityClass(alert.priority)"
        >
          <div class="alert-header">
            <div class="alert-badges">
              <el-tag :type="getPriorityType(alert.priority)" size="small">
                {{ alert.priority }}
              </el-tag>
              <el-tag type="info" size="small" class="ml-2">
                {{ getAlertTypeLabel(alert.alertType) }}
              </el-tag>
              <el-tag :type="getStatusType(alert.status)" size="small" class="ml-2">
                {{ getStatusLabel(alert.status) }}
              </el-tag>
            </div>
          </div>

          <div class="alert-body">
            <div class="alert-info">
              <div class="info-row">
                <span class="label">店舗:</span>
                <span class="value">{{ alert.storeName }}</span>
                <span v-if="alert.productName" class="label ml-4">商品:</span>
                <span v-if="alert.productName" class="value">{{ alert.productName }}</span>
              </div>
              <div v-if="alert.lotNumber" class="info-row">
                <span class="label">ロット:</span>
                <span class="value">{{ alert.lotNumber }}</span>
              </div>
              <div v-if="alert.currentValue || alert.thresholdValue" class="info-row">
                <span v-if="alert.currentValue" class="label">現在値:</span>
                <span v-if="alert.currentValue" class="value">{{ alert.currentValue }}</span>
                <span v-if="alert.thresholdValue" class="label ml-4">しきい値:</span>
                <span v-if="alert.thresholdValue" class="value">{{ alert.thresholdValue }}</span>
              </div>
              <div class="info-row">
                <span class="label">検知日時:</span>
                <span class="value">{{ formatDateTime(alert.detectedAt) }}</span>
              </div>
            </div>
          </div>

          <div class="alert-footer">
            <div class="action-buttons">
              <!-- NEW状態: 確認する、対応開始 -->
              <template v-if="alert.status === 'NEW'">
                <el-button size="small" @click="handleAcknowledge(alert)">確認する</el-button>
                <el-button size="small" type="primary" @click="handleStartProgress(alert)">
                  対応開始
                </el-button>
              </template>

              <!-- ACK状態: 対応開始 -->
              <template v-else-if="alert.status === 'ACK'">
                <el-button size="small" type="primary" @click="handleStartProgress(alert)">
                  対応開始
                </el-button>
              </template>

              <!-- IN_PROGRESS状態: 完了 -->
              <template v-else-if="alert.status === 'IN_PROGRESS'">
                <el-button size="small" type="success" @click="handleResolve(alert)">完了</el-button>
              </template>

              <!-- RESOLVED状態: クローズ -->
              <template v-else-if="alert.status === 'RESOLVED'">
                <el-button size="small" type="info" @click="handleClose(alert)">クローズ</el-button>
              </template>

              <!-- 詳細ボタン（全状態共通） -->
              <el-button size="small" link type="primary" @click="handleShowDetail(alert)">
                詳細
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- ページネーション -->
      <div class="mt-4 flex-x-end">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 対応完了ダイアログ -->
    <el-dialog v-model="resolveDialogVisible" title="対応完了" width="500px">
      <el-form ref="resolveFormRef" :model="resolveForm" :rules="resolveRules" label-width="100px">
        <el-form-item label="アラート">
          <span>{{ selectedAlert?.storeName }} - {{ getAlertTypeLabel(selectedAlert?.alertType) }}</span>
        </el-form-item>
        <el-form-item v-if="selectedAlert?.productName" label="商品">
          <span>{{ selectedAlert?.productName }}</span>
        </el-form-item>
        <el-form-item label="対応内容" prop="resolutionNote">
          <el-input
            v-model="resolveForm.resolutionNote"
            type="textarea"
            :rows="4"
            placeholder="対応内容を入力してください"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resolveDialogVisible = false">キャンセル</el-button>
        <el-button type="primary" @click="submitResolve">完了</el-button>
      </template>
    </el-dialog>

    <!-- 詳細ダイアログ -->
    <el-dialog v-model="detailDialogVisible" title="アラート詳細" width="600px">
      <el-descriptions v-if="alertDetail" :column="2" border>
        <el-descriptions-item label="アラートID">{{ alertDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="優先度">
          <el-tag :type="getPriorityType(alertDetail.priority)">{{ alertDetail.priority }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="種別">{{ getAlertTypeLabel(alertDetail.alertType) }}</el-descriptions-item>
        <el-descriptions-item label="状態">
          <el-tag :type="getStatusType(alertDetail.status)">{{ getStatusLabel(alertDetail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="店舗">{{ alertDetail.storeName }}</el-descriptions-item>
        <el-descriptions-item label="商品">{{ alertDetail.productName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="商品コード">{{ alertDetail.productCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="ロット番号">{{ alertDetail.lotNumber || '-' }}</el-descriptions-item>
        <el-descriptions-item label="現在値">{{ alertDetail.currentValue || '-' }}</el-descriptions-item>
        <el-descriptions-item label="しきい値">{{ alertDetail.thresholdValue || '-' }}</el-descriptions-item>
        <el-descriptions-item label="検知日時" :span="2">{{ formatDateTime(alertDetail.detectedAt) }}</el-descriptions-item>
        <el-descriptions-item label="確認日時" :span="2">{{ formatDateTime(alertDetail.acknowledgedAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="解決日時" :span="2">{{ formatDateTime(alertDetail.resolvedAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="クローズ日時" :span="2">{{ formatDateTime(alertDetail.closedAt) || '-' }}</el-descriptions-item>
        <el-descriptions-item v-if="alertDetail.resolutionNote" label="解決メモ" :span="2">
          {{ alertDetail.resolutionNote }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">閉じる</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import AlertAPI, {
  type AlertPageVO,
  type AlertVO,
  type AlertType,
  type AlertPriority,
  type AlertStatus,
} from "@/api/retail/alert";
import StoreAPI from "@/api/retail/store";

// 優先度オプション
const PRIORITY_OPTIONS = [
  { value: "P1", label: "P1", type: "danger" },
  { value: "P2", label: "P2", type: "warning" },
  { value: "P3", label: "P3", type: "info" },
  { value: "P4", label: "P4", type: "info" },
];

// ステータスオプション
const STATUS_OPTIONS = [
  { value: "NEW", label: "未確認", type: "danger" },
  { value: "ACK", label: "確認済", type: "warning" },
  { value: "IN_PROGRESS", label: "対応中", type: "primary" },
  { value: "RESOLVED", label: "解決済", type: "success" },
  { value: "CLOSED", label: "クローズ", type: "info" },
];

// アラートタイプオプション
const ALERT_TYPE_OPTIONS = [
  { value: "LOW_STOCK", label: "在庫切れ" },
  { value: "EXPIRY_SOON", label: "期限接近" },
  { value: "HIGH_STOCK", label: "在庫過多" },
  { value: "COMMUNICATION_DOWN", label: "通信異常" },
  { value: "PAYMENT_TERMINAL_DOWN", label: "決済端末異常" },
];

// 検索パラメータ
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  priority: undefined as AlertPriority | undefined,
  status: undefined as AlertStatus | undefined,
  alertType: undefined as AlertType | undefined,
  storeId: undefined as number | undefined,
});

// データ
const loading = ref(false);
const alertList = ref<AlertPageVO[]>([]);
const total = ref(0);
const storeList = ref<{ id: number; storeName: string }[]>([]);

// 詳細ダイアログ
const detailDialogVisible = ref(false);
const alertDetail = ref<AlertVO | null>(null);

// 対応完了ダイアログ
const resolveDialogVisible = ref(false);
const resolveFormRef = ref<FormInstance>();
const selectedAlert = ref<AlertPageVO | null>(null);
const resolveForm = reactive({
  resolutionNote: "",
});
const resolveRules = {
  resolutionNote: [{ required: true, message: "対応内容を入力してください", trigger: "blur" }],
};

// 優先度のタイプを取得
const getPriorityType = (priority?: AlertPriority) => {
  const option = PRIORITY_OPTIONS.find((item) => item.value === priority);
  return option?.type || "info";
};

// 優先度のCSSクラスを取得
const getPriorityClass = (priority?: AlertPriority) => {
  switch (priority) {
    case "P1":
      return "priority-p1";
    case "P2":
      return "priority-p2";
    case "P3":
      return "priority-p3";
    case "P4":
      return "priority-p4";
    default:
      return "";
  }
};

// ステータスのタイプを取得
const getStatusType = (status?: AlertStatus) => {
  const option = STATUS_OPTIONS.find((item) => item.value === status);
  return option?.type || "info";
};

// ステータスのラベルを取得
const getStatusLabel = (status?: AlertStatus) => {
  const option = STATUS_OPTIONS.find((item) => item.value === status);
  return option?.label || "未設定";
};

// アラートタイプのラベルを取得
const getAlertTypeLabel = (alertType?: AlertType) => {
  const option = ALERT_TYPE_OPTIONS.find((item) => item.value === alertType);
  return option?.label || "不明";
};

// 日時フォーマット
const formatDateTime = (dateTime?: string) => {
  if (!dateTime) return "";
  const date = new Date(dateTime);
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// アラート一覧を取得
const getList = async () => {
  if (loading.value) return;

  loading.value = true;
  try {
    const res = await AlertAPI.getPage({
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      priority: queryParams.priority,
      status: queryParams.status,
      alertType: queryParams.alertType,
      storeId: queryParams.storeId,
    });

    alertList.value = res.list || [];
    total.value = res.total || 0;
  } catch (error) {
    console.error("アラート一覧の取得に失敗しました:", error);
    ElMessage.error("アラート一覧の取得に失敗しました");
  } finally {
    loading.value = false;
  }
};

// 店舗一覧を取得
const getStoreList = async () => {
  try {
    const res = await StoreAPI.getList();
    storeList.value = res || [];
  } catch (error) {
    console.error("店舗一覧の取得に失敗しました:", error);
  }
};

// 検索
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

// リセット
const resetQuery = () => {
  queryParams.priority = undefined;
  queryParams.status = undefined;
  queryParams.alertType = undefined;
  queryParams.storeId = undefined;
  queryParams.pageNum = 1;
  getList();
};

// ページサイズ変更
const handleSizeChange = () => {
  getList();
};

// ページ変更
const handleCurrentChange = () => {
  getList();
};

// 確認する（NEW -> ACK）
const handleAcknowledge = async (alert: AlertPageVO) => {
  try {
    await AlertAPI.updateStatus(alert.id, { status: "ACK" });
    ElMessage.success("確認しました");
    getList();
  } catch (error) {
    console.error("確認に失敗しました:", error);
    ElMessage.error("確認に失敗しました");
  }
};

// 対応開始（NEW/ACK -> IN_PROGRESS）
const handleStartProgress = async (alert: AlertPageVO) => {
  try {
    await AlertAPI.updateStatus(alert.id, { status: "IN_PROGRESS" });
    ElMessage.success("対応を開始しました");
    getList();
  } catch (error) {
    console.error("対応開始に失敗しました:", error);
    ElMessage.error("対応開始に失敗しました");
  }
};

// 完了（IN_PROGRESS -> RESOLVED）
const handleResolve = (alert: AlertPageVO) => {
  selectedAlert.value = alert;
  resolveForm.resolutionNote = "";
  resolveDialogVisible.value = true;
};

// 完了送信
const submitResolve = async () => {
  if (!resolveFormRef.value || !selectedAlert.value) return;

  await resolveFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await AlertAPI.updateStatus(selectedAlert.value!.id, {
          status: "RESOLVED",
          resolutionNote: resolveForm.resolutionNote,
        });
        ElMessage.success("対応完了しました");
        resolveDialogVisible.value = false;
        getList();
      } catch (error) {
        console.error("完了処理に失敗しました:", error);
        ElMessage.error("完了処理に失敗しました");
      }
    }
  });
};

// クローズ（RESOLVED -> CLOSED）
const handleClose = async (alert: AlertPageVO) => {
  ElMessageBox.confirm("このアラートをクローズしてもよろしいですか？", "確認", {
    confirmButtonText: "クローズ",
    cancelButtonText: "キャンセル",
    type: "info",
  })
    .then(async () => {
      try {
        await AlertAPI.updateStatus(alert.id, { status: "CLOSED" });
        ElMessage.success("クローズしました");
        getList();
      } catch (error) {
        console.error("クローズに失敗しました:", error);
        ElMessage.error("クローズに失敗しました");
      }
    })
    .catch(() => {
      // キャンセル時は何もしない
    });
};

// 詳細表示
const handleShowDetail = async (alert: AlertPageVO) => {
  try {
    const res = await AlertAPI.getDetail(alert.id);
    alertDetail.value = res;
    detailDialogVisible.value = true;
  } catch (error) {
    console.error("詳細の取得に失敗しました:", error);
    ElMessage.error("詳細の取得に失敗しました");
  }
};

// 初期化
onMounted(() => {
  getList();
  getStoreList();
});
</script>

<style scoped lang="scss">
.alert-container {
  padding: 20px;
}

.flex-x-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flex-x-end {
  display: flex;
  justify-content: flex-end;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}

.ml-2 {
  margin-left: 8px;
}

.ml-4 {
  margin-left: 16px;
}

.total-text {
  color: #909399;
  font-size: 14px;
}

.alert-list {
  min-height: 200px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.alert-card {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 16px;
  overflow: hidden;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  // 優先度に応じた左ボーダー
  &.priority-p1 {
    border-left: 4px solid #f56c6c;
  }

  &.priority-p2 {
    border-left: 4px solid #e6a23c;
  }

  &.priority-p3 {
    border-left: 4px solid #909399;
  }

  &.priority-p4 {
    border-left: 4px solid #c0c4cc;
  }
}

.alert-header {
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.alert-badges {
  display: flex;
  align-items: center;
}

.alert-body {
  padding: 16px;
}

.alert-info {
  .info-row {
    margin-bottom: 8px;
    font-size: 14px;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      color: #909399;
      margin-right: 4px;
    }

    .value {
      color: #303133;
    }
  }
}

.alert-footer {
  padding: 12px 16px;
  background-color: #fafafa;
  border-top: 1px solid #ebeef5;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
