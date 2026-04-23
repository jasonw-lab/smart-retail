<!-- 字典项 -->
<template>
  <div class="app-container">
    <div class="search-bar mt-5">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-row :gutter="22">
          <el-col :span="24" :md="12" :lg="6">
            <el-form-item :label="t('system.common.keyword')" prop="keywords">
              <el-input
                v-model="queryParams.keywords"
                :placeholder="t('system.dict.item.placeholder.keywords')"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
          </el-col>

          <div class="search-form-btn-box">
            <div class="search-form-btn-box-item">
              <el-form-item>
                <el-button type="primary" icon="search" @click="handleQuery()">{{ t('system.common.search') }}</el-button>
                <el-button icon="refresh" @click="handleResetQuery()">{{ t('system.common.reset') }}</el-button>
              </el-form-item>
            </div>
          </div>
        </el-row>
      </el-form>
    </div>

    <el-card shadow="never">
      <div class="mb-[10px]">
        <el-button type="success" icon="plus" @click="handleOpenDialog()">{{ t('system.common.add') }}</el-button>
        <el-button type="danger" :disabled="ids.length === 0" icon="delete" @click="handleDelete()">
          {{ t('system.common.delete') }}
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        highlight-current-row
        :data="tableData"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="t('system.dict.item.label')" prop="label" />
        <el-table-column :label="t('system.dict.item.value')" prop="value" />
        <el-table-column :label="t('system.common.sort')" prop="sort" />
        <el-table-column :label="t('system.common.status')">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? t('system.common.enabled') : t('system.common.disabled') }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column fixed="right" :label="t('system.common.operation')" align="center" width="220">
          <template #default="scope">
            <el-button
              type="primary"
              link
              size="small"
              icon="edit"
              @click.stop="handleOpenDialog(scope.row)"
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

    <!--字典项弹窗-->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="820px"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="computedRules" label-width="100px">
        <el-card shadow="never">
          <el-form-item :label="t('system.dict.item.label')" prop="label">
            <el-input v-model="formData.label" :placeholder="t('system.dict.item.placeholder.label')" />
          </el-form-item>
          <el-form-item :label="t('system.dict.item.value')" prop="value">
            <el-input v-model="formData.value" :placeholder="t('system.dict.item.placeholder.value')" />
          </el-form-item>
          <el-form-item :label="t('system.common.status')">
            <el-radio-group v-model="formData.status">
              <el-radio :value="1">{{ t('system.common.enabled') }}</el-radio>
              <el-radio :value="0">{{ t('system.common.disabled') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="t('system.common.sort')">
            <el-input-number v-model="formData.sort" controls-position="right" />
          </el-form-item>
          <el-form-item :label="t('system.dict.item.tagType')">
            <el-tag v-if="formData.tagType" :type="formData.tagType" class="mr-2">
              {{ formData.label }}
            </el-tag>
            <el-radio-group v-model="formData.tagType">
              <el-radio value="success" border size="small">success</el-radio>
              <el-radio value="warning" border size="small">warning</el-radio>
              <el-radio value="info" border size="small">info</el-radio>
              <el-radio value="primary" border size="small">primary</el-radio>
              <el-radio value="danger" border size="small">danger</el-radio>
              <el-radio value="" border size="small">{{ t('system.dict.item.clear') }}</el-radio>
            </el-radio-group>
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
import DictAPI, { DictItemPageQuery, DictItemPageVO, DictItemForm } from "@/api/system/dict.api";

const { t } = useI18n();

const route = useRoute();

const dictCode = ref(route.query.dictCode as string);

const queryFormRef = ref();
const dataFormRef = ref();

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<DictItemPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const tableData = ref<DictItemPageVO[]>();

const dialog = reactive({
  title: "",
  visible: false,
});

const formData = reactive<DictItemForm>({});

const computedRules = computed(() => {
  const rules: Partial<Record<string, any>> = {
    value: [{ required: true, message: t('system.dict.item.rules.value'), trigger: "blur" }],
    label: [{ required: true, message: t('system.dict.item.rules.label'), trigger: "blur" }],
  };
  return rules;
});

// 查询
function handleQuery() {
  loading.value = true;
  DictAPI.getDictItemPage(dictCode.value, queryParams)
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

// 打开弹窗
function handleOpenDialog(row?: DictItemPageVO) {
  dialog.visible = true;
  dialog.title = row ? t('system.dict.item.editItem') : t('system.dict.item.addItem');

  if (row?.id) {
    DictAPI.getDictItemFormData(dictCode.value, row.id).then((data) => {
      Object.assign(formData, data);
    });
  }
}

// 提交表单
function handleSubmitClick() {
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      loading.value = true;
      const id = formData.id;
      formData.dictCode = dictCode.value;
      if (id) {
        DictAPI.updateDictItem(dictCode.value, id, formData)
          .then(() => {
            ElMessage.success(t('system.common.editSuccess'));
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        DictAPI.createDictItem(dictCode.value, formData)
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

// 关闭弹窗
function handleCloseDialog() {
  dialog.visible = false;

  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();

  formData.id = undefined;
  formData.sort = 1;
  formData.status = 1;
}
/**
 * 删除字典
 *
 * @param id 字典ID
 */
function handleDelete(id?: number) {
  const itemIds = [id || ids.value].join(",");
  if (!itemIds) {
    ElMessage.warning(t('system.common.selectDeleteItem'));
    return;
  }
  ElMessageBox.confirm(t('system.common.confirmDelete'), t('system.common.warning'), {
    confirmButtonText: t('system.common.confirm'),
    cancelButtonText: t('system.common.cancel'),
    type: "warning",
  }).then(
    () => {
      DictAPI.deleteDictItems(dictCode.value, itemIds).then(() => {
        ElMessage.success(t('system.common.deleteSuccess'));
        handleResetQuery();
      });
    },
    () => {
      ElMessage.info(t('system.common.cancelDelete'));
    }
  );
}

onMounted(() => {
  handleQuery();
});
</script>
