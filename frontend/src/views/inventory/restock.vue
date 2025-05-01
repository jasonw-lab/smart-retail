<template>
  <div class="restock-container">
    <!-- 検索フォーム -->
    <el-card shadow="never" class="mb-4">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true">
        <el-form-item label="店舗" prop="storeId">
          <el-select v-model="queryParams.storeId" placeholder="店舗を選択" clearable style="width: 200px">
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
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="ロット番号" prop="lotNumber">
          <el-input
            v-model="queryParams.lotNumber"
            placeholder="ロット番号を入力"
            clearable
            @keyup.enter="handleQuery"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="入庫タイプ" prop="restockType">
          <el-select v-model="queryParams.restockType" placeholder="入庫タイプを選択" clearable style="width: 200px">
            <el-option label="通常入庫" value="normal" />
            <el-option label="返品入庫" value="return" />
            <el-option label="在庫調整" value="adjustment" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">検索</el-button>
          <el-button @click="resetQuery">リセット</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 入庫履歴 -->
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span>入庫一覧</span>
          <el-button icon="download" @click="handleExport">エクスポート</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="historyList" border style="width: 100%">
        <el-table-column type="index" label="No." width="50" />
        <el-table-column prop="createTime" label="登録日時" width="160" />
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
        <el-table-column prop="shippingTime" label="入庫日時" width="160" />
        <el-table-column prop="operator" label="担当者" width="120" />
        <el-table-column prop="remarks" label="備考" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              icon="edit"
              link
              size="small"
              @click="handleUpdate(scope.row)"
            >
              編集
            </el-button>
          </template>
        </el-table-column>
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

    <!-- 更新ダイアログ -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="700px"
      append-to-body
    >
      <el-form
        ref="updateForm"
        :model="updateFormData"
        :rules="updateRules"
        label-width="100px"
        class="update-form"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="店舗" class="form-item">
              <span class="form-value">{{ updateFormData.storeName }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品名" class="form-item">
              <span class="form-value">{{ updateFormData.productName }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="入庫数" class="form-item">
              <span class="form-value">{{ updateFormData.quantity }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入庫タイプ" class="form-item">
              <span class="form-value">{{ getRestockTypeText(updateFormData.restockType) }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="ステータス" prop="status" class="form-item">
              <el-select
                v-model="updateFormData.status"
                placeholder="ステータスを選択"
                style="width: 100%"
              >
                <el-option label="未入庫" value="pending" />
                <el-option label="入庫済み" value="completed" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入庫日時" prop="shippingTime" class="form-item">
              <el-date-picker
                v-model="updateFormData.shippingTime"
                type="datetime"
                placeholder="入庫日時を選択"
                style="width: 100%"
                :disabled="updateFormData.status !== 'completed'"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="備考" prop="remarks" class="form-item">
              <el-input
                v-model="updateFormData.remarks"
                type="textarea"
                placeholder="備考を入力"
                :rows="2"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitUpdate">確定</el-button>
          <el-button @click="cancelUpdate">キャンセル</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";
import InboundInventoryAPI from "@/api/retail/inventory/in";
import type { InboundItem, InboundListParams, UpdateInboundDto } from "@/api/retail/inventory/in";
import { exportToCSV } from "@/utils/exportCsv";

// 検索フォームの参照
const queryFormRef = ref<FormInstance>();

// 検索パラメータ
const queryParams = reactive<InboundListParams>({
  page: 1,
  pageSize: 10,
  storeId: undefined,
  productName: "",
  lotNumber: "",
  restockType: undefined,
});

// 店舗オプション
const storeOptions = ref([
  { id: 1, name: "東京本店" },
  { id: 2, name: "横浜駅前店" },
  { id: 3, name: "金沢店" },
]);

// 入庫履歴
const loading = ref(false);
const historyList = ref<InboundItem[]>([]);
const total = ref(0);

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

// 検索処理
const handleQuery = async () => {
  loading.value = true;
  try {
    const response = await InboundInventoryAPI.getList(queryParams);
    console.log("API Response:", response);
    // if (response?.data) {
    //   console.log("Response data:", response.data);
      historyList.value = response.list || [];
      total.value = response.total || 0;
    // } else {
    //   console.warn("Invalid response format:", response);
    //   historyList.value = [];
    //   total.value = 0;
    // }
  } catch (error) {
    console.error("Failed to fetch inbound list:", error);
    ElMessage.error("入庫履歴の取得に失敗しました");
    historyList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 検索条件のリセット
const resetQuery = () => {
  if (!queryFormRef.value) return;
  queryFormRef.value.resetFields();
  handleQuery();
};

// ページサイズの変更
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val;
  handleQuery();
};

// ページ番号の変更
const handleCurrentChange = (val: number) => {
  queryParams.page = val;
  handleQuery();
};

// 履歴のエクスポート
const handleExport = async () => {
  try {
    const params = { ...queryParams, page: 1, pageSize: 1000 };
    const response = await InboundInventoryAPI.getList(params);
    const data = response.list || [];
    exportToCSV(data, [
      { key: "createTime", label: "登録日時" },
      { key: "storeName", label: "店舗" },
      { key: "productName", label: "商品名" },
      { key: "quantity", label: "入庫数" },
      { key: "lotNumber", label: "ロット番号" },
      { key: "expiryDate", label: "賞味期限" },
      { key: "restockType", label: "入庫タイプ" },
      { key: "shippingTime", label: "入庫日時" },
      { key: "operator", label: "担当者" },
      { key: "remarks", label: "備考" },
    ], "restock-history.csv");
  } catch (e) {
    ElMessage.error("エクスポートに失敗しました");
  }
};

// 更新フォーム
const updateForm = ref<FormInstance>();
const updateFormData = reactive<UpdateInboundDto>({
  id: 0,
  storeName: "",
  productName: "",
  quantity: 0,
  restockType: "",
  status: "",
  shippingTime: "",
  remarks: "",
});

// ダイアログ
const dialog = reactive({
  title: "",
  visible: false,
});

// バリデーションルール
const updateRules = {
  status: [{ required: true, message: "ステータスを選択してください", trigger: "change" }],
  shippingTime: [
    {
      required: true,
      message: "入庫日時を選択してください",
      trigger: "change",
      validator: (rule: any, value: any, callback: any) => {
        if (updateFormData.status === "completed" && !value) {
          callback(new Error("入庫日時を選択してください"));
        } else {
          callback();
        }
      },
    },
  ],
};

// ステータス変更時の入庫日時制御
watch(
  () => updateFormData.status,
  (newStatus) => {
    if (newStatus === "pending") {
      updateFormData.shippingTime = formatDateTime(new Date());
    } else if (newStatus !== "completed") {
      updateFormData.shippingTime = "";
    }
  }
);

// 更新処理
const handleUpdate = (row: InboundItem) => {
  dialog.title = "入庫情報更新";
  dialog.visible = true;
  Object.assign(updateFormData, row);
  // 未入庫の場合は現在時刻をデフォルト値として設定
  if (updateFormData.status === "pending") {
    updateFormData.shippingTime = formatDateTime(new Date());
  }
};

// 更新送信
const submitUpdate = async () => {
  if (!updateForm.value) return;
  await updateForm.value.validate(async (valid) => {
    if (valid) {
      try {
        await InboundInventoryAPI.update(updateFormData);
        ElMessage.success("更新成功");
        dialog.visible = false;
        handleQuery();
      } catch (error) {
        console.error("Failed to update inbound item:", error);
        ElMessage.error("更新に失敗しました");
      }
    }
  });
};

// 更新キャンセル
const cancelUpdate = () => {
  dialog.visible = false;
  updateForm.value?.resetFields();
};

// 日時フォーマット関数
const formatDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

onMounted(() => {
  // 初期データの取得
  handleQuery();
});
</script>

<style scoped>
.restock-container {
  padding: 20px;
}
.search-form {
  margin-bottom: 20px;
}
.update-form {
  padding: 20px 10px;
}
.form-item {
  margin-bottom: 20px;
}
.form-item :deep(.el-form-item__label) {
  text-align: left;
  font-weight: 500;
  color: #606266;
  padding-right: 12px;
}
.form-value {
  display: inline-block;
  min-height: 32px;
  line-height: 32px;
  color: #606266;
  padding: 0 8px;
}
.dialog-footer {
  padding-top: 20px;
  text-align: right;
  border-top: 1px solid #dcdfe6;
  margin-top: 10px;
}
</style>
