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
          <el-select v-model="queryParams.category" placeholder="カテゴリを選択" clearable fit-input-width>
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
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
        <el-table-column prop="name" label="商品名" min-width="150">
          <template #default="{ row }">
            <div class="flex items-center justify-between">
              <span>{{ row.name }}</span>
              <el-image
                :src="row.imageUrl"
                :preview-src-list="[row.imageUrl]"
                :initial-index="0"
                preview-teleported
                fit="cover"
                class="w-10 h-10 ml-2 cursor-pointer"
                :z-index="2000"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="カテゴリ" width="120" />
        <el-table-column prop="price" label="価格" width="100">
          <template #default="{ row }">
            ¥{{ formatNumber(row.price) }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="在庫数" width="100" />
        <el-table-column prop="expiryDate" label="賞味期限" width="120">
          <template #default="{ row }">
            {{ formatDate(row.expiryDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="売上数" width="100" />
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
          <el-select v-model="productForm.category" placeholder="カテゴリを選択" fit-input-width>
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
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
import RetailCategoryAPI from "@/api/retail/product/category";
import RetailProductAPI from "@/api/retail/product/list";
import dayjs from "dayjs";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: number;
  stock: number;
  sales: number;
  imageUrl: string;
  description: string;
  expiryDate: string;
}

// 検索パラメータ
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  productName: "",
  category: undefined as number | undefined,
});

// 商品一覧データ
const loading = ref(false);
const productList = ref<Product[]>([]);
const total = ref(0);
const categories = ref<Category[]>([]);

// ダイアログ
const dialogVisible = ref(false);
const dialogType = ref("add");
const productForm = reactive({
  id: undefined as number | undefined,
  name: "",
  category: 1,
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

// カテゴリ一覧を取得
const getCategories = async () => {
  try {
    const res = await RetailCategoryAPI.getList();
    categories.value = res;
  } catch (error) {
    console.error("カテゴリ一覧の取得に失敗しました:", error);
  }
};

// 商品一覧を取得
const getList = async () => {
  loading.value = true;
  try {
    const res = await RetailProductAPI.getList({
      page: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      keyword: queryParams.productName,
      categoryId: queryParams.category,
    });
    productList.value = res.list;
    total.value = res.total;
  } catch (error) {
    console.error("商品一覧の取得に失敗しました:", error);
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

// カテゴリのタグタイプを取得
const getCategoryType = (category: string): "success" | "warning" | "info" | "primary" | "danger" => {
  const categoryMap: Record<string, "success" | "warning" | "info" | "primary" | "danger"> = {
    食品: "success",
    飲料: "primary",
    日用品: "warning",
    雑貨: "info",
  };
  return categoryMap[category] || "info";
};

// カテゴリのテキスト取得
const getCategoryText = (categoryId: number) => {
  const category = categories.value.find(c => c.id === categoryId);
  return category ? category.name : "不明";
};

// 日付フォーマット関数
const formatDate = (date: string) => {
  return date ? dayjs(date).format("YYYY-MM-DD") : "";
};

// 数値フォーマット関数
const formatNumber = (num: number) => {
  return num.toLocaleString();
};

// 新規登録
const handleAdd = () => {
  dialogType.value = "add";
  productForm.id = undefined;
  productForm.name = "";
  productForm.category = 1;
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
  getCategories();
  getList();
});
</script>

<style scoped>
.product-container {
  padding: 20px;
}

:deep(.el-select-dropdown) {
  min-width: 120px !important;
}

:deep(.el-select-dropdown__item) {
  padding: 0 30px 0 20px !important;
  min-width: fit-content;
}

:deep(.el-select__popper.el-popper) {
  min-width: fit-content !important;
}

:deep(.el-select) {
  min-width: 120px;
}

:deep(.el-image-viewer__close) {
  right: 40px;
  top: 40px;
  width: 40px;
  height: 40px;
  background-color: #606266;
}

:deep(.el-image-viewer__wrapper) {
  touch-action: none;
}

:deep(.el-image-viewer__img) {
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
</style> 