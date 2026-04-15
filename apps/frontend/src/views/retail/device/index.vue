<template>
  <div class="device-container">
    <!-- 検索フォーム -->
    <el-card shadow="never" class="mb-4">
      <el-form ref="queryForm" :model="queryParams" :inline="true">
        <el-form-item label="店舗" prop="storeId">
          <el-select
            v-model="queryParams.storeId"
            placeholder="店舗を選択"
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
        <el-form-item label="デバイス種別" prop="deviceType">
          <el-select
            v-model="queryParams.deviceType"
            placeholder="種別を選択"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="option in DEVICE_TYPE_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状態" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="状態を選択"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="option in DEVICE_STATUS_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="デバイス名" prop="deviceName">
          <el-input
            v-model="queryParams.deviceName"
            placeholder="デバイス名を入力"
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

    <!-- デバイス一覧 -->
    <el-card shadow="never">
      <template #header>
        <div class="flex-x-between">
          <span>デバイス一覧</span>
          <el-button type="primary" @click="handleAdd">新規登録</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="deviceList" border style="width: 100%">
        <el-table-column type="index" label="No." width="60" />
        <el-table-column prop="storeName" label="店舗名" min-width="120" />
        <el-table-column prop="deviceName" label="デバイス名" min-width="150" />
        <el-table-column prop="deviceType" label="デバイス種別" width="140">
          <template #default="{ row }">
            <span>{{ getDeviceTypeLabel(row.deviceType) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状態" width="130">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastHeartbeat" label="最終通信" width="160">
          <template #default="{ row }">
            <el-tooltip v-if="row.lastHeartbeat" :content="row.lastHeartbeat" placement="top">
              <span>{{ formatRelativeTime(row.lastHeartbeat) }}</span>
            </el-tooltip>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="deviceCode" label="デバイスコード" width="150" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">編集</el-button>
            <el-button type="danger" link @click="handleDelete(row)">削除</el-button>
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

    <!-- デバイス編集ダイアログ -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? 'デバイス追加' : 'デバイス編集'"
      width="600px"
    >
      <el-form ref="deviceFormRef" :model="deviceForm" :rules="rules" label-width="140px">
        <el-form-item label="店舗" prop="storeId">
          <el-select v-model="deviceForm.storeId" placeholder="店舗を選択" style="width: 100%">
            <el-option
              v-for="store in storeList"
              :key="store.id"
              :label="store.storeName"
              :value="store.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="デバイス種別" prop="deviceType">
          <el-select v-model="deviceForm.deviceType" placeholder="種別を選択" style="width: 100%">
            <el-option
              v-for="option in DEVICE_TYPE_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="デバイス名" prop="deviceName">
          <el-input v-model="deviceForm.deviceName" placeholder="デバイス名を入力" />
        </el-form-item>
        <el-form-item label="デバイスコード" prop="deviceCode">
          <el-input v-model="deviceForm.deviceCode" placeholder="自動採番（空欄可）" />
        </el-form-item>
        <el-form-item label="ステータス" prop="status">
          <el-select v-model="deviceForm.status" placeholder="ステータスを選択" style="width: 100%">
            <el-option
              v-for="option in DEVICE_STATUS_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="deviceForm.status === 'ERROR'" label="エラーコード" prop="errorCode">
          <el-input v-model="deviceForm.errorCode" placeholder="エラーコードを入力" />
        </el-form-item>
        <el-form-item label="備考(JSON)" prop="metadata">
          <el-input
            v-model="deviceForm.metadata"
            type="textarea"
            :rows="3"
            placeholder='例: {"serial":"ABC123", "model":"XYZ-100"}'
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">キャンセル</el-button>
          <el-button type="primary" @click="submitForm">確定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import DeviceAPI, {
  type DevicePageVO,
  type DeviceForm as DeviceFormType,
  DEVICE_TYPE_OPTIONS,
  DEVICE_STATUS_OPTIONS,
} from "@/api/retail/device";
import StoreAPI from "@/api/retail/store";
import type { FormInstance } from "element-plus";

// 店舗リスト
const storeList = ref<{ id: number; storeName: string }[]>([]);

// 検索パラメータ
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  storeId: undefined as number | undefined,
  deviceType: undefined as string | undefined,
  status: undefined as string | undefined,
  deviceName: "",
});

// デバイス一覧データ
const loading = ref(false);
const deviceList = ref<DevicePageVO[]>([]);
const total = ref(0);

// ダイアログ
const dialogVisible = ref(false);
const dialogType = ref<"add" | "edit">("add");
const deviceFormRef = ref<FormInstance>();

// デバイスフォーム
const deviceForm = reactive<DeviceFormType & { id?: number }>({
  storeId: 0,
  deviceCode: "",
  deviceType: "",
  deviceName: "",
  status: "OFFLINE",
  errorCode: "",
  metadata: "",
});

