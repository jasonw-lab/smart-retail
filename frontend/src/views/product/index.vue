<template>
  <div class="product-container">
    <!-- 検索フォーム -->
    <el-card shadow="never" class="mb-4">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="商品名" prop="productName">
          <el-input
            v-model="queryParams.productName"
            placeholder="商品名を入力"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="カテゴリ" prop="category">
          <el-select v-model="queryParams.category" placeholder="カテゴリを選択" clearable>
            <el-option label="食品" value="food" />
            <el-option label="飲料" value="drink" />
            <el-option label="菓子" value="snack" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">検索</el-button>
          <el-button @click="resetQuery">リセット</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 商品一覧 -->
    <el-card shadow="never">
      <template #header>
        <div class="flex-x-between">
          <span>商品一覧</span>
          <el-button type="primary" @click="handleAdd">新規登録</el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="productList"
        border
        style="width: 100%"
      >
        <el-table-column type="index" label="No." width="50" />
        <el-table-column prop="name" label="商品名" min-width="150" />
        <el-table-column prop="category" label="カテゴリ" width="100">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category)" size="small">
              {{ getCategoryText(row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="価格" width="100">
          <template #default="{ row }">
            ¥{{ formatNumber(row.price) }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="在庫数" width="100" />
        <el-table-column prop="expiryDays" label="賞味期限" width="100">
          <template #default="{ row }">
            {{ row.expiryDays }}日
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleEdit(row)"
            >
              編集
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDelete(row)"
            >
              削除
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

    <!-- 商品編集ダイアログ -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '商品新規登録' : '商品編集'"
      width="500px"
    >
      <el-form
        ref="productForm"
        :model="productForm"
        :rules="productRules"
        label-width="100px"
      >
        <el-form-item label="商品名" prop="name">
          <el-input v-model="productForm.name" placeholder="商品名を入力" />
        </el-form-item>
        <el-form-item label="カテゴリ" prop="category">
          <el-select v-model="productForm.category" placeholder="カテゴリを選択">
            <el-option label="食品" value="food" />
            <el-option label="飲料" value="drink" />
            <el-option label="菓子" value="snack" />
          </el-select>
        </el-form-item>
        <el-form-item label="価格" prop="price">
          <el-input-number
            v-model="productForm.price"
            :min="0"
            :max="100000"
            :step="10"
          />
        </el-form-item>
        <el-form-item label="賞味期限" prop="expiryDays">
          <el-input-number
            v-model="productForm.expiryDays"
            :min="1"
            :max="365"
            :step="1"
          />
          <span class="ml-2">日</span>
        </el-form-item>
        <el-form-item label="商品説明" prop="description">
          <el-input
            v-model="productForm.description"
            type="textarea"
            :rows="3"
            placeholder="商品説明を入力"
          />
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
  productName: "",
  category: undefined,
});

// 商品一覧データ
const loading = ref(false);
const productList = ref([]);
const total = ref(0);

// ダイアログ
const dialogVisible = ref(false);
const dialogType = ref("add");
const productForm = reactive({
  id: undefined,
  name: "",
  category: "food",
  price: 0,
  expiryDays: 7,
  description: "",
});

// バリデーションルール
const productRules = {
  name: [
    { required: true, message: "商品名を入力してください", trigger: "blur" },
  ],
  category: [
    { required: true, message: "カテゴリを選択してください", trigger: "change" },
  ],
  price: [
    { required: true, message: "価格を入力してください", trigger: "blur" },
  ],
  expiryDays: [
    { required: true, message: "賞味期限を入力してください", trigger: "blur" },
  ],
};

// データ取得
const getList = async () => {
  loading.value = true;
  try {
    // TODO: APIからデータを取得する処理を実装
    // 仮のデータ
    productList.value = [
      {
        id: 1,
        name: "チキン",
        category: "food",
        price: 700,
        stock: 15,
        expiryDays: 7,
      },
      {
        id: 2,
        name: "コーラ",
        category: "drink",
        price: 200,
        stock: 30,
        expiryDays: 180,
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
  queryParams.productName = "";
  queryParams.category = undefined;
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

// カテゴリのタグタイプ取得
const getCategoryType = (category: string) => {
  const types = {
    food: "success",
    drink: "primary",
    snack: "warning",
  };
  return types[category] || "info";
};

// カテゴリのテキスト取得
const getCategoryText = (category: string) => {
  const texts = {
    food: "食品",
    drink: "飲料",
    snack: "菓子",
  };
  return texts[category] || "不明";
};

// 数値フォーマット
const formatNumber = (num: number) => {
  return num.toLocaleString();
};

// 新規登録
const handleAdd = () => {
  dialogType.value = "add";
  productForm.id = undefined;
  productForm.name = "";
  productForm.category = "food";
  productForm.price = 0;
  productForm.expiryDays = 7;
  productForm.description = "";
  dialogVisible.value = true;
};

// 編集
const handleEdit = (row: any) => {
  dialogType.value = "edit";
  productForm.id = row.id;
  productForm.name = row.name;
  productForm.category = row.category;
  productForm.price = row.price;
  productForm.expiryDays = row.expiryDays;
  productForm.description = row.description || "";
  dialogVisible.value = true;
};

// 削除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `商品「${row.name}」を削除してもよろしいですか？`,
    "警告",
    {
      confirmButtonText: "確定",
      cancelButtonText: "キャンセル",
      type: "warning",
    }
  ).then(() => {
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
.product-container {
  padding: 20px;
}
</style> 