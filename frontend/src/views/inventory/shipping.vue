<template>
  <div class="shipping-container">
    <!-- 出庫フォーム -->
    <el-card shadow="never" class="mb-4">
      <el-form :model="shippingForm" ref="formRef" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="店舗" prop="storeId">
              <el-select v-model="shippingForm.storeId" placeholder="店舗を選択" clearable>
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
              <el-select v-model="shippingForm.productId" placeholder="商品を選択" clearable>
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
            <el-form-item label="出庫数" prop="quantity">
              <el-input-number v-model="shippingForm.quantity" :min="1" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="出庫タイプ" prop="shippingType">
              <el-select v-model="shippingForm.shippingType" placeholder="出庫タイプを選択">
                <el-option label="通常出庫" value="normal" />
                <el-option label="廃棄" value="disposal" />
                <el-option label="在庫調整" value="adjustment" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="担当者" prop="operator">
              <el-input v-model="shippingForm.operator" placeholder="担当者名を入力" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="備考" prop="remarks">
              <el-input
                v-model="shippingForm.remarks"
                type="textarea"
                placeholder="備考を入力"
                :rows="2"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">出庫登録</el-button>
          <el-button @click="resetForm">リセット</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 出庫履歴 -->
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span>出庫履歴</span>
          <el-button type="primary" @click="handleExport">履歴エクスポート</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="historyList" border style="width: 100%">
        <el-table-column type="index" label="No." width="50" />
        <el-table-column prop="date" label="出庫日時" width="160" />
        <el-table-column prop="storeName" label="店舗" min-width="120" />
        <el-table-column prop="productName" label="商品名" min-width="150" />
        <el-table-column prop="quantity" label="出庫数" width="100" align="right" />
        <el-table-column prop="shippingType" label="出庫タイプ" width="120">
          <template #default="{ row }">
            <el-tag :type="getShippingTypeTag(row.shippingType)">
              {{ getShippingTypeText(row.shippingType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="担当者" width="120" />
        <el-table-column prop="remarks" label="備考" min-width="200" show-overflow-tooltip />
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

// 出庫フォーム
const shippingForm = reactive({
  storeId: undefined,
  productId: undefined,
  quantity: 1,
  shippingType: "normal",
  operator: "",
  remarks: "",
});

// バリデーションルール
const rules = {
  storeId: [{ required: true, message: "店舗を選択してください", trigger: "change" }],
  productId: [{ required: true, message: "商品を選択してください", trigger: "change" }],
  quantity: [{ required: true, message: "出庫数を入力してください", trigger: "blur" }],
  shippingType: [{ required: true, message: "出庫タイプを選択してください", trigger: "change" }],
  operator: [{ required: true, message: "担当者名を入力してください", trigger: "blur" }],
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

// 出庫履歴
const loading = ref(false);
const historyList = ref([
  {
    date: "2024-03-20 10:00:00",
    storeName: "店舗A",
    productName: "商品A",
    quantity: 50,
    shippingType: "normal",
    operator: "山田太郎",
    remarks: "通常出庫",
  },
  // ... その他のダミーデータ
]);

// ページネーション
const total = ref(100);
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
});

// 出庫タイプの表示テキスト
const getShippingTypeText = (type: string) => {
  const types: Record<string, string> = {
    normal: "通常出庫",
    disposal: "廃棄",
    adjustment: "在庫調整",
  };
  return types[type] || type;
};

// 出庫タイプのタグタイプ
const getShippingTypeTag = (type: string): "warning" | "danger" | "info" | undefined => {
  const types: Record<string, "warning" | "danger" | "info"> = {
    normal: "info",
    disposal: "danger",
    adjustment: "warning",
  };
  return types[type];
};

// フォームの送信
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success("出庫登録が完了しました");
      resetForm();
    }
  });
};

// フォームのリセット
const resetForm = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
  shippingForm.quantity = 1;
  shippingForm.shippingType = "normal";
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
  ElMessage.success("出庫履歴をエクスポートしました");
};
</script>

<style scoped>
.shipping-container {
  padding: 20px;
}
</style> 