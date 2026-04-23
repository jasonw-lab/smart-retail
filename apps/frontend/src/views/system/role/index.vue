<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
        <el-form-item prop="keywords" :label="t('system.common.keyword')">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="t('system.role.placeholder.keywords')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">
            {{ t('system.common.search') }}
          </el-button>
          <el-button icon="refresh" @click="handleResetQuery">
            {{ t('system.common.reset') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" icon="plus" @click="handleOpenDialog()">
            {{ t('system.common.add') }}
          </el-button>
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
        ref="dataTableRef"
        v-loading="loading"
        :data="roleList"
        highlight-current-row
        border
        class="data-table__content"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="t('system.role.name')" prop="name" min-width="100" />
        <el-table-column :label="t('system.role.code')" prop="code" width="150" />

        <el-table-column :label="t('system.common.status')" align="center" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success">
              {{ t('system.role.status.normal') }}
            </el-tag>
            <el-tag v-else type="info">{{ t('system.role.status.disabled') }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="t('system.common.sort')" align="center" width="80" prop="sort" />

        <el-table-column fixed="right" :label="t('system.common.operation')" width="220">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              link
              icon="position"
              @click="handleOpenAssignPermDialog(scope.row)"
            >
              {{ t('system.role.assignPermission') }}
            </el-button>
            <el-button
              type="primary"
              size="small"
              link
              icon="edit"
              @click="handleOpenDialog(scope.row.id)"
            >
              {{ t('system.common.edit') }}
            </el-button>
            <el-button
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

    <!-- 角色表单弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      @close="handleCloseDialog"
    >
      <el-form ref="roleFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item :label="t('system.role.name')" prop="name">
          <el-input v-model="formData.name" :placeholder="t('system.role.placeholder.name')" />
        </el-form-item>

        <el-form-item :label="t('system.role.code')" prop="code">
          <el-input v-model="formData.code" :placeholder="t('system.role.placeholder.code')" />
        </el-form-item>

        <el-form-item :label="t('system.role.dataScope')" prop="dataScope">
          <el-select v-model="formData.dataScope">
            <el-option :key="1" :label="t('system.role.dataScopeOptions.all')" :value="1" />
            <el-option :key="2" :label="t('system.role.dataScopeOptions.deptAndChild')" :value="2" />
            <el-option :key="3" :label="t('system.role.dataScopeOptions.dept')" :value="3" />
            <el-option :key="4" :label="t('system.role.dataScopeOptions.self')" :value="4" />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('system.common.status')" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">{{ t('system.role.status.normal') }}</el-radio>
            <el-radio :value="0">{{ t('system.role.status.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="t('system.common.sort')" prop="sort">
          <el-input-number
            v-model="formData.sort"
            controls-position="right"
            :min="0"
            style="width: 100px"
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

    <!-- 分配权限弹窗 -->
    <el-drawer
      v-model="assignPermDialogVisible"
      :title="'【' + checkedRole.name + '】' + t('system.role.permission.title')"
      :size="drawerSize"
    >
      <div class="flex-x-between">
        <el-input v-model="permKeywords" clearable class="w-[150px]" :placeholder="t('system.role.permission.menuName')">
          <template #prefix>
            <Search />
          </template>
        </el-input>

        <div class="flex-center ml-5">
          <el-button type="primary" size="small" plain @click="togglePermTree">
            <template #icon>
              <Switch />
            </template>
            {{ isExpanded ? t('system.role.permission.collapse') : t('system.role.permission.expand') }}
          </el-button>
          <el-checkbox
            v-model="parentChildLinked"
            class="ml-5"
            @change="handleparentChildLinkedChange"
          >
            {{ t('system.role.permission.parentChildLinked') }}
          </el-checkbox>

          <el-tooltip placement="bottom">
            <template #content>
              {{ t('system.role.permission.linkTip') }}
            </template>
            <el-icon class="ml-1 color-[--el-color-primary] inline-block cursor-pointer">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>
      </div>

      <el-tree
        ref="permTreeRef"
        node-key="value"
        show-checkbox
        :data="menuPermOptions"
        :filter-node-method="handlePermFilter"
        :default-expand-all="true"
        :check-strictly="!parentChildLinked"
        class="mt-5"
      >
        <template #default="{ data }">
          {{ data.label }}
        </template>
      </el-tree>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleAssignPermSubmit">{{ t('system.common.confirm') }}</el-button>
          <el-button @click="assignPermDialogVisible = false">{{ t('system.common.cancel') }}</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/store/modules/app.store";
import { DeviceEnum } from "@/enums/settings/device.enum";

import RoleAPI, { RolePageVO, RoleForm, RolePageQuery } from "@/api/system/role.api";
import MenuAPI from "@/api/system/menu.api";

defineOptions({
  name: "Role",
  inheritAttrs: false,
});

const { t } = useI18n();
const appStore = useAppStore();

const queryFormRef = ref();
const roleFormRef = ref();
const permTreeRef = ref();

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<RolePageQuery>({
  pageNum: 1,
  pageSize: 10,
});

// 角色表格数据
const roleList = ref<RolePageVO[]>();
// 菜单权限下拉
const menuPermOptions = ref<OptionType[]>([]);

// 弹窗
const dialog = reactive({
  title: "",
  visible: false,
});

const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

// 角色表单
const formData = reactive<RoleForm>({
  sort: 1,
  status: 1,
});

const rules = computed(() => ({
  name: [{ required: true, message: t('system.role.rules.name'), trigger: "blur" }],
  code: [{ required: true, message: t('system.role.rules.code'), trigger: "blur" }],
  dataScope: [{ required: true, message: t('system.role.rules.dataScope'), trigger: "blur" }],
  status: [{ required: true, message: t('system.role.rules.status'), trigger: "blur" }],
}));

// 选中的角色
interface CheckedRole {
  id?: string;
  name?: string;
}
const checkedRole = ref<CheckedRole>({});
const assignPermDialogVisible = ref(false);

const permKeywords = ref("");
const isExpanded = ref(true);

const parentChildLinked = ref(true);

// 查询
function handleQuery() {
  loading.value = true;
  queryParams.pageNum = 1;
  RoleAPI.getPage(queryParams)
    .then((data) => {
      roleList.value = data.list;
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

// 行复选框选中
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
}

// 打开角色弹窗
function handleOpenDialog(roleId?: string) {
  dialog.visible = true;
  if (roleId) {
    dialog.title = t('system.role.editRole');
    RoleAPI.getFormData(roleId).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = t('system.role.addRole');
  }
}

// 提交角色表单
function handleSubmit() {
  roleFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const roleId = formData.id;
      if (roleId) {
        RoleAPI.update(roleId, formData)
          .then(() => {
            ElMessage.success(t('system.common.editSuccess'));
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        RoleAPI.create(formData)
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

// 关闭弹窗
function handleCloseDialog() {
  dialog.visible = false;

  roleFormRef.value.resetFields();
  roleFormRef.value.clearValidate();

  formData.id = undefined;
  formData.sort = 1;
  formData.status = 1;
}

// 删除角色
function handleDelete(roleId?: number) {
  const roleIds = [roleId || ids.value].join(",");
  if (!roleIds) {
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
      RoleAPI.deleteByIds(roleIds)
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

// 打开分配菜单权限弹窗
async function handleOpenAssignPermDialog(row: RolePageVO) {
  const roleId = row.id;
  if (roleId) {
    assignPermDialogVisible.value = true;
    loading.value = true;

    checkedRole.value.id = roleId;
    checkedRole.value.name = row.name;

    // 获取所有的菜单
    menuPermOptions.value = await MenuAPI.getOptions();

    // 回显角色已拥有的菜单
    RoleAPI.getRoleMenuIds(roleId)
      .then((data) => {
        const checkedMenuIds = data;
        checkedMenuIds.forEach((menuId) => permTreeRef.value!.setChecked(menuId, true, false));
      })
      .finally(() => {
        loading.value = false;
      });
  }
}

// 分配菜单权限提交
function handleAssignPermSubmit() {
  const roleId = checkedRole.value.id;
  if (roleId) {
    const checkedMenuIds: number[] = permTreeRef
      .value!.getCheckedNodes(false, true)
      .map((node: any) => node.value);

    loading.value = true;
    RoleAPI.updateRoleMenus(roleId, checkedMenuIds)
      .then(() => {
        ElMessage.success(t('system.role.permission.assignSuccess'));
        assignPermDialogVisible.value = false;
        handleResetQuery();
      })
      .finally(() => {
        loading.value = false;
      });
  }
}

// 展开/收缩 菜单权限树
function togglePermTree() {
  isExpanded.value = !isExpanded.value;
  if (permTreeRef.value) {
    Object.values(permTreeRef.value.store.nodesMap).forEach((node: any) => {
      if (isExpanded.value) {
        node.expand();
      } else {
        node.collapse();
      }
    });
  }
}

// 权限筛选
watch(permKeywords, (val) => {
  permTreeRef.value!.filter(val);
});

function handlePermFilter(
  value: string,
  data: {
    [key: string]: any;
  }
) {
  if (!value) return true;
  return data.label.includes(value);
}

// 父子菜单节点是否联动
function handleparentChildLinkedChange(val: any) {
  parentChildLinked.value = val;
}

onMounted(() => {
  handleQuery();
});
</script>