// バリデーションルール
const rules = {
  storeId: [{ required: true, message: "店舗を選択してください", trigger: "change" }],
  deviceType: [{ required: true, message: "デバイス種別を選択してください", trigger: "change" }],
  deviceName: [{ required: true, message: "デバイス名を入力してください", trigger: "blur" }],
};

// デバイス種別のラベルを取得
const getDeviceTypeLabel = (deviceType?: string) => {
  const option = DEVICE_TYPE_OPTIONS.find((item) => item.value === deviceType);
  return option?.label || "未設定";
};

// ステータスのタイプを取得
const getStatusType = (status?: string) => {
  const option = DEVICE_STATUS_OPTIONS.find((item) => item.value === status);
  return option?.type || "info";
};

// ステータスのラベルを取得
const getStatusLabel = (status?: string) => {
  const option = DEVICE_STATUS_OPTIONS.find((item) => item.value === status);
  return option?.label || "未設定";
};

// 相対時間を表示
const formatRelativeTime = (dateTimeStr: string | null) => {
  if (!dateTimeStr) return "-";

  const date = new Date(dateTimeStr.replace(" ", "T"));
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return `${diffMinutes}分前`;
  } else if (diffDays === 0) {
    return `${diffHours}時間前`;
  } else if (diffDays === 1) {
    return `昨日 ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  } else {
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  }
};

// 店舗一覧を取得
const getStoreList = async () => {
  try {
    const res = await StoreAPI.getList();
    storeList.value = res || [];
  } catch (error) {
    console.error("店舗一覧の取得に失敗しました:", error);
  }
};

// デバイス一覧を取得
const getList = async () => {
  if (loading.value) return;

  loading.value = true;
  try {
    const res = await DeviceAPI.getPage({
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      storeId: queryParams.storeId,
      deviceType: queryParams.deviceType,
      status: queryParams.status,
      deviceName: queryParams.deviceName,
    });

    deviceList.value = res.list || [];
    total.value = res.total || 0;
  } catch (error) {
    console.error("デバイス一覧の取得に失敗しました:", error);
    ElMessage.error("デバイス一覧の取得に失敗しました");
  } finally {
    loading.value = false;
  }
};

// 検索
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

// リセット
const resetQuery = () => {
  queryParams.storeId = undefined;
  queryParams.deviceType = undefined;
  queryParams.status = undefined;
  queryParams.deviceName = "";
  queryParams.pageNum = 1;
  getList();
};

// ページサイズ変更
const handleSizeChange = () => {
  getList();
};

// ページ変更
const handleCurrentChange = () => {
  getList();
};

// 新規追加
const handleAdd = () => {
  dialogType.value = "add";
  resetForm();
  dialogVisible.value = true;
};

// 編集
const handleEdit = (row: DevicePageVO) => {
  dialogType.value = "edit";
  Object.assign(deviceForm, {
    id: row.id,
    storeId: row.storeId,
    deviceCode: row.deviceCode,
    deviceType: row.deviceType,
    deviceName: row.deviceName,
    status: row.status,
    errorCode: row.errorCode || "",
    metadata: row.metadata || "",
  });
  dialogVisible.value = true;
};

// 削除
const handleDelete = (row: DevicePageVO) => {
  ElMessageBox.confirm(`デバイス「${row.deviceName}」を削除してもよろしいですか？`, "確認", {
    confirmButtonText: "削除",
    cancelButtonText: "キャンセル",
    type: "warning",
  })
    .then(async () => {
      try {
        await DeviceAPI.delete(row.id);
        ElMessage.success("削除しました");
        getList();
      } catch (error) {
        console.error("削除に失敗しました:", error);
        ElMessage.error("削除に失敗しました");
      }
    })
    .catch(() => {
      // キャンセル時は何もしない
    });
};

// フォーム送信
const submitForm = async () => {
  if (!deviceFormRef.value) return;

  await deviceFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogType.value === "add") {
          await DeviceAPI.create(deviceForm);
          ElMessage.success("追加しました");
        } else {
          await DeviceAPI.update(deviceForm.id!, deviceForm);
          ElMessage.success("更新しました");
        }
        dialogVisible.value = false;
        getList();
      } catch (error) {
        console.error("保存に失敗しました:", error);
        ElMessage.error("保存に失敗しました");
      }
    }
  });
};

// フォームリセット
const resetForm = () => {
  Object.assign(deviceForm, {
    id: undefined,
    storeId: storeList.value.length > 0 ? storeList.value[0].id : 0,
    deviceCode: "",
    deviceType: "",
    deviceName: "",
    status: "OFFLINE",
    errorCode: "",
    metadata: "",
  });
  deviceFormRef.value?.clearValidate();
};

// 初期化
onMounted(async () => {
  await getStoreList();
  getList();
});
</script>

<style scoped lang="scss">
.device-container {
  padding: 20px;
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

.text-gray {
  color: #909399;
}
</style>
