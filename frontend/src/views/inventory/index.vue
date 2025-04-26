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
            style="width: 200px"
          >
            <el-option
              v-for="store in storeOptions"
              :key="store.id"
              :label="store.name"
              :value="store.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品名" prop="productName">
          <el-input
            v-model="queryParams.productName"
            placeholder="商品名を入力"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="在庫状態" prop="stockStatus">
          <el-select
            v-model="queryParams.stockStatus"
            placeholder="在庫状態を選択"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="option in stockStatusOptions"
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
          <el-button type="primary" @click="handleExport">エクスポート</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="inventoryList" border style="width: 100%">
        <el-table-column type="index" label="No." width="50" />
        <el-table-column prop="storeName" label="店舗名" min-width="120" />
        <el-table-column prop="productName" label="商品名" min-width="150" />
        <el-table-column prop="stock" label="在庫数" width="100" />
        <el-table-column prop="expiryDate" label="賞味期限" width="120">
          <template #default="{ row }">
            <el-tag :type="getExpiryDateTagType(row.expiryDate)" size="small">
              {{ formatDate(row.expiryDate) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状態" width="100">
          <template #default="{ row }">
            <el-tag :type="getStockStatusType(row.status)" size="small">
              {{ getStockStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleRestock(row)">補充</el-button>
            <el-button type="primary" link @click="handleHistory(row)">履歴</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- ページネーション -->
      <div class="mt-4 flex-x-end">
        <el-pagination
          v-model:current-page="queryParams.page"
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
    <el-dialog v-model="restockDialogVisible" title="商品補充" width="500px">
      <el-form ref="restockFormRef" :model="restockForm" :rules="restockRules" label-width="100px">
        <el-form-item label="商品名">
          <span>{{ restockForm.productName }}</span>
        </el-form-item>
        <el-form-item label="現在の在庫">
          <span>{{ restockForm.currentStock }}</span>
        </el-form-item>
        <el-form-item label="補充数量" prop="restockAmount">
          <el-input-number
            v-model="restockForm.restockAmount"
            :min="1"
            :max="100"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="賞味期限" prop="expiryDate">
          <el-date-picker
            v-model="restockForm.expiryDate"
            type="date"
            placeholder="賞味期限を選択"
            style="width: 200px"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="restockDialogVisible = false">キャンセル</el-button>
          <el-button type="primary" @click="submitRestock">確定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 履歴ダイアログ -->
    <el-dialog v-model="historyDialogVisible" title="補充履歴" width="800px">
      <el-table :data="historyList" border style="width: 100%">
        <el-table-column type="index" label="No." width="50" />
        <el-table-column prop="date" label="日時" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="種類" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === '入庫' ? 'success' : 'warning'">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="operator" label="操作者" width="120" />
        <el-table-column prop="reason" label="備考" min-width="200" />
      </el-table>
      <!-- 履歴のページネーション -->
      <div class="mt-4 flex-x-end">
        <el-pagination
          v-model:current-page="historyQueryParams.page"
          v-model:page-size="historyQueryParams.pageSize"
          :total="historyTotal"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total-text="'全'"
          :size-text="'件表示'"
          :prev-text="'前へ'"
          :next-text="'次へ'"
          :jumper-text="'ページへ'"
          :pager-count="5"
          :page-size-text="'件/ページ'"
          :page-sizes-text="'件/ページ'"
          :page-count-text="'ページ'"
          @size-change="handleHistorySizeChange"
          @current-change="handleHistoryCurrentChange"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { InventoryAPI, type Inventory, type HistoryItem } from "@/api/retail/inventory";
import dayjs from "dayjs";

// 検索パラメータ
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  storeId: undefined as number | undefined,
  productName: "",
  stockStatus: undefined as "low" | "normal" | "high" | undefined,
});

// 店舗オプション
const storeOptions = ref([
  { id: 1, name: "東京本店" },
  { id: 2, name: "横浜駅前店" },
  { id: 3, name: "金沢店" },
]);

// 在庫状態オプション
const stockStatusOptions = [
  { label: "在庫不足", value: "low" },
  { label: "在庫あり", value: "normal" },
  { label: "在庫過多", value: "high" },
];

// 在庫一覧データ
const loading = ref(false);
const inventoryList = ref<Inventory[]>([]);
const total = ref(0);

// 補充ダイアログ
const restockDialogVisible = ref(false);
const restockFormRef = ref();
const restockForm = reactive({
  id: undefined as number | undefined,
  productName: "",
  currentStock: 0,
  restockAmount: 1,
  expiryDate: "",
});

// バリデーションルール
const restockRules = {
  restockAmount: [
    { required: true, message: "補充数量を入力してください", trigger: "blur" },
    {
      type: "number",
      min: 1,
      max: 100,
      message: "1から100の間で入力してください",
      trigger: "blur",
    },
  ],
  expiryDate: [{ required: true, message: "賞味期限を選択してください", trigger: "change" }],
};

// 履歴データ
const historyDialogVisible = ref(false);
const historyList = ref<HistoryItem[]>([]);
const historyTotal = ref(0);
const historyQueryParams = reactive({
  page: 1,
  pageSize: 10,
});

// データ取得
const getList = async () => {
  if (loading.value) return;

  loading.value = true;
  try {
    const data = await InventoryAPI.getList(queryParams);
    inventoryList.value = data.list;
    total.value = data.total;
  } catch (error) {
    console.error("Failed to fetch inventory list:", error);
    ElMessage.error("在庫一覧の取得に失敗しました");
  } finally {
    loading.value = false;
  }
};

// 検索処理
const handleQuery = () => {
  if (loading.value) return;
  queryParams.page = 1;
  getList();
};

// リセット処理
const resetQuery = () => {
  if (loading.value) return;
  queryParams.storeId = undefined;
  queryParams.productName = "";
  queryParams.stockStatus = undefined;
  handleQuery();
};

// ページサイズ変更
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val;
  handleQuery();
};

// ページ番号変更
const handleCurrentChange = (val: number) => {
  queryParams.page = val;
  handleQuery();
};

// エクスポート処理
const handleExport = () => {
  ElMessage.success("エクスポート処理を実装してください");
};

// 賞味期限のタグタイプ取得
const getExpiryDateTagType = (date: string) => {
  const today = dayjs();
  const expiryDate = dayjs(date);
  const diffDays = expiryDate.diff(today, "day");

  if (diffDays < 0) return "danger";
  if (diffDays <= 7) return "warning";
  return "success";
};

// 在庫状態のタグタイプ取得
const getStockStatusType = (status: string) => {
  const types = {
    low: "danger",
    normal: "success",
    high: "warning",
  };
  return types[status as keyof typeof types] || "info";
};

// 在庫状態のテキスト取得
const getStockStatusText = (status: string) => {
  const option = stockStatusOptions.find((opt) => opt.value === status);
  return option?.label || "不明";
};

// 日付フォーマット
const formatDate = (date: string) => {
  return dayjs(date).format("YYYY-MM-DD");
};

// 補充処理
const handleRestock = (row: Inventory) => {
  restockForm.id = row.id;
  restockForm.productName = row.productName;
  restockForm.currentStock = row.stock;
  restockForm.restockAmount = 1;
  restockForm.expiryDate = "";
  restockDialogVisible.value = true;
};

// 履歴表示
const handleHistory = async (row: Inventory) => {
  try {
    const data = await InventoryAPI.getHistory(row.id, historyQueryParams);
    console.log("History response:", data);
    historyList.value = data.list;
    historyTotal.value = data.total;
    historyDialogVisible.value = true;
  } catch (error) {
    console.error("Failed to fetch history:", error);
    ElMessage.error("履歴の取得に失敗しました");
  }
};

// 履歴のページサイズ変更
const handleHistorySizeChange = (val: number) => {
  historyQueryParams.pageSize = val;
  handleHistory({ id: historyList.value[0]?.id } as Inventory);
};

// 履歴のページ番号変更
const handleHistoryCurrentChange = (val: number) => {
  historyQueryParams.page = val;
  handleHistory({ id: historyList.value[0]?.id } as Inventory);
};

// 補充確定
const submitRestock = async () => {
  if (!restockFormRef.value) return;
  await restockFormRef.value.validate(async (valid: boolean) => {
    if (valid && restockForm.id) {
      try {
        await InventoryAPI.restock({
          id: restockForm.id,
          amount: restockForm.restockAmount,
          expiryDate: restockForm.expiryDate,
        });
        ElMessage.success("補充処理が完了しました");
        restockDialogVisible.value = false;
        handleQuery();
      } catch (error) {
        console.error("Failed to restock:", error);
        ElMessage.error("補充処理に失敗しました");
      }
    }
  });
};

// 日時フォーマット
const formatDateTime = (date: string) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
.inventory-container {
  padding: 20px;
}

:deep(.el-select) {
  width: 200px;
}

:deep(.el-input-number) {
  width: 200px;
}

:deep(.el-date-picker) {
  width: 200px;
}
</style>
