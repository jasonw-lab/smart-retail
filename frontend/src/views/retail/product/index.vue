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
          <el-select
            v-model="queryParams.category"
            placeholder="カテゴリを選択"
            clearable
            fit-input-width
          >
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

      <el-table v-loading="loading" :data="productList" border style="width: 100%">
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
        <el-table-column prop="categoryName" label="カテゴリ" width="120">
          <template #default="{ row }">
            {{ row.categoryName || categories.find((c: Category) => c.id === row.categoryId)?.name || "その他" }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="価格" width="100">
          <template #default="{ row }">¥{{ formatNumber(row.price) }}</template>
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

    <!-- 商品編集ダイアログ -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '商品追加' : '商品編集'"
      width="50%"
    >
      <el-form ref="productFormRef" :model="productForm" :rules="rules" label-width="120px">
        <el-form-item label="商品名" prop="name">
          <el-input v-model="productForm.name" />
        </el-form-item>
        <el-form-item label="カテゴリー" prop="categoryId">
          <el-select v-model="productForm.categoryId" placeholder="カテゴリーを選択">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="価格" prop="price">
          <el-input-number v-model="productForm.price" :min="0" />
        </el-form-item>
        <el-form-item label="在庫" prop="stock">
          <el-input-number v-model="productForm.stock" :min="0" />
        </el-form-item>
        <el-form-item label="有効期限" prop="expiryDate">
          <el-date-picker
            v-model="productForm.expiryDate"
            type="date"
            placeholder="有効期限を選択"
            :disabled-date="disabledDate"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="説明" prop="description">
          <el-input v-model="productForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="画像URL" prop="imageUrl">
          <el-input v-model="productForm.imageUrl" />
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
import RetailCategoryAPI from "@/api/retail/product/category";
import RetailProductAPI from "@/api/retail/product/list";
import type { Product } from "@/api/retail/product/list";
import dayjs from "dayjs";
import type { FormInstance } from "element-plus";

interface Category {
  id: number;
  name: string;
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
const dialogType = ref<"add" | "edit">("add");
const productFormRef = ref<FormInstance>();

// 商品フォームの型定義
interface ProductForm {
  id?: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: number;
  stock: number;
  expiryDate: string;
  description: string;
  imageUrl: string;
}

// 商品フォームの初期化
const productForm = reactive<ProductForm>({
  name: "",
  categoryId: 1,
  categoryName: "",
  price: 0,
  stock: 0,
  expiryDate: dayjs().add(1, "month").format("YYYY-MM-DD"),
  description: "",
  imageUrl: "",
});

// バリデーションルール
const rules = {
  name: [{ required: true, message: "商品名を入力してください", trigger: "blur" }],
  categoryId: [{ required: true, message: "カテゴリを選択してください", trigger: "change" }],
  price: [{ required: true, message: "価格を入力してください", trigger: "blur" }],
  expiryDate: [{ required: true, message: "賞味期限を入力してください", trigger: "blur" }],
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
  if (loading.value) return;

  loading.value = true;
  try {
    const res = await RetailProductAPI.getList({
      page: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      keyword: queryParams.productName,
      categoryId: queryParams.category,
    });
    // カテゴリ名を設定
    productList.value = res.list.map((product) => ({
      ...product,
      categoryName: categories.value.find((c: Category) => c.id === product.categoryId)?.name || "その他",
    }));
    total.value = res.total;
  } catch (error) {
    console.error("商品一覧の取得に失敗しました:", error);
    ElMessage.error("商品一覧の取得に失敗しました");
  } finally {
    loading.value = false;
  }
};

// 検索処理
const handleQuery = () => {
  if (loading.value) return; // ロード中は新しい検索を防止
  queryParams.pageNum = 1;
  getList();
};

// リセット処理
const resetQuery = () => {
  if (loading.value) return; // ロード中はリセットを防止
  queryParams.productName = "";
  queryParams.category = undefined;
  handleQuery();
};

// ページサイズ変更
const handleSizeChange = (val: number) => {
  if (loading.value) return; // ロード中はページサイズ変更を防止
  queryParams.pageSize = val;
  getList();
};

// ページ番号変更
const handleCurrentChange = (val: number) => {
  if (loading.value) return; // ロード中はページ番号変更を防止
  queryParams.pageNum = val;
  getList();
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
  productForm.categoryId = 1;
  productForm.price = 0;
  productForm.stock = 0;
  productForm.expiryDate = dayjs().add(1, "month").format("YYYY-MM-DD");
  productForm.description = "";
  productForm.imageUrl = "";
  dialogVisible.value = true;
};

// 編集
const handleEdit = (row: Product) => {
  dialogType.value = "edit";
  dialogVisible.value = true;
  // フォームデータを設定
  productForm.id = row.id;
  productForm.name = row.name;
  productForm.categoryId = row.categoryId;
  productForm.categoryName = row.categoryName;
  productForm.price = row.price;
  productForm.stock = row.stock;
  productForm.expiryDate = row.expiryDate || dayjs().add(1, "month").format("YYYY-MM-DD");
  productForm.description = row.description || "";
  productForm.imageUrl = row.imageUrl || "";
};

// 削除
const handleDelete = (row: Product) => {
  ElMessageBox.confirm(`商品「${row.name}」を削除してもよろしいですか？`, "警告", {
    confirmButtonText: "確定",
    cancelButtonText: "キャンセル",
    type: "warning",
  }).then(async () => {
    try {
      await RetailProductAPI.delete(row.id);
      ElMessage.success("商品を削除しました");
      getList();
    } catch (error) {
      console.error("商品の削除に失敗しました:", error);
      ElMessage.error("商品の削除に失敗しました");
    }
  });
};

// フォーム送信
const submitForm = async () => {
  if (!productFormRef.value) return;

  await productFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogType.value === "add") {
          const { id, categoryName, ...createData } = productForm;
          await RetailProductAPI.create(createData);
          ElMessage.success("商品を追加しました");
        } else if (productForm.id) {
          const { categoryName, ...updateData } = productForm;
          await RetailProductAPI.update(updateData);
          ElMessage.success("商品を更新しました");
        }
        dialogVisible.value = false;
        getList();
      } catch (error) {
        console.error("商品の保存に失敗しました:", error);
        ElMessage.error(
          dialogType.value === "add" ? "商品の追加に失敗しました" : "商品の更新に失敗しました"
        );
      }
    }
  });
};

// 日付選択の無効化関数
const disabledDate = (date: Date) => {
  return date < new Date();
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
