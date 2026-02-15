<template>
  <div class="alert-container">
    <!-- 検索フォーム -->
    <el-card shadow="never" class="filter-card">
      <el-form ref="queryForm" :model="queryParams" :inline="true">
        <el-form-item label="優先度" prop="priority">
          <el-select
            v-model="queryParams.priority"
            placeholder="すべて"
            clearable
            style="width: 100px"
          >
            <el-option
              v-for="option in PRIORITY_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状態" prop="statusFilter">
          <el-select v-model="queryParams.statusFilter" placeholder="すべて" style="width: 120px">
            <el-option label="未対応" value="pending" />
            <el-option label="完了" value="completed" />
            <el-option label="すべて" value="all" />
          </el-select>
        </el-form-item>
        <el-form-item label="種別" prop="alertType">
          <el-select
            v-model="queryParams.alertType"
            placeholder="すべて"
            clearable
            style="width: 120px"
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
            style="width: 160px"
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

    <!-- サマリバー -->
    <div class="summary-bar">
      <div class="summary-items">
        <div
          v-for="item in summaryCounts"
          :key="item.priority"
          class="summary-item"
          :class="{ active: queryParams.priority === item.priority }"
          @click="togglePriorityFilter(item.priority)"
        >
          <span class="summary-badge" :style="{ backgroundColor: item.color }">
            {{ item.priority }}: {{ item.count }}件
          </span>
        </div>
      </div>
      <div class="summary-note" role="status" aria-live="polite">
        <span class="summary-note-icon">!</span>
        <span>この画面の監視データは約10分ごとに更新されます</span>
      </div>
    </div>

    <!-- アラートテーブル -->
    <el-card shadow="never" class="table-card">
      <div class="table-wrapper">
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="alertList"
          border
          row-key="id"
          :row-class-name="getRowClassName"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          @row-click="handleRowClick"
        >
          <el-table-column type="selection" width="40" />
          <el-table-column label="優先度" width="80" sortable prop="priority">
            <template #default="{ row }">
              <div class="priority-cell" :class="getPriorityClass(row.priority)">
                <el-tag :type="getPriorityType(row.priority)" size="small">
                  {{ row.priority }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="種別" width="100" sortable prop="alertType">
            <template #default="{ row }">
              {{ getAlertTypeLabel(row.alertType) }}
            </template>
          </el-table-column>
          <el-table-column label="状態" width="100" sortable prop="status">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="概要" min-width="200">
            <template #default="{ row }">
              <div class="summary-cell">
                <div class="summary-main">{{ row.productName || row.message }}</div>
                <div class="summary-sub">
                  <template v-if="row.alertType === 'LOW_STOCK'">
                    現在: {{ row.currentValue }} / 発注点: {{ row.thresholdValue }}
                  </template>
                  <template v-else-if="row.alertType === 'HIGH_STOCK'">
                    現在: {{ row.currentValue }} / 上限: {{ row.thresholdValue }}
                  </template>
                  <template v-else-if="row.alertType === 'EXPIRY_SOON'">
                    {{ row.lotNumber ? `${row.lotNumber} ` : "" }}残{{ row.currentValue }}日
                  </template>
                  <template v-else>
                    {{ row.message }}
                  </template>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="店舗" width="120" sortable prop="storeName" />
          <el-table-column label="検知日時" width="120" sortable prop="detectedAt">
            <template #default="{ row }">
              <el-tooltip :content="formatAbsoluteDateTime(row.detectedAt)" placement="top">
                <span>{{ formatRelativeTime(row.detectedAt) }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <!-- ページネーション -->
        <div class="pagination-wrapper">
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

        <!-- 一括操作バー -->
        <transition name="slide-up">
          <div v-if="selectedRows.length > 0" class="bulk-action-bar">
            <span class="selection-count">{{ selectedRows.length }}件選択中</span>
            <el-button type="primary" size="small" @click="handleBulkAcknowledge">
              一括確認
            </el-button>
            <el-button type="primary" size="small" @click="handleBulkStartProgress">
              一括対応開始
            </el-button>
            <el-button size="small" @click="clearSelection">選択解除</el-button>
          </div>
        </transition>
      </div>
    </el-card>

    <!-- 詳細Drawer -->
    <el-drawer
      v-model="drawerVisible"
      title="アラート詳細"
      direction="rtl"
      size="600px"
      :destroy-on-close="false"
    >
      <div v-if="alertDetail" class="drawer-content">
        <!-- ヘッダーバッジ -->
        <div class="panel-badges">
          <el-tag :type="getPriorityType(alertDetail.priority)" size="small">
            {{ alertDetail.priority }}
          </el-tag>
          <el-tag type="info" size="small">
            {{ getAlertTypeLabel(alertDetail.alertType) }}
          </el-tag>
          <el-tag :type="getStatusType(alertDetail.status)" size="small">
            {{ getStatusLabel(alertDetail.status) }}
          </el-tag>
        </div>

        <!-- 基本情報 -->
        <div class="panel-section">
          <div class="section-title">基本情報</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">店舗</span>
              <span class="info-value">{{ alertDetail.storeName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">商品</span>
              <span class="info-value">{{ alertDetail.productName || "-" }}</span>
            </div>
            <div v-if="alertDetail.lotNumber" class="info-item">
              <span class="info-label">ロット</span>
              <span class="info-value">{{ alertDetail.lotNumber }}</span>
            </div>
          </div>
        </div>

        <!-- 数値情報 -->
        <div v-if="alertDetail.currentValue || alertDetail.thresholdValue" class="panel-section">
          <div class="section-title">数値</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">現在値</span>
              <span class="info-value">{{ alertDetail.currentValue }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">しきい値</span>
              <span class="info-value">{{ alertDetail.thresholdValue }}</span>
            </div>
          </div>
        </div>

        <!-- 状態遷移タイムライン -->
        <div class="panel-section">
          <div class="section-title">状態遷移タイムライン</div>
          <div class="timeline">
            <div class="timeline-item" :class="{ completed: true }">
              <div class="timeline-dot completed"></div>
              <div class="timeline-content">
                <span class="timeline-label">検知</span>
                <span class="timeline-time">
                  {{ formatAbsoluteDateTime(alertDetail.detectedAt) }}
                </span>
              </div>
            </div>
            <div class="timeline-item" :class="{ completed: !!alertDetail.acknowledgedAt }">
              <div class="timeline-dot" :class="{ completed: !!alertDetail.acknowledgedAt }"></div>
              <div class="timeline-content">
                <span class="timeline-label">確認</span>
                <span class="timeline-time">
                  {{
                    alertDetail.acknowledgedAt
                      ? formatAbsoluteDateTime(alertDetail.acknowledgedAt)
                      : "（未）"
                  }}
                </span>
              </div>
            </div>
            <div
              class="timeline-item"
              :class="{
                completed:
                  alertDetail.status === 'IN_PROGRESS' ||
                  alertDetail.status === 'RESOLVED' ||
                  alertDetail.status === 'CLOSED',
              }"
            >
              <div
                class="timeline-dot"
                :class="{
                  completed:
                    alertDetail.status === 'IN_PROGRESS' ||
                    alertDetail.status === 'RESOLVED' ||
                    alertDetail.status === 'CLOSED',
                }"
              ></div>
              <div class="timeline-content">
                <span class="timeline-label">対応開始</span>
                <span class="timeline-time">{{ getProgressStartTime() }}</span>
              </div>
            </div>
            <div class="timeline-item" :class="{ completed: !!alertDetail.resolvedAt }">
              <div class="timeline-dot" :class="{ completed: !!alertDetail.resolvedAt }"></div>
              <div class="timeline-content">
                <span class="timeline-label">完了</span>
                <span class="timeline-time">
                  {{
                    alertDetail.resolvedAt
                      ? formatAbsoluteDateTime(alertDetail.resolvedAt)
                      : "（未）"
                  }}
                </span>
              </div>
            </div>
            <div class="timeline-item" :class="{ completed: !!alertDetail.closedAt }">
              <div class="timeline-dot" :class="{ completed: !!alertDetail.closedAt }"></div>
              <div class="timeline-content">
                <span class="timeline-label">クローズ</span>
                <span class="timeline-time">
                  {{
                    alertDetail.closedAt ? formatAbsoluteDateTime(alertDetail.closedAt) : "（未）"
                  }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 対応メモ -->
        <div class="panel-section">
          <div class="section-title">
            対応メモ
            <el-button
              v-if="!isEditingNote && alertDetail.status !== 'CLOSED'"
              type="primary"
              size="small"
              link
              @click="startEditNote"
            >
              編集
            </el-button>
          </div>
          <template v-if="isEditingNote">
            <el-input
              v-model="editNoteForm.resolutionNote"
              type="textarea"
              :rows="4"
              placeholder="対応メモを入力してください"
            />
            <div class="note-actions">
              <el-button size="small" @click="cancelEditNote">キャンセル</el-button>
              <el-button type="primary" size="small" :loading="savingNote" @click="saveNote">
                保存
              </el-button>
            </div>
          </template>
          <div v-else class="resolution-note">
            {{ alertDetail.resolutionNote || "（まだ記録なし）" }}
          </div>
        </div>

        <!-- 推奨対応 -->
        <div class="panel-section">
          <div class="section-title">推奨対応</div>
          <div class="recommendation">
            {{ getRecommendation(alertDetail.alertType) }}
          </div>
        </div>

        <!-- アクションボタン -->
        <div class="panel-actions">
          <template v-if="alertDetail.status === 'NEW'">
            <el-button type="primary" @click="handleAcknowledge(alertDetail)">確認する</el-button>
          </template>
          <template v-else-if="alertDetail.status === 'ACK'">
            <el-button type="primary" @click="handleStartProgress(alertDetail)">対応開始</el-button>
          </template>
          <template v-else-if="alertDetail.status === 'IN_PROGRESS'">
            <el-button type="success" @click="handleResolve(alertDetail)">完了する</el-button>
          </template>
          <template v-else-if="alertDetail.status === 'RESOLVED'">
            <el-button plain @click="handleClose(alertDetail)">クローズ</el-button>
          </template>

          <el-button
            v-if="alertDetail.productId && alertDetail.storeId"
            link
            type="primary"
            @click="goToInventory"
          >
            在庫一覧で確認
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 対応完了ダイアログ -->
    <el-dialog v-model="resolveDialogVisible" title="対応完了" width="500px">
      <el-form ref="resolveFormRef" :model="resolveForm" :rules="resolveRules" label-width="100px">
        <el-form-item label="アラート">
          <span>
            {{ getAlertTypeLabel(selectedAlert?.alertType) }} - {{ selectedAlert?.storeName }}
          </span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, TableInstance } from "element-plus";
import AlertAPI, {
  type AlertPageVO,
  type AlertVO,
  type AlertType,
  type AlertPriority,
  type AlertStatus,
} from "@/api/retail/alert";
import StoreAPI from "@/api/retail/store";

const router = useRouter();

// 定数
const PRIORITY_OPTIONS = [
  { value: "P1", label: "P1", color: "#F56C6C" },
  { value: "P2", label: "P2", color: "#E6A23C" },
  { value: "P3", label: "P3", color: "#909399" },
  { value: "P4", label: "P4", color: "#C0C4CC" },
];

const STATUS_OPTIONS = [
  { value: "NEW", label: "未確認", type: "danger" },
  { value: "ACK", label: "確認済", type: "warning" },
  { value: "IN_PROGRESS", label: "対応中", type: "primary" },
  { value: "RESOLVED", label: "完了", type: "success" },
  { value: "CLOSED", label: "クローズ", type: "info" },
];

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
  pageSize: 20,
  priority: undefined as AlertPriority | undefined,
  statusFilter: "pending" as "pending" | "completed" | "all",
  alertType: undefined as AlertType | undefined,
  storeId: undefined as number | undefined,
});

// データ
const loading = ref(false);
const alertList = ref<AlertPageVO[]>([]);
const total = ref(0);
const storeList = ref<{ id: number; storeName: string }[]>([]);
const selectedRows = ref<AlertPageVO[]>([]);
const tableRef = ref<TableInstance>();

// サマリカウント
const summaryCounts = computed(() => {
  return PRIORITY_OPTIONS.map((opt) => ({
    priority: opt.value as AlertPriority,
    color: opt.color,
    count: alertList.value.filter((a) => a.priority === opt.value).length,
  }));
});

// 詳細Drawer
const drawerVisible = ref(false);
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

// メモ編集
const isEditingNote = ref(false);
const savingNote = ref(false);
const editNoteForm = reactive({
  resolutionNote: "",
});

// ヘルパー関数
const getPriorityType = (priority?: AlertPriority) => {
  switch (priority) {
    case "P1":
      return "danger";
    case "P2":
      return "warning";
    case "P3":
      return "info";
    case "P4":
      return "info";
    default:
      return "info";
  }
};

const getPriorityClass = (priority?: AlertPriority) => {
  return `priority-${priority?.toLowerCase()}`;
};

const getStatusType = (status?: AlertStatus) => {
  const option = STATUS_OPTIONS.find((item) => item.value === status);
  return option?.type || "info";
};

const getStatusLabel = (status?: AlertStatus) => {
  const option = STATUS_OPTIONS.find((item) => item.value === status);
  return option?.label || "未設定";
};

const getAlertTypeLabel = (alertType?: AlertType) => {
  const option = ALERT_TYPE_OPTIONS.find((item) => item.value === alertType);
  return option?.label || "不明";
};

const getRowClassName = ({ row }: { row: AlertPageVO }) => {
  const classes = [];
  if (row.status === "NEW") {
    classes.push("row-new");
  }
  if (alertDetail.value?.id === row.id) {
    classes.push("row-selected");
  }
  return classes.join(" ");
};

const formatRelativeTime = (dateTime?: string) => {
  if (!dateTime) return "";
  const date = new Date(dateTime);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMinutes < 60) {
    return `${diffMinutes}分前`;
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);

  if (date >= today) {
    return `${diffHours}時間前`;
  } else if (date >= yesterday) {
    return `昨日 ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  } else {
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  }
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

const getProgressStartTime = () => {
  if (!alertDetail.value) return "（未）";
  if (
    alertDetail.value.status === "IN_PROGRESS" ||
    alertDetail.value.status === "RESOLVED" ||
    alertDetail.value.status === "CLOSED"
  ) {
    return alertDetail.value.acknowledgedAt
      ? formatAbsoluteDateTime(alertDetail.value.acknowledgedAt)
      : "（対応中）";
  }
  return "（未）";
};

const getRecommendation = (alertType?: AlertType) => {
  switch (alertType) {
    case "LOW_STOCK":
      return "補充発注を検討してください。在庫が発注点を下回っています。";
    case "EXPIRY_SOON":
      return "賞味期限が近い在庫があります。販促や廃棄処理を検討してください。";
    case "HIGH_STOCK":
      return "在庫が適正上限を超えています。販促や他店舗への移動を検討してください。";
    case "COMMUNICATION_DOWN":
      return "デバイスの通信状態を確認してください。";
    case "PAYMENT_TERMINAL_DOWN":
      return "決済端末の状態を確認してください。";
    default:
      return "状況を確認してください。";
  }
};

// API呼び出し
const getList = async () => {
  if (loading.value) return;

  loading.value = true;
  try {
    // statusFilterをAPIパラメータに変換
    let status: AlertStatus | undefined;
    if (queryParams.statusFilter === "pending") {
      // 未対応: NEW, ACK, IN_PROGRESS
      status = undefined; // バックエンドで複数指定不可の場合は別途対応
    } else if (queryParams.statusFilter === "completed") {
      // 完了: RESOLVED, CLOSED
      status = undefined;
    }

    const res = await AlertAPI.getPage({
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      priority: queryParams.priority,
      status: status,
      alertType: queryParams.alertType,
      storeId: queryParams.storeId,
    });

    let list = res.list || [];

    // フロントエンドでstatusFilterを適用
    if (queryParams.statusFilter === "pending") {
      list = list.filter((a) => ["NEW", "ACK", "IN_PROGRESS"].includes(a.status));
    } else if (queryParams.statusFilter === "completed") {
      list = list.filter((a) => ["RESOLVED", "CLOSED"].includes(a.status));
    }

    alertList.value = list;
    total.value = res.total || 0;
  } catch (error) {
    console.error("アラート一覧の取得に失敗しました:", error);
    ElMessage.error("アラート一覧の取得に失敗しました");
  } finally {
    loading.value = false;
  }
};

const getStoreList = async () => {
  try {
    const res = await StoreAPI.getList();
    storeList.value = res || [];
  } catch (error) {
    console.error("店舗一覧の取得に失敗しました:", error);
  }
};

// イベントハンドラ
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryParams.priority = undefined;
  queryParams.statusFilter = "pending";
  queryParams.alertType = undefined;
  queryParams.storeId = undefined;
  queryParams.pageNum = 1;
  getList();
};

const handleSizeChange = () => {
  getList();
};

const handleCurrentChange = () => {
  getList();
};

const togglePriorityFilter = (priority: AlertPriority) => {
  if (queryParams.priority === priority) {
    queryParams.priority = undefined;
  } else {
    queryParams.priority = priority;
  }
  handleQuery();
};

const handleSelectionChange = (rows: AlertPageVO[]) => {
  selectedRows.value = rows;
};

const clearSelection = () => {
  tableRef.value?.clearSelection();
};

const handleRowClick = async (row: AlertPageVO) => {
  try {
    const res = await AlertAPI.getDetail(row.id);
    alertDetail.value = res;
    drawerVisible.value = true;
  } catch (error) {
    console.error("詳細の取得に失敗しました:", error);
    ElMessage.error("詳細の取得に失敗しました");
  }
};

const closeDrawer = () => {
  drawerVisible.value = false;
  alertDetail.value = null;
};

// 状態遷移
const handleAcknowledge = async (alert: AlertPageVO | AlertVO) => {
  try {
    await AlertAPI.updateStatus(alert.id, { status: "ACK" });
    ElMessage.success("確認しました");
    getList();
    if (alertDetail.value?.id === alert.id) {
      const res = await AlertAPI.getDetail(alert.id);
      alertDetail.value = res;
    }
  } catch (error) {
    console.error("確認に失敗しました:", error);
    ElMessage.error("確認に失敗しました");
  }
};

const handleStartProgress = async (alert: AlertPageVO | AlertVO) => {
  try {
    await AlertAPI.updateStatus(alert.id, { status: "IN_PROGRESS" });
    ElMessage.success("対応を開始しました");
    getList();
    if (alertDetail.value?.id === alert.id) {
      const res = await AlertAPI.getDetail(alert.id);
      alertDetail.value = res;
    }
  } catch (error) {
    console.error("対応開始に失敗しました:", error);
    ElMessage.error("対応開始に失敗しました");
  }
};

const handleResolve = (alert: AlertPageVO | AlertVO) => {
  selectedAlert.value = alert as AlertPageVO;
  resolveForm.resolutionNote = "";
  resolveDialogVisible.value = true;
};

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
        if (alertDetail.value?.id === selectedAlert.value!.id) {
          const res = await AlertAPI.getDetail(selectedAlert.value!.id);
          alertDetail.value = res;
        }
      } catch (error) {
        console.error("完了処理に失敗しました:", error);
        ElMessage.error("完了処理に失敗しました");
      }
    }
  });
};

const handleClose = async (alert: AlertPageVO | AlertVO) => {
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
        if (alertDetail.value?.id === alert.id) {
          const res = await AlertAPI.getDetail(alert.id);
          alertDetail.value = res;
        }
      } catch (error) {
        console.error("クローズに失敗しました:", error);
        ElMessage.error("クローズに失敗しました");
      }
    })
    .catch(() => {});
};

// 一括操作
const handleBulkAcknowledge = async () => {
  const newAlerts = selectedRows.value.filter((a) => a.status === "NEW");
  if (newAlerts.length === 0) {
    ElMessage.warning("確認対象のアラートがありません（NEW状態のアラートのみ対象）");
    return;
  }

  try {
    await ElMessageBox.confirm(
      `選択した${newAlerts.length}件のアラートを確認済みにしますか？`,
      "一括確認",
      {
        confirmButtonText: "確認する",
        cancelButtonText: "キャンセル",
        type: "warning",
      }
    );

    await Promise.all(newAlerts.map((a) => AlertAPI.updateStatus(a.id, { status: "ACK" })));
    ElMessage.success(`${newAlerts.length}件を確認しました`);
    clearSelection();
    getList();
  } catch (error) {
    if (error !== "cancel") {
      console.error("一括確認に失敗しました:", error);
      ElMessage.error("一括確認に失敗しました");
    }
  }
};

const handleBulkStartProgress = async () => {
  const targetAlerts = selectedRows.value.filter((a) => ["NEW", "ACK"].includes(a.status));
  if (targetAlerts.length === 0) {
    ElMessage.warning("対応開始対象のアラートがありません（NEW/ACK状態のアラートのみ対象）");
    return;
  }

  try {
    await ElMessageBox.confirm(
      `選択した${targetAlerts.length}件のアラートの対応を開始しますか？`,
      "一括対応開始",
      {
        confirmButtonText: "対応開始",
        cancelButtonText: "キャンセル",
        type: "warning",
      }
    );

    await Promise.all(
      targetAlerts.map((a) => AlertAPI.updateStatus(a.id, { status: "IN_PROGRESS" }))
    );
    ElMessage.success(`${targetAlerts.length}件の対応を開始しました`);
    clearSelection();
    getList();
  } catch (error) {
    if (error !== "cancel") {
      console.error("一括対応開始に失敗しました:", error);
      ElMessage.error("一括対応開始に失敗しました");
    }
  }
};

// 在庫一覧へ遷移
const goToInventory = () => {
  if (alertDetail.value?.storeId && alertDetail.value?.productId) {
    router.push({
      path: "/retail/inventory/list",
      query: {
        storeId: alertDetail.value.storeId.toString(),
        productId: alertDetail.value.productId.toString(),
      },
    });
  }
};

// メモ編集機能
const startEditNote = () => {
  editNoteForm.resolutionNote = alertDetail.value?.resolutionNote || "";
  isEditingNote.value = true;
};

const cancelEditNote = () => {
  isEditingNote.value = false;
  editNoteForm.resolutionNote = "";
};

const saveNote = async () => {
  if (!alertDetail.value) return;

  savingNote.value = true;
  try {
    await AlertAPI.updateStatus(alertDetail.value.id, {
      status: alertDetail.value.status,
      resolutionNote: editNoteForm.resolutionNote,
    });
    ElMessage.success("メモを保存しました");
    const res = await AlertAPI.getDetail(alertDetail.value.id);
    alertDetail.value = res;
    isEditingNote.value = false;
  } catch (error) {
    console.error("メモの保存に失敗しました:", error);
    ElMessage.error("メモの保存に失敗しました");
  } finally {
    savingNote.value = false;
  }
};

// キーボードショートカット
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && drawerVisible.value) {
    closeDrawer();
  }
};

// 初期化
onMounted(() => {
  getList();
  getStoreList();
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped lang="scss">
.alert-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 16px;
}

.summary-bar {
  background-color: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.summary-items {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.summary-item {
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }

  &.active .summary-badge {
    box-shadow: 0 0 0 2px #409eff;
  }
}

.summary-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
}

.summary-note {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #f56c6c;
  background-color: #fef0f0;
  color: #c45656;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  animation: summary-note-blink 1.2s ease-in-out infinite;
}

.summary-note-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #f56c6c;
  color: #fff;
  font-size: 11px;
  line-height: 1;
}

@keyframes summary-note-blink {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.35);
  }
  50% {
    opacity: 0.45;
    box-shadow: 0 0 0 6px rgba(245, 108, 108, 0.08);
  }
}

.table-card {
  :deep(.el-card__body) {
    padding: 0;
  }
}

.table-wrapper {
  display: block;
}

.el-table {
  :deep(.row-new) {
    background-color: #fef0f0;
  }

  :deep(.row-selected) {
    background-color: #ecf5ff;
  }

  :deep(tr:hover > td) {
    background-color: #f5f7fa !important;
  }

  :deep(.el-table__row) {
    cursor: pointer;
  }
}

.priority-cell {
  position: relative;
  padding-left: 8px;

  &::before {
    content: "";
    position: absolute;
    left: -12px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 24px;
    border-radius: 2px;
  }

  &.priority-p1::before {
    background-color: #f56c6c;
  }

  &.priority-p2::before {
    background-color: #e6a23c;
  }

  &.priority-p3::before {
    background-color: #909399;
  }

  &.priority-p4::before {
    background-color: #c0c4cc;
  }
}

.summary-cell {
  .summary-main {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 4px;
  }

  .summary-sub {
    font-size: 12px;
    color: #909399;
  }
}

.pagination-wrapper {
  padding: 16px;
  display: flex;
  justify-content: flex-end;
}

.bulk-action-bar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 100;
}

.selection-count {
  color: #606266;
  font-size: 14px;
}

// Drawer
.drawer-content {
  padding: 0 4px;
}

.panel-badges {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.panel-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 13px;
  font-weight: 500;
  color: #909399;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #909399;
}

.info-value {
  font-size: 14px;
  color: #303133;
}

.timeline {
  position: relative;
  padding-left: 20px;
}

.timeline-item {
  position: relative;
  padding-bottom: 16px;
  padding-left: 16px;

  &:last-child {
    padding-bottom: 0;
  }

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 8px;
    bottom: -8px;
    width: 2px;
    background-color: #dcdfe6;
  }

  &:last-child::before {
    display: none;
  }

  &.completed::before {
    background-color: #67c23a;
  }
}

.timeline-dot {
  position: absolute;
  left: -5px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #dcdfe6;
  border: 2px solid #fff;

  &.completed {
    background-color: #67c23a;
  }
}

.timeline-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timeline-label {
  font-size: 13px;
  color: #303133;
}

.timeline-time {
  font-size: 12px;
  color: #909399;
}

.resolution-note {
  font-size: 14px;
  color: #606266;
  background-color: #fafafa;
  padding: 12px;
  border-radius: 4px;
  white-space: pre-wrap;
}

.note-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.recommendation {
  font-size: 14px;
  color: #606266;
  background-color: #f0f9eb;
  padding: 12px;
  border-radius: 4px;
  border-left: 3px solid #67c23a;
}

.panel-actions {
  padding: 16px 0;
  margin-top: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

// アニメーション
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateX(-50%) translateY(20px);
  opacity: 0;
}
</style>
