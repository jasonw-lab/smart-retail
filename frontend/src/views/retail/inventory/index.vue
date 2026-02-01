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
            filterable
            style="width: 200px"
          >
            <el-option
              v-for="store in storeList"
              :key="store.id"
              :label="store.storeName"
              :value="store.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="ロット番号" prop="lotNumber">
          <el-input
            v-model="queryParams.lotNumber"
            placeholder="ロット番号を入力"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="在庫状態" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="状態を選択"
            clearable
            style="width: 150px"
          >
            <el-option label="在庫切れ" value="low" />
            <el-option label="正常" value="normal" />
            <el-option label="在庫過多" value="high" />
            <el-option label="期限切れ" value="expired" />
          </el-select>
        </el-form-item>
        <el-form-item label="保管場所" prop="location">
          <el-input
            v-model="queryParams.location"
            placeholder="保管場所を入力"
            clearable
            @keyup.enter="handleQuery"
          />
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
          <el-button type="warning" @click="handleDetectAlerts">アラート検出</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="inventoryList" border style="width: 100%">
        <el-table-column type="index" label="No." width="60" />
        <el-table-column prop="storeName" label="店舗名" width="150" />
        <el-table-column prop="productCode" label="商品コード" width="120" />
        <el-table-column prop="productName" label="商品名" min-width="180" show-overflow-tooltip />
        <el-table-column prop="lotNumber" label="ロット番号" width="150" />
        <el-table-column prop="quantity" label="在庫数" width="100" align="right">
          <template #default="{ row }">
            <span :class="getQuantityClass(row)">{{ row.quantity }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="minStock" label="最小在庫" width="100" align="right" />
        <el-table-column prop="maxStock" label="最大在庫" width="100" align="right" />
        <el-table-column prop="expiryDate" label="賞味期限" width="120" />
        <el-table-column prop="location" label="保管場所" width="120" />
        <el-table-column prop="status" label="状態" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleReplenish(row)">補充</el-button>
            <el-button type="info" link @click="handleViewHistory(row)">履歴</el-button>
            <el-button type="success" link @click="handleViewDetail(row)">詳細</el-button>
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

    <!-- 在庫補充ダイアログ -->
    <el-dialog
      v-model="replenishDialogVisible"
      title="在庫補充"
      width="500px"
    >
      <el-form ref="replenishFormRef" :model="replenishForm" :rules="replenishRules" label-width="120px">
        <el-form-item label="商品名">
          <el-input :value="currentInventory?.productName" disabled />
        </el-form-item>
        <el-form-item label="ロット番号">
          <el-input :value="currentInventory?.lotNumber" disabled />
        </el-form-item>
        <el-form-item label="現在在庫数">
          <el-input :value="currentInventory?.quantity" disabled />
        </el-form-item>
        <el-form-item label="補充数量" prop="quantity">
          <el-input-number
            v-model="replenishForm.quantity"
            :min="1"
            :max="10000"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="補充理由" prop="reason">
          <el-input
            v-model="replenishForm.reason"
            type="textarea"
            :rows="3"
            placeholder="補充理由を入力"
          />
        </el-form-item>
        <el-form-item label="担当者" prop="operator">
          <el-input v-model="replenishForm.operator" placeholder="担当者名を入力" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="replenishDialogVisible = false">キャンセル</el-button>
        <el-button type="primary" @click="submitReplenish">確定</el-button>
      </template>
    </el-dialog>

    <!-- 在庫履歴ダイアログ -->
    <el-dialog
      v-model="historyDialogVisible"
      title="在庫履歴"
      width="800px"
    >
      <el-table v-loading="historyLoading" :data="historyList" border>
        <el-table-column type="index" label="No." width="60" />
        <el-table-column prop="type" label="操作タイプ" width="120">
          <template #default="{ row }">
            <el-tag :type="getHistoryTypeTag(row.type)">
              {{ getHistoryTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="100" align="right">
          <template #default="{ row }">
            <span :style="{ color: row.quantity > 0 ? 'green' : 'red' }">
              {{ row.quantity > 0 ? '+' : '' }}{{ row.quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="操作日時" width="180" />
        <el-table-column prop="reason" label="理由" min-width="150" show-overflow-tooltip />
        <el-table-column prop="operator" label="担当者" width="100" />
      </el-table>
    </el-dialog>

    <!-- 在庫詳細ダイアログ -->
    <el-dialog
      v-model="detailDialogVisible"
      title="在庫詳細"
      width="600px"
    >
      <el-descriptions :column="2" border v-if="currentInventory">
        <el-descriptions-item label="店舗名">{{ currentInventory.storeName }}</el-descriptions-item>
        <el-descriptions-item label="商品コード">{{ currentInventory.productCode }}</el-descriptions-item>
        <el-descriptions-item label="商品名" :span="2">{{ currentInventory.productName }}</el-descriptions-item>
        <el-descriptions-item label="ロット番号">{{ currentInventory.lotNumber }}</el-descriptions-item>
        <el-descriptions-item label="在庫数">
          <span :class="getQuantityClass(currentInventory)">{{ currentInventory.quantity }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="最小在庫">{{ currentInventory.minStock || '-' }}</el-descriptions-item>
        <el-descriptions-item label="最大在庫">{{ currentInventory.maxStock || '-' }}</el-descriptions-item>
        <el-descriptions-item label="賞味期限">{{ currentInventory.expiryDate }}</el-descriptions-item>
        <el-descriptions-item label="保管場所">{{ currentInventory.location || '-' }}</el-descriptions-item>
        <el-descriptions-item label="在庫状態">
          <el-tag :type="getStatusType(currentInventory.status)">
            {{ getStatusLabel(currentInventory.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最終棚卸日">{{ currentInventory.lastCountDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="備考" :span="2">{{ currentInventory.remarks || '-' }}</el-descriptions-item>
        <el-descriptions-item label="作成日時">{{ currentInventory.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新日時">{{ currentInventory.updateTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import { InventoryAPI, type Inventory, type InventoryQueryParams, type ReplenishForm, type InventoryHistory } from '@/api/retail/inventory';
import StoreAPI, { type Store } from '@/api/retail/store';

// データ
const loading = ref(false);
const historyLoading = ref(false);
const inventoryList = ref<Inventory[]>([]);
const storeList = ref<Store[]>([]);
const historyList = ref<InventoryHistory[]>([]);
const total = ref(0);
const currentInventory = ref<Inventory | null>(null);

// ダイアログ表示フラグ
const replenishDialogVisible = ref(false);
const historyDialogVisible = ref(false);
const detailDialogVisible = ref(false);

// クエリパラメータ
const queryParams = reactive<InventoryQueryParams>({
  pageNum: 1,
  pageSize: 10,
});

// 補充フォーム
const replenishForm = reactive<ReplenishForm>({
  quantity: 1,
  reason: '',
  operator: '',
});

// フォーム参照
const queryForm = ref<FormInstance>();
const replenishFormRef = ref<FormInstance>();

// バリデーションルール
const replenishRules = {
  quantity: [
    { required: true, message: '補充数量を入力してください', trigger: 'blur' },
    { type: 'number' as const, min: 1, message: '補充数量は1以上である必要があります', trigger: 'blur' },
  ],
};

// 初期化
onMounted(() => {
  loadStoreList();
  loadInventoryList();
});

// 店舗一覧取得
const loadStoreList = async () => {
  try {
    const data = await StoreAPI.getList();
    storeList.value = data;
  } catch (error) {
    console.error('店舗一覧の取得に失敗しました:', error);
  }
};

// 在庫一覧取得
const loadInventoryList = async () => {
  loading.value = true;
  try {
    const data = await InventoryAPI.getPage(queryParams);
    inventoryList.value = data.list;
    total.value = data.total;
  } catch (error) {
    ElMessage.error('在庫一覧の取得に失敗しました');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 検索
const handleQuery = () => {
  queryParams.pageNum = 1;
  loadInventoryList();
};

// リセット
const resetQuery = () => {
  queryForm.value?.resetFields();
  handleQuery();
};

// ページサイズ変更
const handleSizeChange = () => {
  loadInventoryList();
};

// ページ変更
const handleCurrentChange = () => {
  loadInventoryList();
};

// 在庫補充
const handleReplenish = (row: Inventory) => {
  currentInventory.value = row;
  replenishForm.quantity = 1;
  replenishForm.reason = '';
  replenishForm.operator = '';
  replenishDialogVisible.value = true;
};

// 補充実行
const submitReplenish = async () => {
  if (!replenishFormRef.value) return;

  await replenishFormRef.value.validate(async (valid) => {
    if (!valid) return;

    try {
      await InventoryAPI.replenish(currentInventory.value!.id, replenishForm);
      ElMessage.success('在庫補充が完了しました');
      replenishDialogVisible.value = false;
      loadInventoryList();
    } catch (error) {
      ElMessage.error('在庫補充に失敗しました');
      console.error(error);
    }
  });
};

// 在庫履歴表示
const handleViewHistory = async (row: Inventory) => {
  currentInventory.value = row;
  historyDialogVisible.value = true;
  historyLoading.value = true;

  try {
    const data = await InventoryAPI.getHistory(row.id);
    historyList.value = data;
  } catch (error) {
    ElMessage.error('在庫履歴の取得に失敗しました');
    console.error(error);
  } finally {
    historyLoading.value = false;
  }
};

// 在庫詳細表示
const handleViewDetail = (row: Inventory) => {
  currentInventory.value = row;
  detailDialogVisible.value = true;
};

// アラート検出
const handleDetectAlerts = async () => {
  try {
    await ElMessageBox.confirm(
      '在庫アラート検出を実行しますか？',
      '確認',
      {
        confirmButtonText: '実行',
        cancelButtonText: 'キャンセル',
        type: 'warning',
      }
    );

    await InventoryAPI.detectAlerts();
    ElMessage.success('アラート検出が完了しました');
    loadInventoryList();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('アラート検出に失敗しました');
      console.error(error);
    }
  }
};

// 在庫状態のタグタイプ
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    low: 'danger',
    normal: 'success',
    high: 'warning',
    expired: 'info',
  };
  return typeMap[status] || '';
};

// 在庫状態のラベル
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    low: '在庫切れ',
    normal: '正常',
    high: '在庫過多',
    expired: '期限切れ',
  };
  return labelMap[status] || status;
};

// 在庫数のクラス
const getQuantityClass = (row: Inventory) => {
  if (row.status === 'low') return 'text-danger';
  if (row.status === 'high') return 'text-warning';
  if (row.status === 'expired') return 'text-info';
  return '';
};

// 履歴タイプのタグ
const getHistoryTypeTag = (type: string) => {
  const typeMap: Record<string, any> = {
    replenish: 'success',
    adjust: 'warning',
    sale: 'info',
    return: 'primary',
  };
  return typeMap[type] || '';
};

// 履歴タイプのラベル
const getHistoryTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    replenish: '補充',
    adjust: '調整',
    sale: '販売',
    return: '返品',
  };
  return labelMap[type] || type;
};
</script>

<style scoped lang="scss">
.inventory-container {
  padding: 20px;
}

.text-danger {
  color: #f56c6c;
  font-weight: bold;
}

.text-warning {
  color: #e6a23c;
  font-weight: bold;
}

.text-info {
  color: #909399;
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
</style>
