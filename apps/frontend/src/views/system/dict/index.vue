<!-- 字典 -->
<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item :label="t('system.common.keyword')" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="t('system.dict.placeholder.keywords')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery()">{{ t('system.common.search') }}</el-button>
          <el-button icon="refresh" @click="handleResetQuery()">{{ t('system.common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" icon="plus" @click="handleAddClick()">{{ t('system.common.add') }}</el-button>
          <el-button
            type="danger"
            :disabled="ids.length === 0"
            icon="delete"
            @click="handleDelete()"
          >
            {{ t('system.common.delete') }}
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        highlight-current-row
        :data="tableData"
        border
        class="data-table__content"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="t('system.dict.name')" prop="name" />
        <el-table-column :label="t('system.dict.code')" prop="dictCode" />
        <el-table-column :label="t('system.common.status')" prop="status">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? t('system.common.enabled') : t('system.common.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" :label="t('system.common.operation')" align="center" width="220">
          <template #default="scope">
            <el-button type="primary" link size="small" @click.stop="handleOpenDictData(scope.row)">
              <template #icon>
                <Collection />
              </template>
              {{ t('system.dict.dictData') }}
            </el-button>

            <el-button
              type="primary"
              link
              size="small"
              icon="edit"
              @click.stop="handleEditClick(scope.row.id)"
            >
              {{ t('system.common.edit') }}
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              icon="delete"
              @click.stop="handleDelete(scope.row.id)"
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

    <!--字典弹窗-->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="computedRules" label-width="100px">
        <el-card shadow="never">
          <el-form-item :label="t('system.dict.name')" prop="name">
            <el-input v-model="formData.name" :placeholder="t('system.dict.placeholder.name')" />
          </el-form-item>

          <el-form-item :label="t('system.dict.code')" prop="dictCode">
            <el-input v-model="formData.dictCode" :placeholder="t('system.dict.placeholder.code')" />
          </el-form-item>

          <el-form-item :label="t('system.common.status')">
            <el-radio-group v-model="formData.status">
              <el-radio :value="1">{{ t('system.common.enabled') }}</el-radio>
              <el-radio :value="0">{{ t('system.common.disabled') }}</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item :label="t('system.dict.remark')">
            <el-input v-model="formData.remark" type="textarea" :placeholder="t('system.dict.placeholder.remark')" />
          </el-form-item>
        </el-card>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmitClick">{{ t('system.common.confirm') }}</el-button>
          <el-button @click="handleCloseDialog">{{ t('system.common.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineOptions({
  name: "Dict",
  inherititems: false,
});

import DictAPI, { DictPageQuery, DictPageVO, DictForm } from "@/api/system/dict.api";

import router from "@/router";

const { t } = useI18n();

const queryFormRef = ref();
const dataFormRef = ref();

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<DictPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const tableData = ref<DictPageVO[]>();

const dialog = reactive({
  title: "",
  visible: false,
});

const formData = reactive<DictForm>({});

const computedRules = computed(() => {
  const rules: Partial<Record<string, any>> = {
    name: [{ required: true, message: t('system.dict.rules.name'), trigger: "blur" }],
    dictCode: [{ required: true, message: t('system.dict.rules.code'), trigger: "blur" }],
  };
  return rules;
});

// 查询
function handleQuery() {
  loading.value = true;
  queryParams.pageNum = 1;
  DictAPI.getPage(queryParams)
    .then((data) => {
      tableData.value = data.list;
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

// 行选择
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
}

// 新增字典
function handleAddClick() {
  dialog.visible = true;
  dialog.title = t('system.dict.addDict');
}

/**
 * 编辑字典
 *
 * @param id 字典ID
 */
function handleEditClick(id: string) {
  dialog.visible = true;
  dialog.title = t('system.dict.editDict');
  DictAPI.getFormData(id).then((data) => {
    Object.assign(formData, data);
  });
}

// 提交字典表单
function handleSubmitClick() {
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      loading.value = true;
      const id = formData.id;
      if (id) {
        DictAPI.update(id, formData)
          .then(() => {
            ElMessage.success(t('system.common.editSuccess'));
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        DictAPI.create(formData)
          .then(() => {
            ElMessage.success(t('system.common.addSuccess'));
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

// 关闭字典弹窗
function handleCloseDialog() {
  dialog.visible = false;

  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();

  formData.id = undefined;
}
/**
 * 删除字典
 *
 * @param id 字典ID
 */
function handleDelete(id?: number) {
  const attrGroupIds = [id || ids.value].join(",");
  if (!attrGroupIds) {
    ElMessage.warning(t('system.common.selectDeleteItem'));
    return;
  }
  ElMessageBox.confirm(t('system.common.confirmDelete'), t('system.common.warning'), {
    confirmButtonText: t('system.common.confirm'),
    cancelButtonText: t('system.common.cancel'),
    type: "warning",
  }).then(
    () => {
      DictAPI.deleteByIds(attrGroupIds).then(() => {
        ElMessage.success(t('system.common.deleteSuccess'));
        handleResetQuery();
      });
    },
    () => {
      ElMessage.info(t('system.common.cancelDelete'));
    }
  );
}

// 打开字典项
function handleOpenDictData(row: DictPageVO) {
  router.push({
    path: "/system/dict-item",
    query: { dictCode: row.dictCode, title: "【" + row.name + "】" + t('system.dict.dictData') },
  });
}

onMounted(() => {
  handleQuery();
});
</script>
