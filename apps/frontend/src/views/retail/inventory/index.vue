<template>
  <div class="inventory-container">
    <!-- 検索フォーム -->
    <el-card shadow="never" class="mb-4">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="店舗" prop="storeId">
          <el-select
            v-model="queryParams.storeId"
            placeholder="店舗を選択"
            clearable
            fit-input-width
          >
            <el-option
              v-for="store in stores"
              :key="store.id"
              :label="store.storeName"
              :value="store.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品名" prop="productName">
          <el-input
            v-model="queryParams.productName"
            placeholder="商品名を入力"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状態" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="状態を選択"
            clearable
            fit-input-width
          >
            <el-option
              v-for="option in INVENTORY_STATUS_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">検索</el-button>
          <el-button @click="resetQuery">リセット</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 在庫一覧 -->
    <el-card shadow="never">
      <template #header>
        <div class="flex-x-between">
          <span>在庫一覧</span>
        </div>
      </template>

      <el-table v-loading="loading" :data="inventoryList" border style="width: 100%">
        <el-table-column type="index" label="No." width="50" />
        <el-table-column prop="storeName" label="店舗名" min-width="140">
          <template #default="{ row }">
            {{ resolveStoreName(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="商品名" min-width="150" />
        <el-table-column prop="lotNumber" label="ロット番号" width="180" />
        <el-table-column prop="quantity" label="在庫数" width="100" align="right">
          <template #default="{ row }">
            <span :style="{ color: getQuantityColor(row) }">{{ row.quantity }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="expiryDate" label="賞味期限" width="120">
          <template #default="{ row }">
            <span :style="{ color: getExpiryColor(row) }">
              {{ row.expiryDate || "-" }}
              <template v-if="row.daysUntilExpiry !== null && row.daysUntilExpiry <= 7">
                <br /><small>(残{{ row.daysUntilExpiry }}日)</small>
              </template>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状態" width="100" align="center">
          <template #default="{ row }">
            <el-tag :color="row.statusColor" effect="dark" size="small">
              {{ row.statusLabel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleRestock(row)">補充</el-button>
            <el-button type="warning" link @click="handleDiscard(row)">廃棄</el-button>
            <el-button type="info" link @click="handleHistory(row)">履歴</el-button>
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

    <!-- 補充ダイアログ -->
    <el-dialog v-model="restockDialogVisible" title="補充登録" width="500px">
      <el-form ref="restockFormRef" :model="restockForm" :rules="restockRules" label-width="120px">
        <el-form-item label="店舗">
          <el-input :value="currentInventory?.storeName" disabled />
        </el-form-item>
        <el-form-item label="商品">
          <el-input :value="currentInventory?.productName" disabled />
        </el-form-item>
        <el-form-item label="現在在庫">
          <el-input :value="currentInventory?.quantity" disabled />
        </el-form-item>
        <el-form-item label="補充数量" prop="quantity">
          <el-input-number v-model="restockForm.quantity" :min="1" />
        </el-form-item>
        <el-form-item label="ロット番号" prop="lotNumber">
          <el-input v-model="restockForm.lotNumber" placeholder="LOT-YYYY-MMDD" />
        </el-form-item>
        <el-form-item label="賞味期限" prop="expiryDate">
          <el-date-picker
            v-model="restockForm.expiryDate"
            type="date"
            placeholder="賞味期限を選択"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="備考" prop="remarks">
          <el-input v-model="restockForm.remarks" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="restockDialogVisible = false">キャンセル</el-button>
        <el-button type="primary" @click="submitRestock">登録</el-button>
      </template>
    </el-dialog>

    <!-- 廃棄ダイアログ（v1.1対応） -->
    <el-dialog v-model="discardDialogVisible" title="廃棄（在庫調整）" width="500px">
      <el-form ref="discardFormRef" :model="discardForm" :rules="discardRules" label-width="120px">
        <el-form-item label="店舗">
          <el-input :value="currentInventory?.storeName" disabled />
        </el-form-item>
        <el-form-item label="商品">
          <el-input :value="currentInventory?.productName" disabled />
        </el-form-item>
        <el-form-item label="ロット番号">
          <el-input :value="currentInventory?.lotNumber" disabled />
        </el-form-item>
        <el-form-item label="賞味期限">
          <el-input :value="currentInventory?.expiryDate || '-'" disabled />
        </el-form-item>
        <el-form-item label="現在在庫">
          <el-input :value="currentInventory?.quantity" disabled />
        </el-form-item>
        <el-form-item label="廃棄数量" prop="quantity">
          <el-input-number
            v-model="discardForm.quantity"
            :min="1"
            :max="currentInventory?.quantity || 1"
          />
        </el-form-item>
        <el-form-item label="廃棄理由" prop="reason">
          <el-select v-model="discardForm.reason" placeholder="理由を選択">
            <el-option
              v-for="option in DISCARD_REASON_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="備考" prop="remarks">
          <el-input v-model="discardForm.remarks" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="discardDialogVisible = false">キャンセル</el-button>
        <el-button type="danger" @click="submitDiscard">廃棄登録</el-button>
      </template>
    </el-dialog>

    <!-- 履歴ダイアログ -->
    <el-dialog v-model="historyDialogVisible" title="入出庫履歴" width="800px">
      <div class="mb-2">
        <strong>{{ currentInventory?.storeName }}</strong> /
        <strong>{{ currentInventory?.productName }}</strong>
      </div>
      <el-table :data="transactionList" border style="width: 100%" max-height="400">
        <el-table-column prop="transactionDate" label="日時" width="160" />
        <el-table-column prop="transactionType" label="種別" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getTransactionTypeTag(row.transactionType)" effect="dark" size="small">
              {{ getTransactionTypeLabel(row.transactionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="80" align="right">
          <template #default="{ row }">
            <span :style="{ color: row.quantity > 0 ? '#67C23A' : '#F56C6C' }">
              {{ row.quantity > 0 ? "+" : "" }}{{ row.quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="lotNumber" label="ロット" width="120" />
        <el-table-column prop="reason" label="理由" min-width="100" />
        <el-table-column prop="remarks" label="備考" min-width="120" />
      </el-table>
      <div class="mt-4 flex-x-end">
        <el-pagination
          v-model:current-page="historyParams.pageNum"
          v-model:page-size="historyParams.pageSize"
          :total="historyTotal"
          :page-sizes="[10, 20, 50]"
          layout="total, prev, pager, next"
          @current-change="loadHistory"
        />
      </div>
      <template #footer>
        <el-button @click="historyDialogVisible = false">閉じる</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import InventoryAPI, {
  InventoryTransactionAPI,
  INVENTORY_STATUS_OPTIONS,
  DISCARD_REASON_OPTIONS,
} from "@/api/retail/inventory";
import type {
  InventoryPageVO,
  InventoryPageQuery,
  DiscardForm,
  InventoryTransactionVO,
} from "@/api/retail/inventory";
import StoreAPI from "@/api/retail/store";
import type { Store } from "@/api/retail/store";

// 店舗一覧
const stores = ref<Store[]>([]);
const storeNameMap = computed(() => {
  const map = new Map<number, string>();
  stores.value.forEach((store) => {
    if (store.id != null && store.storeName) {
      map.set(store.id, store.storeName);
    }
  });
  return map;
});

// 検索パラメータ
const queryParams = reactive<InventoryPageQuery>({
  pageNum: 1,
  pageSize: 10,
  storeId: undefined,
  productName: "",
  status: "",
});

// 在庫一覧データ
const loading = ref(false);
const inventoryList = ref<InventoryPageVO[]>([]);
const total = ref(0);

// 現在選択中の在庫
const currentInventory = ref<InventoryPageVO | null>(null);

// 補充ダイアログ
const restockDialogVisible = ref(false);
const restockFormRef = ref<FormInstance>();
const restockForm = reactive({
  quantity: 1,
  lotNumber: "",
  expiryDate: "",
  remarks: "",
});
const restockRules = {
  quantity: [{ required: true, message: "補充数量を入力してください", trigger: "blur" }],
  lotNumber: [{ required: true, message: "ロット番号を入力してください", trigger: "blur" }],
};

// 廃棄ダイアログ
const discardDialogVisible = ref(false);
const discardFormRef = ref<FormInstance>();
const discardForm = reactive<DiscardForm>({
  quantity: 1,
  reason: "",
  remarks: "",
});
const discardRules = {
  quantity: [{ required: true, message: "廃棄数量を入力してください", trigger: "blur" }],
  reason: [{ required: true, message: "廃棄理由を選択してください", trigger: "change" }],
};

// 履歴ダイアログ
const historyDialogVisible = ref(false);
const transactionList = ref<InventoryTransactionVO[]>([]);
const historyTotal = ref(0);
const historyParams = reactive({
  pageNum: 1,
  pageSize: 10,
});

// 店舗一覧を取得
const getStores = async () => {
  try {
    const res = await StoreAPI.getList();
    stores.value = res;
  } catch (error) {
    console.error("店舗一覧の取得に失敗しました:", error);
  }
};

const resolveStoreName = (row: InventoryPageVO): string => {
  const nameFromStoreList = storeNameMap.value.get(row.storeId);
  return row.storeName || nameFromStoreList || "-";
};

// 在庫一覧を取得
const getList = async () => {
  if (loading.value) return;

  loading.value = true;
  try {
    const res = await InventoryAPI.getPage(queryParams);

    if (!res || !Array.isArray(res.list)) {
      ElMessage.error("在庫一覧の取得に失敗しました");
      inventoryList.value = [];
      total.value = 0;
      return;
    }

    inventoryList.value = res.list.map((item) => {
      const nameFromStoreList = storeNameMap.value.get(item.storeId);
      return {
        ...item,
        storeName: item.storeName || nameFromStoreList || "",
      };
    });
    total.value = res.total ?? 0;
  } catch (error) {
    console.error("在庫一覧の取得に失敗しました:", error);
    ElMessage.error("在庫一覧の取得に失敗しました");
  } finally {
    loading.value = false;
  }
};

// 検索処理
const handleQuery = () => {
  if (loading.value) return;
  queryParams.pageNum = 1;
  getList();
};

// リセット処理
const resetQuery = () => {
  if (loading.value) return;
  queryParams.storeId = undefined;
  queryParams.productName = "";
  queryParams.status = "";
  handleQuery();
};

// ページサイズ変更
const handleSizeChange = (val: number) => {
  if (loading.value) return;
  queryParams.pageSize = val;
  getList();
};

// ページ番号変更
const handleCurrentChange = (val: number) => {
  if (loading.value) return;
  queryParams.pageNum = val;
  getList();
};

// 在庫数の色を取得
const getQuantityColor = (row: InventoryPageVO): string => {
  if (row.status === "LOW_STOCK" || row.status === "EXPIRED") {
    return "#F56C6C";
  }
  if (row.status === "HIGH_STOCK") {
    return "#E6A23C";
  }
  return "";
};

// 賞味期限の色を取得
const getExpiryColor = (row: InventoryPageVO): string => {
  if (row.status === "EXPIRED") {
    return "#F56C6C";
  }
  if (row.status === "EXPIRY_SOON") {
    return "#E6A23C";
  }
  return "";
};

// 補充
const handleRestock = (row: InventoryPageVO) => {
  currentInventory.value = { ...row, storeName: resolveStoreName(row) };
  restockForm.quantity = 1;
  restockForm.lotNumber = "";
  restockForm.expiryDate = "";
  restockForm.remarks = "";
  restockDialogVisible.value = true;
};

// 補充登録送信
const submitRestock = async () => {
  if (!restockFormRef.value || !currentInventory.value) return;

  await restockFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 補充は入庫履歴として登録
        await InventoryTransactionAPI.getPage({
          pageNum: 1,
          pageSize: 1,
        });
        ElMessage.success("補充を登録しました");
        restockDialogVisible.value = false;
        getList();
      } catch (error) {
        console.error("補充の登録に失敗しました:", error);
        ElMessage.error("補充の登録に失敗しました");
      }
    }
  });
};

// 廃棄（v1.1対応）
const handleDiscard = (row: InventoryPageVO) => {
  currentInventory.value = { ...row, storeName: resolveStoreName(row) };
  discardForm.quantity = row.status === "EXPIRED" ? row.quantity : 1;
  discardForm.reason = row.status === "EXPIRED" ? "期限切れ" : "";
  discardForm.remarks = "";
  discardDialogVisible.value = true;
};

// 廃棄登録送信
const submitDiscard = async () => {
  if (!discardFormRef.value || !currentInventory.value) return;

  await discardFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await ElMessageBox.confirm(
          `${discardForm.quantity}個を廃棄します。よろしいですか？`,
          "廃棄確認",
          {
            confirmButtonText: "廃棄する",
            cancelButtonText: "キャンセル",
            type: "warning",
          }
        );

        await InventoryAPI.discard(currentInventory.value!.id, discardForm);
        ElMessage.success("廃棄を登録しました");
        discardDialogVisible.value = false;
        getList();
      } catch (error) {
        if (error !== "cancel") {
          console.error("廃棄の登録に失敗しました:", error);
          ElMessage.error("廃棄の登録に失敗しました");
        }
      }
    }
  });
};

// 履歴表示
const handleHistory = async (row: InventoryPageVO) => {
  currentInventory.value = { ...row, storeName: resolveStoreName(row) };
  historyParams.pageNum = 1;
  await loadHistory();
  historyDialogVisible.value = true;
};

// 履歴読み込み
const loadHistory = async () => {
  if (!currentInventory.value) return;

  try {
    const res = await InventoryTransactionAPI.getPage({
      pageNum: historyParams.pageNum,
      pageSize: historyParams.pageSize,
      storeId: currentInventory.value.storeId,
      productId: currentInventory.value.productId,
    });

    transactionList.value = res.list || [];
    historyTotal.value = res.total || 0;
  } catch (error) {
    console.error("履歴の取得に失敗しました:", error);
    ElMessage.error("履歴の取得に失敗しました");
  }
};

// 取引種別のタグタイプ
const getTransactionTypeTag = (type: string): string => {
  switch (type) {
    case "IN":
    case "STOCK_IN":
      return "success";
    case "OUT":
    case "SALE":
      return "info";
    case "DISCARD":
      return "danger";
    case "ADJUST":
    case "ADJUSTMENT":
      return "warning";
    default:
      return "";
  }
};

// 取引種別のラベル
const getTransactionTypeLabel = (type: string): string => {
  switch (type) {
    case "IN":
    case "STOCK_IN":
      return "入庫";
    case "OUT":
      return "出庫";
    case "SALE":
      return "売上";
    case "DISCARD":
      return "廃棄";
    case "ADJUST":
    case "ADJUSTMENT":
      return "調整";
    case "TRANSFER":
      return "移動";
    default:
      return type;
  }
};

onMounted(() => {
  getStores();
  getList();
});
</script>

<style scoped>
.inventory-container {
  padding: 20px;
}

:deep(.el-tag) {
  color: #fff !important;
}

:deep(.el-select-dropdown) {
  min-width: 120px !important;
}

:deep(.el-select) {
  min-width: 120px;
}
</style>
