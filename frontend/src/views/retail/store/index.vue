<template>
  <div class="store-container">
    <!-- 検索フォーム -->
    <el-card shadow="never" class="mb-4">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="店舗名" prop="storeName">
          <el-input
            v-model="queryParams.storeName"
            placeholder="店舗名を入力"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="ステータス" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="ステータスを選択"
            clearable
            style="width: 180px"
          >
            <el-option label="稼働中" value="active" />
            <el-option label="メンテナンス中" value="maintenance" />
            <el-option label="停止中" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">検索</el-button>
          <el-button @click="resetQuery">リセット</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 店舗一覧 -->
    <el-card shadow="never">
      <template #header>
        <div class="flex-x-between">
          <span>店舗一覧</span>
          <el-button type="primary" @click="handleAdd">新規登録</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="storeList" border style="width: 100%">
        <el-table-column type="index" label="No." width="60" />
        <el-table-column prop="storeCode" label="店舗コード" width="120" />
        <el-table-column prop="storeName" label="店舗名" min-width="150" />
        <el-table-column prop="address" label="住所" min-width="200" show-overflow-tooltip />
        <el-table-column prop="phone" label="電話番号" width="130" />
        <el-table-column prop="manager" label="店長" width="100" />
        <el-table-column prop="status" label="ステータス" width="140">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="openingHours" label="営業時間" width="150" />
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

    <!-- 店舗編集ダイアログ -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '店舗追加' : '店舗編集'"
      width="600px"
    >
      <el-form ref="storeFormRef" :model="storeForm" :rules="rules" label-width="120px">
        <el-form-item label="店舗コード" prop="storeCode">
          <el-input v-model="storeForm.storeCode" placeholder="店舗コードを入力" />
        </el-form-item>
        <el-form-item label="店舗名" prop="storeName">
          <el-input v-model="storeForm.storeName" placeholder="店舗名を入力" />
        </el-form-item>
        <el-form-item label="住所" prop="address">
          <el-input v-model="storeForm.address" placeholder="住所を入力" />
        </el-form-item>
        <el-form-item label="電話番号" prop="phone">
          <el-input v-model="storeForm.phone" placeholder="電話番号を入力" />
        </el-form-item>
        <el-form-item label="店長" prop="manager">
          <el-input v-model="storeForm.manager" placeholder="店長名を入力" />
        </el-form-item>
        <el-form-item label="ステータス" prop="status">
          <el-select v-model="storeForm.status" placeholder="ステータスを選択">
            <el-option label="稼働中" value="active" />
            <el-option label="メンテナンス中" value="maintenance" />
            <el-option label="停止中" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="営業時間" prop="openingHours">
          <el-input v-model="storeForm.openingHours" placeholder="例: 09:00-21:00" />
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
import StoreAPI, { type StorePageVO, type StoreForm as StoreFormType } from "@/api/retail/store";
import type { FormInstance } from "element-plus";

// 検索パラメータ
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  storeName: "",
  status: undefined as string | undefined,
});

// 店舗一覧データ
const loading = ref(false);
const storeList = ref<StorePageVO[]>([]);
const total = ref(0);

// ダイアログ
const dialogVisible = ref(false);
const dialogType = ref<"add" | "edit">("add");
const storeFormRef = ref<FormInstance>();

// 店舗フォーム
const storeForm = reactive<StoreFormType & { id?: number }>({
  storeCode: "",
  storeName: "",
  address: "",
  phone: "",
  manager: "",
  status: "active",
  openingHours: "",
});

// バリデーションルール
const rules = {
  storeCode: [{ required: true, message: "店舗コードを入力してください", trigger: "blur" }],
  storeName: [{ required: true, message: "店舗名を入力してください", trigger: "blur" }],
  status: [{ required: true, message: "ステータスを選択してください", trigger: "change" }],
};

// ステータスのタイプを取得
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    active: "success",
    maintenance: "warning",
    inactive: "danger",
  };
  return typeMap[status] || "info";
};

// ステータスのラベルを取得
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    active: "稼働中",
    maintenance: "メンテナンス中",
    inactive: "停止中",
  };
  return labelMap[status] || status;
};

// 店舗一覧を取得
const getList = async () => {
  if (loading.value) return;

  loading.value = true;
  try {
    const res = await StoreAPI.getPage({
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      storeName: queryParams.storeName,
      status: queryParams.status,
    });

    storeList.value = res.list || [];
    total.value = res.total || 0;
  } catch (error) {
    console.error("店舗一覧の取得に失敗しました:", error);
    ElMessage.error("店舗一覧の取得に失敗しました");
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
  queryParams.storeName = "";
  queryParams.status = undefined;
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
const handleEdit = (row: StorePageVO) => {
  dialogType.value = "edit";
  Object.assign(storeForm, {
    id: row.id,
    storeCode: row.storeCode,
    storeName: row.storeName,
    address: row.address,
    phone: row.phone,
    manager: row.manager,
    status: row.status,
    openingHours: row.openingHours,
  });
  dialogVisible.value = true;
};

// 削除
const handleDelete = (row: StorePageVO) => {
  ElMessageBox.confirm(`店舗「${row.storeName}」を削除してもよろしいですか？`, "確認", {
    confirmButtonText: "削除",
    cancelButtonText: "キャンセル",
    type: "warning",
  })
    .then(async () => {
      try {
        await StoreAPI.delete(row.id);
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
  if (!storeFormRef.value) return;

  await storeFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogType.value === "add") {
          await StoreAPI.create(storeForm);
          ElMessage.success("追加しました");
        } else {
          await StoreAPI.update(storeForm.id!, storeForm);
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
  Object.assign(storeForm, {
    id: undefined,
    storeCode: "",
    storeName: "",
    address: "",
    phone: "",
    manager: "",
    status: "active",
    openingHours: "",
  });
  storeFormRef.value?.clearValidate();
};

// 初期化
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.store-container {
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
</style>
