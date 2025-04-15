<template>
  <div class="inventory-container">
    <!-- 検索フォーム -->
    <el-card shadow="never" class="mb-4">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="店舗" prop="storeId">
          <el-select v-model="queryParams.storeId" placeholder="店舗を選択" clearable>
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
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="在庫状態" prop="stockStatus">
          <el-select v-model="queryParams.stockStatus" placeholder="在庫状態を選択" clearable>
            <el-option label="在庫不足" value="low" />
            <el-option label="在庫あり" value="normal" />
            <el-option label="在庫過多" value="high" />
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

      <el-table
        v-loading="loading"
        :data="inventoryList"
        border
        style="width: 100%"
      >
        <el-table-column type="index" label="No." width="50" />
        <el-table-column prop="storeName" label="店舗名" min-width="120" />
        <el-table-column prop="productName" label="商品名" min-width="150" />
        <el-table-column prop="stock" label="在庫数" width="100" />
        <el-table-column prop="expiryDate" label="賞味期限" width="120">
          <template #default="{ row }">
            <el-tag
              :type="getExpiryDateTagType(row.expiryDate)"
              size="small"
            >
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
            <el-button
              type="primary"
              link
              @click="handleRestock(row)"
            >
              補充
            </el-button>
            <el-button
              type="primary"
              link
              @click="handleHistory(row)"
            >
              履歴
            </el-button>
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
    <el-dialog
      v-model="restockDialogVisible"
      title="商品補充"
      width="500px"
    >
      <el-form
        ref="restockForm"
        :model="restockForm"
        :rules="restockRules"
        label-width="100px"
      >
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
          />
        </el-form-item>
        <el-form-item label="賞味期限" prop="expiryDate">
          <el-date-picker
            v-model="restockForm.expiryDate"
            type="date"
            placeholder="賞味期限を選択"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";

// 検索パラメータ
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  storeId: undefined,
  productName: "",
  stockStatus: undefined,
});

// 店舗オプション
const storeOptions = ref([
  { id: 1, name: "店舗A" },
  { id: 2, name: "店舗B" },
  { id: 3, name: "店舗C" },
]);

// 在庫一覧データ
const loading = ref(false);
const inventoryList = ref([]);
const total = ref(0);

// 補充ダイアログ
const restockDialogVisible = ref(false);
const restockForm = reactive({
  id: undefined,
  productName: "",
  currentStock: 0,
  restockAmount: 1,
  expiryDate: "",
});

// バリデーションルール
const restockRules = {
  restockAmount: [
    { required: true, message: "補充数量を入力してください", trigger: "blur" },
  ],
  expiryDate: [
    { required: true, message: "賞味期限を選択してください", trigger: "change" },
  ],
};

// データ取得
const getList = async () => {
  loading.value = true;
  try {
    // TODO: APIからデータを取得する処理を実装
    // 仮のデータ
    inventoryList.value = [
      {
        id: 1,
        storeName: "店舗A",
        productName: "チキン",
        stock: 5,
        expiryDate: "2024-04-20",
        status: "low",
      },
      {
        id: 2,
        storeName: "店舗B",
        productName: "ハンバーガー",
        stock: 15,
        expiryDate: "2024-04-25",
        status: "normal",
      },
    ];
    total.value = 2;
  } catch (error) {
    console.error("データ取得エラー:", error);
  } finally {
    loading.value = false;
  }
};

// 検索処理
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

// リセット処理
const resetQuery = () => {
  queryParams.storeId = undefined;
  queryParams.productName = "";
  queryParams.stockStatus = undefined;
  handleQuery();
};

// ページサイズ変更
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val;
  getList();
};

// ページ番号変更
const handleCurrentChange = (val: number) => {
  queryParams.pageNum = val;
  getList();
};

// エクスポート処理
const handleExport = () => {
  ElMessage.success("エクスポート処理を実装してください");
};

// 賞味期限のタグタイプ取得
const getExpiryDateTagType = (date: string) => {
  const today = new Date();
  const expiryDate = new Date(date);
  const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
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
  return types[status] || "info";
};

// 在庫状態のテキスト取得
const getStockStatusText = (status: string) => {
  const texts = {
    low: "在庫不足",
    normal: "在庫あり",
    high: "在庫過多",
  };
  return texts[status] || "不明";
};

// 日付フォーマット
const formatDate = (date: string) => {
  return date.replace(/-/g, "/");
};

// 補充処理
const handleRestock = (row: any) => {
  restockForm.id = row.id;
  restockForm.productName = row.productName;
  restockForm.currentStock = row.stock;
  restockForm.restockAmount = 1;
  restockForm.expiryDate = "";
  restockDialogVisible.value = true;
};

// 履歴表示
const handleHistory = (row: any) => {
  ElMessage.success("履歴表示処理を実装してください");
};

// 補充確定
const submitRestock = () => {
  ElMessage.success("補充処理を実装してください");
  restockDialogVisible.value = false;
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
.inventory-container {
  padding: 20px;
}
</style> 