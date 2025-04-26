<template>
  <div class="shipping-container">
    <!-- 検索フォーム -->
    <el-card shadow="never" class="mb-4">
      <el-form :model="queryParams" ref="queryForm" :inline="true" class="search-form">
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
        <el-form-item label="商品" prop="productId">
          <el-select
            v-model="queryParams.productId"
            placeholder="商品を選択"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="product in productOptions"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="ステータス" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="ステータスを選択"
            clearable
            style="width: 200px"
          >
            <el-option label="未出庫" value="pending" />
            <el-option label="出庫済み" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">検索</el-button>
          <el-button @click="resetQuery">リセット</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 出庫一覧 -->
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span>出庫一覧</span>
          <el-button icon="download" @click="handleExport">エクスポート</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="shippingList" border style="width: 100%">
        <el-table-column type="index" label="No." width="50" />
        <el-table-column prop="createTime" label="登録日時" width="160" />
        <el-table-column prop="storeName" label="店舗" min-width="120" />
        <el-table-column prop="productName" label="商品名" min-width="150" />
        <el-table-column prop="quantity" label="出庫数" width="100" align="right" />
        <el-table-column prop="outboundType" label="出庫タイプ" width="120">
          <template #default="{ row }">
            <el-tag :type="getOutboundTypeTag(row.outboundType)">
              {{ row.outboundType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="ステータス" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : 'warning'">
              {{ row.status === 'completed' ? '出庫済み' : '未出庫' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="shippingTime" label="出庫日時" width="160" />
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
            <el-form-item label="出庫数" class="form-item">
              <span class="form-value">{{ updateFormData.quantity }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出庫タイプ" class="form-item">
              <span class="form-value">{{ getShippingTypeText(updateFormData.outboundType) }}</span>
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
                <el-option label="未出庫" value="pending" />
                <el-option label="出庫済み" value="completed" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出庫日時" prop="shippingTime" class="form-item">
              <el-date-picker
                v-model="updateFormData.shippingTime"
                type="datetime"
                placeholder="出庫日時を選択"
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
import OutboundInventoryAPI from "@/api/retail/inventory/out";
import type { OutboundItem, OutboundListParams, CreateOutboundDto, UpdateOutboundDto } from "@/api/retail/inventory/out";

// 検索フォーム
const queryForm = ref<FormInstance>();
const queryParams = reactive<OutboundListParams>({
  page: 1,
  pageSize: 10,
  storeId: undefined,
  productName: "",
  lotNumber: "",
  outboundType: undefined,
});

// 更新フォーム
const updateForm = ref<FormInstance>();
const updateFormData = reactive<UpdateOutboundDto>({
  id: undefined,
  storeName: "",
  productName: "",
  quantity: 0,
  outboundType: "",
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
      message: "出庫日時を選択してください",
      trigger: "change",
      validator: (rule: any, value: any, callback: any) => {
        if (updateFormData.status === "completed" && !value) {
          callback(new Error("出庫日時を選択してください"));
        } else {
          callback();
        }
      },
    },
  ],
};

// ステータス変更時の出庫日時制御
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

// 店舗オプション
const storeOptions = ref([
  { id: 1, name: "東京本店" },
  { id: 2, name: "横浜駅前店" },
  { id: 3, name: "金沢店" },
]);

// 商品オプション
const productOptions = ref([
  { id: 1, name: "商品A" },
  { id: 2, name: "商品B" },
  { id: 3, name: "商品C" },
]);

// 出庫一覧
const loading = ref(false);
const shippingList = ref<OutboundItem[]>([]);
const total = ref(0);

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
const getOutboundTypeTag = (type: string) => {
  switch (type) {
    case "通常出庫":
      return "primary";
    case "返品出庫":
      return "warning";
    case "調整出庫":
      return "danger";
    default:
      return "info";
  }
};

// 検索
const handleQuery = async () => {
  loading.value = true;
  try {
    const response = await OutboundInventoryAPI.getList(queryParams);
    console.log("API Response:", response); // デバッグ用
    if (response && Array.isArray(response.list)) {
      shippingList.value = response.list;
      total.value = response.total;
    } else {
      console.warn("Invalid response format:", response);
      shippingList.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error("Failed to fetch outbound list:", error);
    ElMessage.error("出庫一覧の取得に失敗しました");
    shippingList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// リセット
const resetQuery = () => {
  queryForm.value?.resetFields();
  handleQuery();
};

// 更新
const handleUpdate = (row: OutboundItem) => {
  dialog.title = "出庫情報更新";
  dialog.visible = true;
  Object.assign(updateFormData, row);
  // 未出庫の場合は現在時刻をデフォルト値として設定
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
        await OutboundInventoryAPI.update(updateFormData);
        ElMessage.success("更新成功");
        dialog.visible = false;
        handleQuery();
      } catch (error) {
        console.error("Failed to update outbound item:", error);
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

// エクスポート
const handleExport = () => {
  ElMessage.success("出庫履歴をエクスポートしました");
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
.shipping-container {
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
