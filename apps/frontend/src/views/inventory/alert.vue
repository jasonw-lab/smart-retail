<template>
  <div class="alert-container">
    <!-- アラート設定 -->
    <el-card shadow="never" class="mb-4">
      <template #header>
        <div class="flex justify-between items-center">
          <span>アラート設定</span>
          <el-button type="primary" @click="handleSaveSettings">設定を保存</el-button>
        </div>
      </template>

      <el-form :model="alertSettings" ref="formRef" label-width="180px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="在庫不足警告レベル" prop="lowStockThreshold">
              <el-input-number
                v-model="alertSettings.lowStockThreshold"
                :min="1"
                controls-position="right"
              />
              <span class="ml-2 text-gray-500">個以下</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="在庫過多警告レベル" prop="highStockThreshold">
              <el-input-number
                v-model="alertSettings.highStockThreshold"
                :min="1"
                controls-position="right"
              />
              <span class="ml-2 text-gray-500">個以上</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="賞味期限警告日数" prop="expiryWarningDays">
              <el-input-number
                v-model="alertSettings.expiryWarningDays"
                :min="1"
                controls-position="right"
              />
              <span class="ml-2 text-gray-500">日前</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="通知設定" prop="notificationTypes">
              <el-checkbox-group v-model="alertSettings.notificationTypes">
                <el-checkbox label="email">メール通知</el-checkbox>
                <el-checkbox label="system">システム通知</el-checkbox>
                <el-checkbox label="line">LINE通知</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- アラート一覧 -->
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span>アラート一覧</span>
          <div>
            <el-button type="success" icon="refresh" @click="handleRefresh">更新</el-button>
            <el-button icon="download" @click="handleExport">エクスポート</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="alertList" border style="width: 100%">
        <el-table-column type="index" label="No." width="50" />
        <el-table-column prop="date" label="発生日時" width="160" />
        <el-table-column prop="storeName" label="店舗" min-width="120" />
        <el-table-column prop="productName" label="商品名" min-width="150" />
        <el-table-column prop="alertType" label="アラート種別" width="120">
          <template #default="{ row }">
            <el-tag :type="getAlertTypeTag(row.alertType)">
              {{ getAlertTypeText(row.alertType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="currentValue" label="現在値" width="100" align="right">
          <template #default="{ row }">
            {{ formatCurrentValue(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="threshold" label="閾値" width="100" align="right">
          <template #default="{ row }">
            {{ formatThreshold(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状態" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="primary"
              link
              @click="handleProcess(row)"
            >
              対応
            </el-button>
            <el-button
              type="primary"
              link
              @click="handleDetail(row)"
            >
              詳細
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage } from "element-plus";
import { exportToCSV } from "@/utils/exportCsv";
import type { FormInstance } from "element-plus";

// フォームの参照
const formRef = ref<FormInstance>();

// アラート設定
const alertSettings = reactive({
  lowStockThreshold: 10,
  highStockThreshold: 100,
  expiryWarningDays: 7,
  notificationTypes: ["system"],
});

// アラート一覧
const loading = ref(false);
const allAlerts = ref([
  {
    date: "2024-03-20 10:00:00",
    storeName: "東京本店",
    productName: "商品A",
    alertType: "low_stock",
    currentValue: 5,
    threshold: 10,
    status: "pending",
  },
  {
    date: "2024-03-20 09:30:00",
    storeName: "横浜駅前店",
    productName: "商品B",
    alertType: "expiry",
    currentValue: "2024-03-27",
    threshold: 7,
    status: "processing",
  },
  {
    date: "2024-03-20 09:15:00",
    storeName: "大阪梅田店",
    productName: "商品C",
    alertType: "low_stock",
    currentValue: 8,
    threshold: 15,
    status: "pending",
  },
  {
    date: "2024-03-20 08:45:00",
    storeName: "名古屋栄店",
    productName: "商品D",
    alertType: "high_stock",
    currentValue: 120,
    threshold: 100,
    status: "pending",
  },
  {
    date: "2024-03-20 08:30:00",
    storeName: "福岡天神店",
    productName: "商品E",
    alertType: "expiry",
    currentValue: "2024-03-25",
    threshold: 7,
    status: "processing",
  },
  {
    date: "2024-03-19 17:00:00",
    storeName: "札幌大通店",
    productName: "商品F",
    alertType: "low_stock",
    currentValue: 3,
    threshold: 10,
    status: "resolved",
  },
  {
    date: "2024-03-19 16:30:00",
    storeName: "仙台駅前店",
    productName: "商品G",
    alertType: "high_stock",
    currentValue: 150,
    threshold: 100,
    status: "resolved",
  },
  {
    date: "2024-03-19 16:00:00",
    storeName: "広島本通店",
    productName: "商品H",
    alertType: "expiry",
    currentValue: "2024-03-26",
    threshold: 7,
    status: "resolved",
  },
  {
    date: "2024-03-19 15:30:00",
    storeName: "京都四条店",
    productName: "商品I",
    alertType: "low_stock",
    currentValue: 7,
    threshold: 15,
    status: "resolved",
  },
  {
    date: "2024-03-19 15:00:00",
    storeName: "神戸三宮店",
    productName: "商品J",
    alertType: "low_stock",
    currentValue: 4,
    threshold: 10,
    status: "resolved",
  },
  {
    date: "2024-03-19 14:30:00",
    storeName: "東京本店",
    productName: "商品K",
    alertType: "high_stock",
    currentValue: 110,
    threshold: 100,
    status: "resolved",
  },
  {
    date: "2024-03-19 14:00:00",
    storeName: "横浜駅前店",
    productName: "商品L",
    alertType: "expiry",
    currentValue: "2024-03-24",
    threshold: 7,
    status: "resolved",
  },
  {
    date: "2024-03-19 13:30:00",
    storeName: "大阪梅田店",
    productName: "商品M",
    alertType: "low_stock",
    currentValue: 6,
    threshold: 15,
    status: "resolved",
  },
  {
    date: "2024-03-19 13:00:00",
    storeName: "名古屋栄店",
    productName: "商品N",
    alertType: "low_stock",
    currentValue: 2,
    threshold: 10,
    status: "resolved",
  },
  {
    date: "2024-03-19 12:30:00",
    storeName: "福岡天神店",
    productName: "商品O",
    alertType: "high_stock",
    currentValue: 130,
    threshold: 100,
    status: "resolved",
  }
]);

// ページネーション
const total = ref(allAlerts.value.length);
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
});

// 現在のページのアラートデータを計算
const alertList = computed(() => {
  const start = (queryParams.pageNum - 1) * queryParams.pageSize;
  const end = start + queryParams.pageSize;
  return allAlerts.value.slice(start, end);
});

// アラートタイプの表示テキスト
const getAlertTypeText = (type: string) => {
  const types: Record<string, string> = {
    low_stock: "在庫不足",
    high_stock: "在庫過多",
    expiry: "賞味期限",
  };
  return types[type] || type;
};

// アラートタイプのタグタイプ
const getAlertTypeTag = (type: string): "danger" | "warning" | "info" => {
  const types: Record<string, "danger" | "warning" | "info"> = {
    low_stock: "danger",
    high_stock: "warning",
    expiry: "info",
  };
  return types[type] || "info";
};

// 状態の表示テキスト
const getStatusText = (status: string) => {
  const statuses: Record<string, string> = {
    pending: "未対応",
    processing: "対応中",
    resolved: "解決済",
  };
  return statuses[status] || status;
};

// 状態のタグタイプ
const getStatusTag = (status: string): "danger" | "warning" | "success" => {
  const types: Record<string, "danger" | "warning" | "success"> = {
    pending: "danger",
    processing: "warning",
    resolved: "success",
  };
  return types[status] || "info";
};

// 現在値のフォーマット
const formatCurrentValue = (row: any) => {
  if (row.alertType === "expiry") {
    return row.currentValue;
  }
  return `${row.currentValue}個`;
};

// 閾値のフォーマット
const formatThreshold = (row: any) => {
  if (row.alertType === "expiry") {
    return `${row.threshold}日前`;
  }
  return `${row.threshold}個`;
};

// 設定の保存
const handleSaveSettings = () => {
  ElMessage.success("アラート設定を保存しました");
};

// アラート対応
const handleProcess = (row: any) => {
  ElMessage.success(`${row.productName}のアラートを対応中にしました`);
};

// アラート詳細
const handleDetail = (row: any) => {
  ElMessage.info(`${row.productName}の詳細を表示します`);
};

// データの更新
const handleRefresh = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success("データを更新しました");
  }, 1000);
};

// データのエクスポート
const handleExport = () => {
  exportToCSV(alertList.value, [
    { key: "date", label: "発生日時" },
    { key: "storeName", label: "店舗" },
    { key: "productName", label: "商品名" },
    { key: "alertType", label: "アラート種別" },
    { key: "currentValue", label: "現在値" },
    { key: "threshold", label: "閾値" },
    { key: "status", label: "状態" },
  ], "alert-list.csv");
};

// ページサイズの変更
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val;
  queryParams.pageNum = 1; // ページサイズ変更時は1ページ目に戻る
};

// ページ番号の変更
const handleCurrentChange = (val: number) => {
  queryParams.pageNum = val;
};
</script>

<style scoped>
.alert-container {
  padding: 20px;
}
</style> 