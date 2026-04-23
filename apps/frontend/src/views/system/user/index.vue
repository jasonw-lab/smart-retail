<!-- 用户管理 -->
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 部门树 -->
      <el-col :lg="4" :xs="24" class="mb-[12px]">
        <DeptTree v-model="queryParams.deptId" @node-click="handleQuery" />
      </el-col>

      <!-- 用户列表 -->
      <el-col :lg="20" :xs="24">
        <!-- 搜索区域 -->
        <div class="search-container">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
            <el-form-item :label="t('system.common.keyword')" prop="keywords">
              <el-input
                v-model="queryParams.keywords"
                :placeholder="t('system.user.placeholder.keywords')"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item :label="t('system.common.status')" prop="status">
              <el-select
                v-model="queryParams.status"
                :placeholder="t('system.common.all')"
                clearable
                style="width: 100px"
              >
                <el-option :label="t('system.common.enable')" :value="1" />
                <el-option :label="t('system.common.disable')" :value="0" />
              </el-select>
            </el-form-item>

            <el-form-item :label="t('system.common.createTime')">
              <el-date-picker
                v-model="queryParams.createTime"
                :editable="false"
                type="daterange"
                range-separator="~"
                :start-placeholder="t('system.common.startTime')"
                :end-placeholder="t('system.common.endTime')"
                value-format="YYYY-MM-DD"
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
              <el-button
                v-hasPerm="['sys:user:add']"
                type="success"
                icon="plus"
                @click="handleOpenDialog()"
              >
                {{ t('system.common.add') }}
              </el-button>
              <el-button
                v-hasPerm="'sys:user:delete'"
                type="danger"
                icon="delete"
                :disabled="selectIds.length === 0"
                @click="handleDelete()"
              >
                {{ t('system.common.delete') }}
              </el-button>
            </div>
            <div class="data-table__toolbar--tools">
              <el-button
                v-hasPerm="'sys:user:import'"
                icon="upload"
                @click="handleOpenImportDialog"
              >
                {{ t('system.common.import') }}
              </el-button>

              <el-button v-hasPerm="'sys:user:export'" icon="download" @click="handleExport">
                {{ t('system.common.export') }}
              </el-button>
            </div>
          </div>

          <el-table
            v-loading="loading"
            :data="pageData"
            border
            stripe
            highlight-current-row
            class="data-table__content"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column :label="t('system.user.username')" prop="username" />
            <el-table-column :label="t('system.user.nickname')" width="150" align="center" prop="nickname" />
            <el-table-column :label="t('system.user.gender')" width="100" align="center">
              <template #default="scope">
                <DictLabel v-model="scope.row.gender" code="gender" />
              </template>
            </el-table-column>
            <el-table-column :label="t('system.user.department')" width="120" align="center" prop="deptName" />
            <el-table-column :label="t('system.user.mobile')" align="center" prop="mobile" width="120" />
            <el-table-column :label="t('system.user.email')" align="center" prop="email" width="160" />
            <el-table-column :label="t('system.common.status')" align="center" prop="status" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.status == 1 ? 'success' : 'info'">
                  {{ scope.row.status == 1 ? t('system.common.enable') : t('system.common.disable') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="t('system.common.createTime')" align="center" prop="createTime" width="150" />
            <el-table-column :label="t('system.common.operation')" fixed="right" width="220">
              <template #default="scope">
                <el-button
                  v-hasPerm="'sys:user:reset-password'"
                  type="primary"
                  icon="RefreshLeft"
                  size="small"
                  link
                  @click="hancleResetPassword(scope.row)"
                >
                  {{ t('system.user.resetPassword') }}
                </el-button>
                <el-button
                  v-hasPerm="'sys:user:edit'"
                  type="primary"
                  icon="edit"
                  link
                  size="small"
                  @click="handleOpenDialog(scope.row.id)"
                >
                  {{ t('system.common.edit') }}
                </el-button>
                <el-button
                  v-hasPerm="'sys:user:delete'"
                  type="danger"
                  icon="delete"
                  link
                  size="small"
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
      </el-col>
    </el-row>

    <!-- 用户表单 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <el-form ref="userFormRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item :label="t('system.user.username')" prop="username">
          <el-input
            v-model="formData.username"
            :readonly="!!formData.id"
            :placeholder="t('system.user.placeholder.username')"
          />
        </el-form-item>

        <el-form-item :label="t('system.user.userNickname')" prop="nickname">
          <el-input v-model="formData.nickname" :placeholder="t('system.user.placeholder.nickname')" />
        </el-form-item>

        <el-form-item :label="t('system.user.belongDept')" prop="deptId">
          <el-tree-select
            v-model="formData.deptId"
            :placeholder="t('system.user.placeholder.department')"
            :data="deptOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <el-form-item :label="t('system.user.gender')" prop="gender">
          <Dict v-model="formData.gender" code="gender" />
        </el-form-item>

        <el-form-item :label="t('system.user.role')" prop="roleIds">
          <el-select v-model="formData.roleIds" multiple :placeholder="t('system.common.pleaseSelect')">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('system.user.mobile')" prop="mobile">
          <el-input v-model="formData.mobile" :placeholder="t('system.user.placeholder.mobile')" maxlength="11" />
        </el-form-item>

        <el-form-item :label="t('system.user.email')" prop="email">
          <el-input v-model="formData.email" :placeholder="t('system.user.placeholder.email')" maxlength="50" />
        </el-form-item>

        <el-form-item :label="t('system.common.status')" prop="status">
          <el-switch
            v-model="formData.status"
            inline-prompt
            :active-text="t('system.common.enable')"
            :inactive-text="t('system.common.disable')"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">{{ t('system.common.confirm') }}</el-button>
          <el-button @click="handleCloseDialog">{{ t('system.common.cancel') }}</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 用户导入 -->
    <UserImport v-model="importDialogVisible" @import-success="handleQuery()" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/store/modules/app.store";
import { DeviceEnum } from "@/enums/settings/device.enum";

import UserAPI, { UserForm, UserPageQuery, UserPageVO } from "@/api/system/user.api";
import DeptAPI from "@/api/system/dept.api";
import RoleAPI from "@/api/system/role.api";

import DeptTree from "./components/DeptTree.vue";
import UserImport from "./components/UserImport.vue";

defineOptions({
  name: "User",
  inheritAttrs: false,
});

const { t } = useI18n();
const appStore = useAppStore();

const queryFormRef = ref();
const userFormRef = ref();

const queryParams = reactive<UserPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const pageData = ref<UserPageVO[]>();
const total = ref(0);
const loading = ref(false);

const dialog = reactive({
  visible: false,
  title: "",
});
const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

const formData = reactive<UserForm>({
  status: 1,
});

const rules = computed(() => ({
  username: [{ required: true, message: t('system.user.rules.username'), trigger: "blur" }],
  nickname: [{ required: true, message: t('system.user.rules.nickname'), trigger: "blur" }],
  deptId: [{ required: true, message: t('system.user.rules.department'), trigger: "blur" }],
  roleIds: [{ required: true, message: t('system.user.rules.role'), trigger: "blur" }],
  email: [
    {
      pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
      message: t('system.user.rules.email'),
      trigger: "blur",
    },
  ],
  mobile: [
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: t('system.user.rules.mobile'),
      trigger: "blur",
    },
  ],
}));

// 选中的用户ID
const selectIds = ref<number[]>([]);
// 部门下拉数据源
const deptOptions = ref<OptionType[]>();
// 角色下拉数据源
const roleOptions = ref<OptionType[]>();
// 导入弹窗显示状态
const importDialogVisible = ref(false);

// 查询
async function handleQuery() {
  loading.value = true;
  queryParams.pageNum = 1;
  UserAPI.getPage(queryParams)
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
  queryParams.deptId = undefined;
  queryParams.createTime = undefined;
  handleQuery();
}

// 选中项发生变化
function handleSelectionChange(selection: any[]) {
  selectIds.value = selection.map((item) => item.id);
}

// 重置密码
function hancleResetPassword(row: UserPageVO) {
  ElMessageBox.prompt(t('system.user.message.resetPasswordPrompt', { username: row.username }), t('system.user.message.resetPasswordTitle'), {
    confirmButtonText: t('system.common.confirm'),
    cancelButtonText: t('system.common.cancel'),
  }).then(
    ({ value }) => {
      if (!value || value.length < 6) {
        ElMessage.warning(t('system.user.message.passwordMinLength'));
        return false;
      }
      UserAPI.resetPassword(row.id, value).then(() => {
        ElMessage.success(t('system.user.message.resetPasswordSuccess', { password: value }));
      });
    },
    () => {
      ElMessage.info(t('system.user.message.cancelResetPassword'));
    }
  );
}

/**
 * 打开弹窗
 *
 * @param id 用户ID
 */
async function handleOpenDialog(id?: string) {
  dialog.visible = true;
  // 加载角色下拉数据源
  roleOptions.value = await RoleAPI.getOptions();
  // 加载部门下拉数据源
  deptOptions.value = await DeptAPI.getOptions();

  if (id) {
    dialog.title = t('system.user.editUser');
    UserAPI.getFormData(id).then((data) => {
      Object.assign(formData, { ...data });
    });
  } else {
    dialog.title = t('system.user.addUser');
  }
}

// 关闭弹窗
function handleCloseDialog() {
  dialog.visible = false;
  userFormRef.value.resetFields();
  userFormRef.value.clearValidate();

  formData.id = undefined;
  formData.status = 1;
}

// 提交用户表单（防抖）
const handleSubmit = useDebounceFn(() => {
  userFormRef.value.validate((valid: boolean) => {
    if (valid) {
      const userId = formData.id;
      loading.value = true;
      if (userId) {
        UserAPI.update(userId, formData)
          .then(() => {
            ElMessage.success(t('system.common.editSuccess'));
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        UserAPI.create(formData)
          .then(() => {
            ElMessage.success(t('system.common.addSuccess'));
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}, 1000);

/**
 * 删除用户
 *
 * @param id  用户ID
 */
function handleDelete(id?: number) {
  const userIds = [id || selectIds.value].join(",");
  if (!userIds) {
    ElMessage.warning(t('system.common.selectDeleteItem'));
    return;
  }

  ElMessageBox.confirm(t('system.user.message.confirmDeleteUser'), t('system.common.warning'), {
    confirmButtonText: t('system.common.confirm'),
    cancelButtonText: t('system.common.cancel'),
    type: "warning",
  }).then(
    function () {
      loading.value = true;
      UserAPI.deleteByIds(userIds)
        .then(() => {
          ElMessage.success(t('system.common.deleteSuccess'));
          handleResetQuery();
        })
        .finally(() => (loading.value = false));
    },
    function () {
      ElMessage.info(t('system.common.cancelDelete'));
    }
  );
}

// 打开导入弹窗
function handleOpenImportDialog() {
  importDialogVisible.value = true;
}

// 导出用户
function handleExport() {
  UserAPI.export(queryParams).then((response: any) => {
    const fileData = response.data;
    const fileName = decodeURI(response.headers["content-disposition"].split(";")[1].split("=")[1]);
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8";

    const blob = new Blob([fileData], { type: fileType });
    const downloadUrl = window.URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = fileName;

    document.body.appendChild(downloadLink);
    downloadLink.click();

    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(downloadUrl);
  });
}

onMounted(() => {
  handleQuery();
});
</script>
