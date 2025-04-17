<template>
  <div class="restock-container">
    <!-- 入庫フォーム -->
    <el-card shadow="never" class="mb-4">
      <el-form :model="restockForm" ref="formRef" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="店舗" prop="storeId">
              <el-select v-model="restockForm.storeId" placeholder="店舗を選択" clearable>
                <el-option
                  v-for="store in storeOptions"
                  :key="store.id"
                  :label="store.name"
                  :value="store.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="商品" prop="productId">
              <el-select v-model="restockForm.productId" placeholder="商品を選択" clearable>
                <el-option
                  v-for="product in productOptions"
                  :key="product.id"
                  :label="product.name"
                  :value="product.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="入庫数" prop="quantity">
              <el-input-number v-model="restockForm.quantity" :min="1" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="賞味期限" prop="expiryDate">
              <el-date-picker
                v-model="restockForm.expiryDate"
                type="date"
                placeholder="賞味期限を選択"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="ロット番号" prop="lotNumber">
              <el-input v-model="restockForm.lotNumber" placeholder="ロット番号を入力" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="入庫タイプ" prop="restockType">
              <el-select v-model="restockForm.restockType" placeholder="入庫タイプを選択">
                <el-option label="通常入庫" value="normal" />
                <el-option label="返品入庫" value="return" />
                <el-option label="在庫調整" value="adjustment" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="備考" prop="remarks">
              <el-input
                v-model="restockForm.remarks"
                type="textarea"
                placeholder="備考を入力"
                :rows="2"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">入庫登録</el-button>
          <el-button @click="resetForm">リセット</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 入庫履歴 -->
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span>入庫履歴</span>
          <el-button type="primary" @click="handleExport">履歴エクスポート</el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="historyList"
        border
        style="width: 100%"
      >
        <el-table-column type="index" label="No." width="50" />
        <el-table-column prop="date" label="入庫日時" width="160" />
        <el-table-column prop="storeName" label="店舗" min-width="120" />
        <el-table-column prop="productName" label="商品名" min-width="150" />
        <el-table-column prop="quantity" label="入庫数" width="100" align="right" />
        <el-table-column prop="lotNumber" label="ロット番号" width="120" />
        <el-table-column prop="expiryDate" label="賞味期限" width="120" />
        <el-table-column prop="restockType" label="入庫タイプ" width="120">
          <template #default="{ row }">
            <el-tag :type="getRestockTypeTag(row.restockType)">
              {{ getRestockTypeText(row.restockType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="担当者" width="120" />
      </el-table>

      <!-- ページネーション -->
      <div class="mt-4 flex justify-end">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";

// フォームの参照
const formRef = ref<FormInstance>();

// 入庫フォーム
const restockForm = reactive({
  storeId: undefined,
  productId: undefined,
  quantity: 1,
  expiryDate: "",
  lotNumber: "",
  restockType: "normal",
  remarks: "",
});

// バリデーションルール
const rules = {
  storeId: [{ required: true, message: "店舗を選択してください", trigger: "change" }],
  productId: [{ required: true, message: "商品を選択してください", trigger: "change" }],
  quantity: [{ required: true, message: "入庫数を入力してください", trigger: "blur" }],
  expiryDate: [{ required: true, message: "賞味期限を選択してください", trigger: "change" }],
  lotNumber: [{ required: true, message: "ロット番号を入力してください", trigger: "blur" }],
  restockType: [{ required: true, message: "入庫タイプを選択してください", trigger: "change" }],
};

// 店舗オプション
const storeOptions = ref([
  { id: 1, name: "店舗A" },
  { id: 2, name: "店舗B" },
  { id: 3, name: "店舗C" },
]);

// 商品オプション
const productOptions = ref([
  { id: 1, name: "商品A" },
  { id: 2, name: "商品B" },
  { id: 3, name: "商品C" },
]);

// 入庫履歴
const loading = ref(false);
const historyList = ref([
  {
    date: "2024-03-20 10:00:00",
    storeName: "店舗A",
    productName: "商品A",
    quantity: 100,
    lotNumber: "LOT20240320-001",
    expiryDate: "2024-06-20",
    restockType: "normal",
    operator: "山田太郎",
  },
  // ... その他のダミーデータ
]);

// ページネーション
const total = ref(100);
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
});

// 入庫タイプの表示テキスト
const getRestockTypeText = (type: string) => {
  const types: Record<string, string> = {
    normal: "通常入庫",
    return: "返品入庫",
    adjustment: "在庫調整",
  };
  return types[type] || type;
};

// 入庫タイプのタグタイプ
const getRestockTypeTag = (type: string) => {
  const types: Record<string, string> = {
    normal: "",
    return: "warning",
    adjustment: "info",
  };
  return types[type] || "";
};

// フォームの送信
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success("入庫登録が完了しました");
      resetForm();
    }
  });
};

// フォームのリセット
const resetForm = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
  restockForm.quantity = 1;
  restockForm.restockType = "normal";
};

// ページサイズの変更
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val;
  // TODO: データの再取得
};

// ページ番号の変更
const handleCurrentChange = (val: number) => {
  queryParams.pageNum = val;
  // TODO: データの再取得
};

// 履歴のエクスポート
const handleExport = () => {
  ElMessage.success("入庫履歴をエクスポートしました");
};
</script>

<style scoped>
.restock-container {
  padding: 20px;
}
</style> 