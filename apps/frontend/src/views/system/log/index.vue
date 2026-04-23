<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="keywords" :label="t('system.common.keyword')">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="t('system.log.placeholder.keywords')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item prop="createTime" :label="t('system.log.operationTime')">
          <el-date-picker
            v-model="queryParams.createTime"
            :editable="false"
            type="daterange"
            range-separator="~"
            :start-placeholder="t('system.common.startTime')"
            :end-placeholder="t('system.common.endTime')"
            value-format="YYYY-MM-DD"
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">{{ t('system.common.search') }}</el-button>
          <el-button icon="refresh" @click="handleResetQuery">{{ t('system.common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <el-table
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        border
        class="data-table__content"
      >
        <el-table-column :label="t('system.log.operationTime')" prop="createTime" width="180" />
        <el-table-column :label="t('system.log.operator')" prop="operator" width="120" />
        <el-table-column :label="t('system.log.module')" prop="module" width="100" />
        <el-table-column :label="t('system.log.content')" prop="content" min-width="200" />
        <el-table-column :label="t('system.log.ip')" prop="ip" width="150" />
        <el-table-column :label="t('system.log.region')" prop="region" width="150" />
        <el-table-column :label="t('system.log.browser')" prop="browser" width="150" />
        <el-table-column :label="t('system.log.os')" prop="os" width="200" show-overflow-tooltip />
        <el-table-column :label="t('system.log.executionTime')" prop="executionTime" width="150" />
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineOptions({
  name: "Log",
  inheritAttrs: false,
});

import LogAPI, { LogPageVO, LogPageQuery } from "@/api/system/log.api";

const { t } = useI18n();

const queryFormRef = ref();

const loading = ref(false);
const total = ref(0);

const queryParams = reactive<LogPageQuery>({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
  createTime: ["", ""],
});

// 日志表格数据
const pageData = ref<LogPageVO[]>();

/** 查询 */
function handleQuery() {
  loading.value = true;
  queryParams.pageNum = 1;
  LogAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}
/** 重置查询 */
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  queryParams.createTime = undefined;
  handleQuery();
}

onMounted(() => {
  handleQuery();
});
</script>
