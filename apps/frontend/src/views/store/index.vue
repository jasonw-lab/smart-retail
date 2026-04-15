<template>
  <div class="store-container">
    <!-- 検索フォーム -->
    <el-card shadow="never" class="mb-4">
      <el-form ref="queryForm" :model="queryParams" :inline="true">
        <el-form-item label="店舗名" prop="storeName">
          <el-input
            v-model="queryParams.storeName"
            placeholder="店舗名を入力"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="ステータス" prop="status">
          <el-select v-model="queryParams.status" placeholder="ステータスを選択" clearable>
            <el-option label="稼働中" value="active" />
            <el-option label="停止中" value="inactive" />
            <el-option label="メンテナンス中" value="maintenance" />
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
        <el-table-column type="index" label="No." width="50" />
        <el-table-column prop="name" label="店舗名" min-width="150" />
        <el-table-column prop="address" label="住所" min-width="200" />
        <el-table-column prop="phone" label="電話番号" width="120" />
        <el-table-column prop="status" label="ステータス" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastRestockDate" label="最終補充日" width="120">
          <template #default="{ row }">
            {{ formatDate(row.lastRestockDate) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">編集</el-button>
            <el-button type="primary" link @click="handleInventory(row)">在庫</el-button>
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
      :title="dialogType === 'add' ? '店舗新規登録' : '店舗編集'"
      width="500px"
    >
      <el-form ref="storeForm" :model="storeForm" :rules="storeRules" label-width="100px">
        <el-form-item label="店舗名" prop="name">
          <el-input v-model="storeForm.name" placeholder="店舗名を入力" />
        </el-form-item>
        <el-form-item label="住所" prop="address">
          <el-input v-model="storeForm.address" placeholder="住所を入力" />
        </el-form-item>
        <el-form-item label="電話番号" prop="phone">
          <el-input v-model="storeForm.phone" placeholder="電話番号を入力" />
        </el-form-item>
        <el-form-item label="ステータス" prop="status">
          <el-select v-model="storeForm.status" placeholder="ステータスを選択">
            <el-option label="稼働中" value="active" />
            <el-option label="停止中" value="inactive" />
            <el-option label="メンテナンス中" value="maintenance" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">キャンセル</el-button>
          <el-button type="primary" @click="submitForm">確定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

// 検索パラメータ
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  storeName: "",
  status: undefined,
});

// 店舗一覧データ
const loading = ref(false);
const storeList = ref([]);
const total = ref(0);

// ダイアログ
const dialogVisible = ref(false);
const dialogType = ref("add");
const storeForm = reactive({
  id: undefined,
  name: "",
  address: "",
  phone: "",
  status: "active",
});

// バリデーションルール
const storeRules = {
  name: [{ required: true, message: "店舗名を入力してください", trigger: "blur" }],
  address: [{ required: true, message: "住所を入力してください", trigger: "blur" }],
  phone: [{ required: true, message: "電話番号を入力してください", trigger: "blur" }],
  status: [{ required: true, message: "ステータスを選択してください", trigger: "change" }],
};

// データ取得
const getList = async () => {
  loading.value = true;
  try {
    // TODO: APIからデータを取得する処理を実装
    // 仮のデータ
    storeList.value = [
      {
        id: 1,
        name: "東京本店",
        address: "東京都渋谷区代々木1-1-1",
        phone: "03-1234-5678",
        status: "active",
        lastRestockDate: "2024-04-15",
      },
      {
        id: 2,
        name: "横浜駅前店",
        address: "東京都新宿区新宿2-2-2",
        phone: "03-2345-6789",
        status: "maintenance",
        lastRestockDate: "2024-04-14",
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
  queryParams.storeName = "";
  queryParams.status = undefined;
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

// ステータスのタグタイプ取得
const getStatusType = (status: string) => {
  const types = {
    active: "success",
    inactive: "info",
    maintenance: "warning",
  };
  return types[status] || "info";
};

// ステータスのテキスト取得
const getStatusText = (status: string) => {
  const texts = {
    active: "稼働中",
    inactive: "停止中",
    maintenance: "メンテナンス中",
  };
  return texts[status] || "不明";
};

// 日付フォーマット
const formatDate = (date: string) => {
  return date.replace(/-/g, "/");
};

// 新規登録
const handleAdd = () => {
  dialogType.value = "add";
  storeForm.id = undefined;
  storeForm.name = "";
  storeForm.address = "";
  storeForm.phone = "";
  storeForm.status = "active";
  dialogVisible.value = true;
};

// 編集
const handleEdit = (row: any) => {
  dialogType.value = "edit";
  storeForm.id = row.id;
  storeForm.name = row.name;
  storeForm.address = row.address;
  storeForm.phone = row.phone;
  storeForm.status = row.status;
  dialogVisible.value = true;
};

// 在庫管理画面へ遷移
const handleInventory = (row: any) => {
  // TODO: 在庫管理画面への遷移処理を実装
  ElMessage.success("在庫管理画面への遷移処理を実装してください");
};

// 削除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`店舗「${row.name}」を削除してもよろしいですか？`, "警告", {
    confirmButtonText: "確定",
    cancelButtonText: "キャンセル",
    type: "warning",
  }).then(() => {
    // TODO: 削除処理を実装
    ElMessage.success("削除処理を実装してください");
  });
};

// フォーム送信
const submitForm = () => {
  // TODO: フォーム送信処理を実装
  ElMessage.success(
    dialogType.value === "add" ? "新規登録処理を実装してください" : "更新処理を実装してください"
  );
  dialogVisible.value = false;
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
.store-container {
  padding: 20px;
}
</style>
