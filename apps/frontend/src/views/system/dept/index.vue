<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
        <el-form-item :label="t('system.common.keyword')" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="t('system.dept.placeholder.keywords')"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item :label="t('system.common.status')" prop="status">
          <el-select v-model="queryParams.status" :placeholder="t('system.common.all')" clearable style="width: 100px">
            <el-option :value="1" :label="t('system.common.enable')" />
            <el-option :value="0" :label="t('system.common.disable')" />
          </el-select>
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button class="filter-item" type="primary" icon="search" @click="handleQuery">
            {{ t('system.common.search') }}
          </el-button>
          <el-button icon="refresh" @click="handleResetQuery">{{ t('system.common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button
            v-hasPerm="['sys:dept:add']"
            type="success"
            icon="plus"
            @click="handleOpenDialog()"
          >
            {{ t('system.common.add') }}
          </el-button>
          <el-button
            v-hasPerm="['sys:dept:delete']"
            type="danger"
            :disabled="selectIds.length === 0"
            icon="delete"
            @click="handleDelete()"
          >
            {{ t('system.common.delete') }}
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="deptList"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        class="data-table__content"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="name" :label="t('system.dept.name')" min-width="200" />
        <el-table-column prop="code" :label="t('system.dept.code')" width="200" />
        <el-table-column prop="status" :label="t('system.common.status')" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status == 1" type="success">{{ t('system.common.enable') }}</el-tag>
            <el-tag v-else type="info">{{ t('system.common.disable') }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="sort" :label="t('system.common.sort')" width="100" />

        <el-table-column :label="t('system.common.operation')" fixed="right" align="left" width="200">
          <template #default="scope">
            <el-button
              v-hasPerm="['sys:dept:add']"
              type="primary"
              link
              size="small"
              icon="plus"
              @click.stop="handleOpenDialog(scope.row.id, undefined)"
            >
              {{ t('system.common.add') }}
            </el-button>
            <el-button
              v-hasPerm="['sys:dept:edit']"
              type="primary"
              link
              size="small"
              icon="edit"
              @click.stop="handleOpenDialog(scope.row.parentId, scope.row.id)"
            >
              {{ t('system.common.edit') }}
            </el-button>
            <el-button
              v-hasPerm="['sys:dept:delete']"
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
    </el-card>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="600px"
      @closed="handleCloseDialog"
    >
      <el-form ref="deptFormRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item :label="t('system.dept.parentDept')" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :placeholder="t('system.dept.placeholder.selectParent')"
            :data="deptOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>
        <el-form-item :label="t('system.dept.name')" prop="name">
          <el-input v-model="formData.name" :placeholder="t('system.dept.placeholder.name')" />
        </el-form-item>
        <el-form-item :label="t('system.dept.code')" prop="code">
          <el-input v-model="formData.code" :placeholder="t('system.dept.placeholder.code')" />
        </el-form-item>
        <el-form-item :label="t('system.dept.displaySort')" prop="sort">
          <el-input-number
            v-model="formData.sort"
            controls-position="right"
            style="width: 100px"
            :min="0"
          />
        </el-form-item>
        <el-form-item :label="t('system.common.status')">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">{{ t('system.common.enable') }}</el-radio>
            <el-radio :value="0">{{ t('system.common.disable') }}</el-radio>
          </el-radio-group>
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
  name: "Dept",
  inheritAttrs: false,
});

import DeptAPI, { DeptVO, DeptForm, DeptQuery } from "@/api/system/dept.api";

const { t } = useI18n();

const queryFormRef = ref();
const deptFormRef = ref();

const loading = ref(false);
const selectIds = ref<number[]>([]);
const queryParams = reactive<DeptQuery>({});

const dialog = reactive({
  title: "",
  visible: false,
});

const deptList = ref<DeptVO[]>();
const deptOptions = ref<OptionType[]>();
const formData = reactive<DeptForm>({
  status: 1,
  parentId: "0",
  sort: 1,
});

const rules = computed(() => ({
  parentId: [{ required: true, message: t('system.dept.rules.parentDept'), trigger: "change" }],
  name: [{ required: true, message: t('system.dept.rules.name'), trigger: "blur" }],
  code: [{ required: true, message: t('system.dept.rules.code'), trigger: "blur" }],
  sort: [{ required: true, message: t('system.dept.rules.sort'), trigger: "blur" }],
}));

// 查询部门
function handleQuery() {
  loading.value = true;
  DeptAPI.getList(queryParams).then((data) => {
    deptList.value = data;
    loading.value = false;
  });
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

// 处理选中项变化
function handleSelectionChange(selection: any) {
  selectIds.value = selection.map((item: any) => item.id);
}

/**
 * 打开部门弹窗
 *
 * @param parentId 父部门ID
 * @param deptId 部门ID
 */
async function handleOpenDialog(parentId?: string, deptId?: string) {
  // 加载部门下拉数据
  const data = await DeptAPI.getOptions();
  deptOptions.value = [
    {
      value: "0",
      label: t('system.dept.topDept'),
      children: data,
    },
  ];

  dialog.visible = true;
  if (deptId) {
    dialog.title = t('system.dept.editDept');
    DeptAPI.getFormData(deptId).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = t('system.dept.addDept');
    formData.parentId = parentId || "0";
  }
}

// 提交部门表单
function handleSubmit() {
  deptFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const deptId = formData.id;
      if (deptId) {
        DeptAPI.update(deptId, formData)
          .then(() => {
            ElMessage.success(t('system.common.editSuccess'));
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        DeptAPI.create(formData)
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

// 删除部门
function handleDelete(deptId?: number) {
  const deptIds = [deptId || selectIds.value].join(",");

  if (!deptIds) {
    ElMessage.warning(t('system.common.selectDeleteItem'));
    return;
  }

  ElMessageBox.confirm(t('system.common.confirmDelete'), t('system.common.warning'), {
    confirmButtonText: t('system.common.confirm'),
    cancelButtonText: t('system.common.cancel'),
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      DeptAPI.deleteByIds(deptIds)
        .then(() => {
          ElMessage.success(t('system.common.deleteSuccess'));
          handleResetQuery();
        })
        .finally(() => (loading.value = false));
    },
    () => {
      ElMessage.info(t('system.common.cancelDelete'));
    }
  );
}

// 重置表单
function resetForm() {
  deptFormRef.value.resetFields();
  deptFormRef.value.clearValidate();

  formData.id = undefined;
  formData.parentId = "0";
  formData.status = 1;
  formData.sort = 1;
}

// 关闭弹窗
function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}

onMounted(() => {
  handleQuery();
});
</script>
