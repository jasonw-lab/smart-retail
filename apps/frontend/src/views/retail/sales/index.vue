<template>
  <div class="sales-container">
    <!-- 検索フォーム -->
    <el-card shadow="never" class="mb-4">
      <el-form ref="queryForm" :model="queryParams" :inline="true">
        <el-form-item label="店舗" prop="storeId">
          <el-select
            v-model="queryParams.storeId"
            placeholder="すべて"
            clearable
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
        <el-form-item label="決済方法" prop="paymentMethod">
          <el-select
            v-model="queryParams.paymentMethod"
            placeholder="すべて"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="option in PAYMENT_METHOD_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="期間" prop="dateRange">
          <el-select
            v-model="selectedDateRange"
            placeholder="本日"
            style="width: 140px"
            @change="handleDateRangeChange"
          >
            <el-option
              v-for="option in DATE_RANGE_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="selectedDateRange === 'custom'" label="カスタム期間">
          <el-date-picker
            v-model="customDateRange"
            type="daterange"
            range-separator="〜"
            start-placeholder="開始日"
            end-placeholder="終了日"
            value-format="YYYY-MM-DD"
            style="width: 240px"
            @change="handleCustomDateChange"
          />
        </el-form-item>
        <el-form-item label="注文番号" prop="orderNumber">
          <el-input
            v-model="queryParams.orderNumber"
            placeholder="注文番号を入力"
            clearable
            style="width: 180px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">検索</el-button>
          <el-button @click="resetQuery">リセット</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- サマリバー -->
    <el-card shadow="never" class="mb-4 summary-bar">
      <div class="summary-content">
        <div class="summary-item total">
          <span class="label">合計</span>
          <span class="value">{{ formatCurrency(summary.totalAmount) }}</span>
        </div>
        <div class="summary-divider" />
        <div class="summary-item count">
          <span class="label">件数</span>
          <span class="value">{{ summary.totalCount }}件</span>
        </div>
        <div class="summary-divider" />
        <div class="summary-item methods">
          <el-tag type="primary" class="method-tag">
            <el-icon><CreditCard /></el-icon>
            カード {{ summary.cardRatio }}%
          </el-tag>
          <el-tag type="success" class="method-tag">
            <el-icon><Iphone /></el-icon>
            QR {{ summary.qrRatio }}%
          </el-tag>
          <el-tag type="warning" class="method-tag">
            <el-icon><Wallet /></el-icon>
            現金 {{ summary.cashRatio }}%
          </el-tag>
          <el-tag v-if="summary.otherCount > 0" type="info" class="method-tag">
            その他 {{ summary.otherRatio }}%
          </el-tag>
        </div>
      </div>
    </el-card>

    <!-- 決済履歴一覧 -->
    <el-card shadow="never">
      <template #header>
        <span>決済履歴</span>
      </template>

      <el-table v-loading="loading" :data="salesList" border style="width: 100%">
        <el-table-column type="index" label="No." width="60" />
        <el-table-column prop="orderNumber" label="注文番号" width="220" show-overflow-tooltip />
        <el-table-column prop="storeName" label="店舗名" min-width="150" />
        <el-table-column prop="totalAmount" label="金額" width="120" align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.totalAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="決済方法" width="120">
          <template #default="{ row }">
            <el-tag :type="getPaymentMethodType(row.paymentMethod)">
              <el-icon class="mr-1">
                <component :is="getPaymentMethodIcon(row.paymentMethod)" />
              </el-icon>
              {{ getPaymentMethodLabel(row.paymentMethod) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="saleTimestamp" label="決済日時" width="160">
          <template #default="{ row }">
            {{ formatRelativeTime(row.saleTimestamp) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDetail(row)">詳細</el-button>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 決済詳細ダイアログ -->
    <el-dialog v-model="detailDialogVisible" title="決済詳細" width="600px">
      <div v-if="salesDetail" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="注文番号">
            {{ salesDetail.orderNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="店舗">
            {{ salesDetail.storeName }}
          </el-descriptions-item>
          <el-descriptions-item label="決済日時">
            {{ formatDateTime(salesDetail.saleTimestamp) }}
          </el-descriptions-item>
          <el-descriptions-item label="合計金額">
            <span class="total-amount">{{ formatCurrency(salesDetail.totalAmount) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="決済方法">
            <el-tag :type="getPaymentMethodType(salesDetail.paymentMethod)">
              {{ getPaymentMethodLabel(salesDetail.paymentMethod) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="プロバイダ">
            {{ salesDetail.paymentProvider || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="決済参照ID" :span="2">
            <code v-if="salesDetail.paymentReferenceId" class="reference-id">
              {{ salesDetail.paymentReferenceId }}
              <el-button type="primary" link @click="copyReferenceId">
                <el-icon><DocumentCopy /></el-icon>
              </el-button>
            </code>
            <span v-else>-</span>
          </el-descriptions-item>
        </el-descriptions>

        <div class="items-section">
          <h4>購入商品</h4>
          <el-table :data="salesDetail.items" border size="small">
            <el-table-column prop="productName" label="商品名" min-width="150" />
            <el-table-column prop="quantity" label="数量" width="80" align="center" />
            <el-table-column prop="unitPrice" label="単価" width="100" align="right">
              <template #default="{ row }">
                {{ formatCurrency(row.unitPrice) }}
              </template>
            </el-table-column>
            <el-table-column prop="subtotal" label="小計" width="100" align="right">
              <template #default="{ row }">
                {{ formatCurrency(row.subtotal) }}
              </template>
            </el-table-column>
          </el-table>
          <div class="items-total">
            合計: <span>{{ formatCurrency(salesDetail.totalAmount) }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">閉じる</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { CreditCard, Iphone, Wallet, DocumentCopy } from "@element-plus/icons-vue";
import SalesAPI, {
  type SalesPageVO,
  type SalesDetailVO,
  type SalesSummaryVO,
} from "@/api/retail/sales";
import StoreAPI, { type Store } from "@/api/retail/store";

// 決済方法オプション
const PAYMENT_METHOD_OPTIONS = [
  { value: "CARD", label: "カード", type: "primary", icon: "CreditCard" },
  { value: "QR", label: "QR決済", type: "success", icon: "Iphone" },
  { value: "CASH", label: "現金", type: "warning", icon: "Wallet" },
  { value: "OTHER", label: "その他", type: "info", icon: "Ticket" },
];

// 期間オプション
const DATE_RANGE_OPTIONS = [
  { value: "today", label: "本日" },
  { value: "yesterday", label: "昨日" },
  { value: "7days", label: "過去7日" },
  { value: "30days", label: "過去30日" },
  { value: "custom", label: "カスタム" },
];

// 検索パラメータ
const queryParams = reactive({
  pageNum: 1,
  pageSize: 20,
  storeId: undefined as number | undefined,
  paymentMethod: undefined as string | undefined,
  orderNumber: "",
  startDate: undefined as string | undefined,
  endDate: undefined as string | undefined,
});

// 日付選択状態
const selectedDateRange = ref("today");
const customDateRange = ref<[string, string] | null>(null);

// データ
const loading = ref(false);
const salesList = ref<SalesPageVO[]>([]);
const total = ref(0);
const storeList = ref<Store[]>([]);
const summary = ref<SalesSummaryVO>({
  totalAmount: 0,
  totalCount: 0,
  cardCount: 0,
  qrCount: 0,
  cashCount: 0,
  otherCount: 0,
  cardRatio: 0,
  qrRatio: 0,
  cashRatio: 0,
  otherRatio: 0,
});

// 詳細ダイアログ
const detailDialogVisible = ref(false);
const salesDetail = ref<SalesDetailVO | null>(null);

// 日付計算
const getDateRange = (rangeType: string): { startDate: string; endDate: string } => {
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  switch (rangeType) {
    case "today":
      return { startDate: formatDate(today), endDate: formatDate(today) };
    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { startDate: formatDate(yesterday), endDate: formatDate(yesterday) };
    }
    case "7days": {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 6);
      return { startDate: formatDate(weekAgo), endDate: formatDate(today) };
    }
    case "30days": {
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 29);
      return { startDate: formatDate(monthAgo), endDate: formatDate(today) };
    }
    default:
      return { startDate: formatDate(today), endDate: formatDate(today) };
  }
};

// 日付範囲変更ハンドラ
const handleDateRangeChange = (value: string) => {
  if (value !== "custom") {
    const { startDate, endDate } = getDateRange(value);
    queryParams.startDate = startDate;
    queryParams.endDate = endDate;
    customDateRange.value = null;
    handleQuery();
  }
};

// カスタム日付変更ハンドラ
const handleCustomDateChange = (value: [string, string] | null) => {
  if (value) {
    queryParams.startDate = value[0];
    queryParams.endDate = value[1];
    handleQuery();
  }
};

// フォーマット関数
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(value);
};

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString("ja-JP");
};

const formatRelativeTime = (dateTime: string) => {
  const date = new Date(dateTime);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 60) {
    return `${diffMins}分前`;
  } else if (date.toDateString() === now.toDateString()) {
    return `${diffHours}時間前`;
  } else {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `昨日 ${date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`;
    }
    return date.toLocaleDateString("ja-JP", { month: "2-digit", day: "2-digit" }) +
      " " + date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  }
};

// 決済方法ヘルパー
const getPaymentMethodType = (method: string) => {
  const option = PAYMENT_METHOD_OPTIONS.find((o) => o.value === method);
  return option?.type || "info";
};

const getPaymentMethodLabel = (method: string) => {
  const option = PAYMENT_METHOD_OPTIONS.find((o) => o.value === method);
  return option?.label || method;
};

const getPaymentMethodIcon = (method: string) => {
  switch (method) {
    case "CARD":
      return CreditCard;
    case "QR":
      return Iphone;
    case "CASH":
      return Wallet;
    default:
      return Wallet;
  }
};

// データ取得
const getList = async () => {
  if (loading.value) return;

  loading.value = true;
  try {
    const res = await SalesAPI.getPage({
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      storeId: queryParams.storeId,
      paymentMethod: queryParams.paymentMethod,
      orderNumber: queryParams.orderNumber || undefined,
      startDate: queryParams.startDate,
      endDate: queryParams.endDate,
    });

    salesList.value = res.list || [];
    total.value = res.total || 0;
  } catch (error) {
    console.error("決済履歴の取得に失敗しました:", error);
    ElMessage.error("決済履歴の取得に失敗しました");
  } finally {
    loading.value = false;
  }
};

const getSummary = async () => {
  try {
    const res = await SalesAPI.getSummary({
      storeId: queryParams.storeId,
      paymentMethod: queryParams.paymentMethod,
      startDate: queryParams.startDate,
      endDate: queryParams.endDate,
    });
    summary.value = res;
  } catch (error) {
    console.error("サマリの取得に失敗しました:", error);
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

// 検索
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
  getSummary();
};

// リセット
const resetQuery = () => {
  queryParams.storeId = undefined;
  queryParams.paymentMethod = undefined;
  queryParams.orderNumber = "";
  selectedDateRange.value = "today";
  customDateRange.value = null;
  const { startDate, endDate } = getDateRange("today");
  queryParams.startDate = startDate;
  queryParams.endDate = endDate;
  queryParams.pageNum = 1;
  getList();
  getSummary();
};

// ページサイズ変更
const handleSizeChange = () => {
  getList();
};

// ページ変更
const handleCurrentChange = () => {
  getList();
};

// 詳細表示
const handleDetail = async (row: SalesPageVO) => {
  try {
    const res = await SalesAPI.getDetail(row.id);
    salesDetail.value = res;
    detailDialogVisible.value = true;
  } catch (error) {
    console.error("決済詳細の取得に失敗しました:", error);
    ElMessage.error("決済詳細の取得に失敗しました");
  }
};

// 参照IDコピー
const copyReferenceId = () => {
  if (salesDetail.value?.paymentReferenceId) {
    navigator.clipboard.writeText(salesDetail.value.paymentReferenceId);
    ElMessage.success("コピーしました");
  }
};

// 初期化
onMounted(async () => {
  await getStoreList();
  const { startDate, endDate } = getDateRange("today");
  queryParams.startDate = startDate;
  queryParams.endDate = endDate;
  getList();
  getSummary();
});
</script>

<style scoped lang="scss">
.sales-container {
  padding: 20px;
}

.summary-bar {
  :deep(.el-card__body) {
    padding: 16px 24px;
  }
}

.summary-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .label {
    font-size: 12px;
    color: #909399;
  }

  .value {
    font-size: 20px;
    font-weight: bold;
    color: #303133;
  }

  &.total .value {
    color: #409eff;
  }
}

.summary-divider {
  width: 1px;
  height: 40px;
  background-color: #dcdfe6;
}

.summary-item.methods {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.method-tag {
  display: flex;
  align-items: center;
  gap: 4px;
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

.mr-1 {
  margin-right: 4px;
}

.detail-content {
  .total-amount {
    font-size: 18px;
    font-weight: bold;
    color: #409eff;
  }

  .reference-id {
    font-family: monospace;
    background-color: #f5f7fa;
    padding: 4px 8px;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .items-section {
    margin-top: 20px;

    h4 {
      margin-bottom: 12px;
      font-size: 14px;
      color: #303133;
    }
  }

  .items-total {
    margin-top: 12px;
    text-align: right;
    font-size: 14px;

    span {
      font-size: 16px;
      font-weight: bold;
      color: #409eff;
    }
  }
}
</style>
