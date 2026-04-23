<!-- 系统配置 -->
<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
        <el-form-item :label="t('system.common.keyword')" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="t('system.config.placeholder.keywords')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">{{ t('system.common.search') }}</el-button>
          <el-button icon="refresh" @click="handleResetQuery">{{ t('system.common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button
            v-hasPerm="['sys:config:add']"
            type="success"
            icon="plus"
            @click="handleOpenDialog()"
          >
            {{ t('system.common.add') }}
          </el-button>
          <el-button
            v-hasPerm="['sys:config:refresh']"
            color="#626aef"
            icon="RefreshLeft"
            @click="handleRefreshCache"
          >
            {{ t('system.config.refreshCache') }}
          </el-button>
        </div>
      </div>

      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        class="data-table__content"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="index" :label="t('system.config.index')" width="60" />
        <el-table-column key="configName" :label="t('system.config.name')" prop="configName" min-width="100" />
        <el-table-column key="configKey" :label="t('system.config.key')" prop="configKey" min-width="100" />
        <el-table-column key="configValue" :label="t('system.config.value')" prop="configValue" min-width="100" />
        <el-table-column key="remark" :label="t('system.config.description')" prop="remark" min-width="100" />
        <el-table-column fixed="right" :label="t('system.common.operation')" width="220">
          <template #default="scope">
            <el-button
              v-hasPerm="['sys:config:update']"
              type="primary"
              size="small"
              link
              icon="edit"
              @click="handleOpenDialog(scope.row.id)"
            >
              {{ t('system.common.edit') }}
            </el-button>
            <el-button
              v-hasPerm="['sys:config:delete']"
              type="danger"
              size="small"
              link
              icon="delete"
              @click="handleDelete(scope.row.id)"
            >
              {{ t('system.common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery"
      />
    </el-card>

    <!-- 系统配置表单弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      @close="handleCloseDialog"
    >
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-suffix=":"
        label-width="100px"
      >
        <el-form-item :label="t('system.config.name')" prop="configName">
          <el-input v-model="formData.configName" :placeholder="t('system.config.placeholder.name')" :maxlength="50" />
        </el-form-item>
        <el-form-item :label="t('system.config.key')" prop="configKey">
          <el-input v-model="formData.configKey" :placeholder="t('system.config.placeholder.key')" :maxlength="50" />
        </el-form-item>
        <el-form-item :label="t('system.config.value')" prop="configValue">
          <el-input v-model="formData.configValue" :placeholder="t('system.config.placeholder.value')" :maxlength="100" />
        </el-form-item>
        <el-form-item :label="t('system.config.description')" prop="remark">
          <el-input
            v-model="formData.remark"
            :rows="4"
            :maxlength="100"
            show-word-limit
            type="textarea"
            :placeholder="t('system.config.placeholder.description')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">{{ t('system.common.confirm') }}</el-button>
          <el-button @click="handleCloseDialog">{{ t('system.common.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineOptions({
  name: "Config",
  inheritAttrs: false,
});

import ConfigAPI, { ConfigPageVO, ConfigForm, ConfigPageQuery } from "@/api/system/config.api";

const { t } = useI18n();

const queryFormRef = ref();
const dataFormRef = ref();

const loading = ref(false);
const selectIds = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<ConfigPageQuery>({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
});

// 系统配置表格数据
const pageData = ref<ConfigPageVO[]>([]);

const dialog = reactive({
  title: "",
  visible: false,
});

const formData = reactive<ConfigForm>({
  id: undefined,
  configName: "",
  configKey: "",
  configValue: "",
  remark: "",
});

const rules = computed(() => ({
  configName: [{ required: true, message: t('system.config.rules.name'), trigger: "blur" }],
  configKey: [{ required: true, message: t('system.config.rules.key'), trigger: "blur" }],
  configValue: [{ required: true, message: t('system.config.rules.value'), trigger: "blur" }],
}));

// 查询系统配置
function handleQuery() {
  loading.value = true;
  queryParams.pageNum = 1;
  ConfigAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

// 行复选框选中项变化
function handleSelectionChange(selection: any) {
  selectIds.value = selection.map((item: any) => item.id);
}

// 打开系统配置弹窗
function handleOpenDialog(id?: string) {
  dialog.visible = true;
  if (id) {
    dialog.title = t('system.config.editConfig');
    ConfigAPI.getFormData(id).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = t('system.config.addConfig');
    formData.id = undefined;
  }
}

// 刷新缓存(防抖)
const handleRefreshCache = useDebounceFn(() => {
  ConfigAPI.refreshCache().then(() => {
    ElMessage.success(t('system.config.refreshSuccess'));
  });
}, 1000);

// 系统配置表单提交
function handleSubmit() {
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const id = formData.id;
      if (id) {
        ConfigAPI.update(id, formData)
          .then(() => {
            ElMessage.success(t('system.common.editSuccess'));
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        ConfigAPI.create(formData)
          .then(() => {
            ElMessage.success(t('system.common.addSuccess'));
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

// 重置表单
function resetForm() {
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.id = undefined;
}

// 关闭系统配置弹窗
function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}

// 删除系统配置
function handleDelete(id: string) {
  ElMessageBox.confirm(t('system.config.confirmDeleteConfig'), t('system.common.warning'), {
    confirmButtonText: t('system.common.confirm'),
    cancelButtonText: t('system.common.cancel'),
    type: "warning",
  }).then(() => {
    loading.value = true;
    ConfigAPI.deleteById(id)
      .then(() => {
        ElMessage.success(t('system.common.deleteSuccess'));
        handleResetQuery();
      })
      .finally(() => (loading.value = false));
  });
}

onMounted(() => {
  handleQuery();
});
</script>
