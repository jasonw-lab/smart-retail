<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form
        ref="queryFormRef"
        :model="queryParams"
        :inline="true"
        label-suffix=":"
        label-width="auto"
      >
        <el-form-item :label="t('system.notice.noticeTitle')" prop="title">
          <el-input
            v-model="queryParams.title"
            :placeholder="t('system.notice.placeholder.title')"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>

        <el-form-item :label="t('system.notice.publishStatus')" prop="publishStatus">
          <el-select
            v-model="queryParams.publishStatus"
            clearable
            :placeholder="t('system.common.all')"
            style="width: 100px"
          >
            <el-option :value="0" :label="t('system.notice.publishStatusOptions.unpublished')" />
            <el-option :value="1" :label="t('system.notice.publishStatusOptions.published')" />
            <el-option :value="-1" :label="t('system.notice.publishStatusOptions.revoked')" />
          </el-select>
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
          <el-button
            v-hasPerm="['sys:notice:add']"
            type="success"
            icon="plus"
            @click="handleOpenDialog()"
          >
            {{ t('system.notice.addNotice') }}
          </el-button>
          <el-button
            v-hasPerm="['sys:notice:delete']"
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
        ref="dataTableRef"
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        class="data-table__content"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" :label="t('system.config.index')" width="60" />
        <el-table-column :label="t('system.notice.noticeTableTitle')" prop="title" min-width="200" />
        <el-table-column align="center" :label="t('system.notice.type')" width="150">
          <template #default="scope">
            <DictLabel v-model="scope.row.type" :code="'notice_type'" />
          </template>
        </el-table-column>
        <el-table-column align="center" :label="t('system.notice.publisher')" prop="publisherName" width="150" />
        <el-table-column align="center" :label="t('system.notice.level')" width="100">
          <template #default="scope">
            <DictLabel v-model="scope.row.level" code="notice_level" />
          </template>
        </el-table-column>
        <el-table-column align="center" :label="t('system.notice.targetTypeColumn')" prop="targetType" min-width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.targetType == 1" type="warning">{{ t('system.notice.targetTypeOptions.all') }}</el-tag>
            <el-tag v-if="scope.row.targetType == 2" type="success">{{ t('system.notice.targetTypeOptions.specified') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="t('system.notice.publishStatus')" min-width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.publishStatus == 0" type="info">{{ t('system.notice.publishStatusOptions.unpublished') }}</el-tag>
            <el-tag v-if="scope.row.publishStatus == 1" type="success">{{ t('system.notice.publishStatusOptions.published') }}</el-tag>
            <el-tag v-if="scope.row.publishStatus == -1" type="warning">{{ t('system.notice.publishStatusOptions.revoked') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('system.notice.operationTime')" width="250">
          <template #default="scope">
            <div class="flex-x-start">
              <span>{{ t('system.common.createTime') }}：</span>
              <span>{{ scope.row.createTime || "-" }}</span>
            </div>

            <div v-if="scope.row.publishStatus === 1" class="flex-x-start">
              <span>{{ t('system.notice.publishTime') }}：</span>
              <span>{{ scope.row.publishTime || "-" }}</span>
            </div>
            <div v-else-if="scope.row.publishStatus === -1" class="flex-x-start">
              <span>{{ t('system.notice.revokeTime') }}：</span>
              <span>{{ scope.row.revokeTime || "-" }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" :label="t('system.common.operation')" width="150">
          <template #default="scope">
            <el-button type="primary" size="small" link @click="openDetailDialog(scope.row.id)">
              {{ t('system.notice.view') }}
            </el-button>
            <el-button
              v-if="scope.row.publishStatus != 1"
              v-hasPerm="['sys:notice:publish']"
              type="primary"
              size="small"
              link
              @click="handlePublish(scope.row.id)"
            >
              {{ t('system.notice.publish') }}
            </el-button>
            <el-button
              v-if="scope.row.publishStatus == 1"
              v-hasPerm="['sys:notice:revoke']"
              type="primary"
              size="small"
              link
              @click="handleRevoke(scope.row.id)"
            >
              {{ t('system.notice.revoke') }}
            </el-button>
            <el-button
              v-if="scope.row.publishStatus != 1"
              v-hasPerm="['sys:notice:edit']"
              type="primary"
              size="small"
              link
              @click="handleOpenDialog(scope.row.id)"
            >
              {{ t('system.common.edit') }}
            </el-button>
            <el-button
              v-if="scope.row.publishStatus != 1"
              v-hasPerm="['sys:notice:delete']"
              type="danger"
              size="small"
              link
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
        @pagination="handleQuery()"
      />
    </el-card>

    <!-- 通知公告表单弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      top="3vh"
      width="80%"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item :label="t('system.notice.noticeTableTitle')" prop="title">
          <el-input v-model="formData.title" :placeholder="t('system.notice.placeholder.noticeTitle')" clearable />
        </el-form-item>

        <el-form-item :label="t('system.notice.type')" prop="type">
          <Dict v-model="formData.type" code="notice_type" />
        </el-form-item>
        <el-form-item :label="t('system.notice.level')" prop="level">
          <Dict v-model="formData.level" code="notice_level" />
        </el-form-item>
        <el-form-item :label="t('system.notice.targetType')" prop="targetType">
          <el-radio-group v-model="formData.targetType">
            <el-radio :value="1">{{ t('system.notice.targetTypeOptions.all') }}</el-radio>
            <el-radio :value="2">{{ t('system.notice.targetTypeOptions.specified') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="formData.targetType == 2" :label="t('system.notice.targetUser')" prop="targetUserIds">
          <el-select v-model="formData.targetUserIds" multiple search :placeholder="t('system.notice.placeholder.selectUser')">
            <el-option
              v-for="item in userOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('system.notice.content')" prop="content">
          <WangEditor v-model="formData.content" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit()">{{ t('system.common.confirm') }}</el-button>
          <el-button @click="handleCloseDialog()">{{ t('system.common.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 通知公告详情 -->
    <el-dialog
      v-model="detailDialog.visible"
      :show-close="false"
      width="50%"
      append-to-body
      @close="closeDetailDialog"
    >
      <template #header>
        <div class="flex-x-between">
          <span>{{ t('system.notice.detail') }}</span>
          <div class="dialog-toolbar">
            <el-button circle @click="closeDetailDialog">
              <template #icon>
                <Close />
              </template>
            </el-button>
          </div>
        </div>
      </template>
      <el-descriptions :column="1">
        <el-descriptions-item :label="t('system.notice.noticeTitle') + '：'">
          {{ currentNotice.title }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('system.notice.publishStatus') + '：'">
          <el-tag v-if="currentNotice.publishStatus == 0" type="info">{{ t('system.notice.publishStatusOptions.unpublished') }}</el-tag>
          <el-tag v-else-if="currentNotice.publishStatus == 1" type="success">{{ t('system.notice.publishStatusOptions.published') }}</el-tag>
          <el-tag v-else-if="currentNotice.publishStatus == -1" type="warning">{{ t('system.notice.publishStatusOptions.revoked') }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="t('system.notice.publisher') + '：'">
          {{ currentNotice.publisherName }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('system.notice.publishTime') + '：'">
          {{ currentNotice.publishTime }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('system.notice.content') + '：'">
          <div class="notice-content" v-html="currentNotice.content" />
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineOptions({
  name: "Notice",
  inheritAttrs: false,
});

import NoticeAPI, {
  NoticePageVO,
  NoticeForm,
  NoticePageQuery,
  NoticeDetailVO,
} from "@/api/system/notice.api";
import UserAPI from "@/api/system/user.api";

const { t } = useI18n();

const queryFormRef = ref();
const dataFormRef = ref();

const loading = ref(false);
const selectIds = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<NoticePageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const userOptions = ref<OptionType[]>([]);
// 通知公告表格数据
const pageData = ref<NoticePageVO[]>([]);

// 弹窗
const dialog = reactive({
  title: "",
  visible: false,
});

// 通知公告表单数据
const formData = reactive<NoticeForm>({
  level: "L", // 默认优先级为低
  targetType: 1, // 默认目标类型为全体
});

// 通知公告表单校验规则
const rules = computed(() => ({
  title: [{ required: true, message: t('system.notice.rules.title'), trigger: "blur" }],
  content: [
    {
      required: true,
      message: t('system.notice.rules.content'),
      trigger: "blur",
      validator: (rule: any, value: string, callback: any) => {
        if (!value.replace(/<[^>]+>/g, "").trim()) {
          callback(new Error(t('system.notice.rules.content')));
        } else {
          callback();
        }
      },
    },
  ],
  type: [{ required: true, message: t('system.notice.rules.type'), trigger: "change" }],
}));

const detailDialog = reactive({
  visible: false,
});
const currentNotice = ref<NoticeDetailVO>({});

// 查询通知公告
function handleQuery() {
  loading.value = true;
  queryParams.pageNum = 1;
  NoticeAPI.getPage(queryParams)
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
  queryFormRef.value!.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

// 行复选框选中项变化
function handleSelectionChange(selection: any) {
  selectIds.value = selection.map((item: any) => item.id);
}

// 打开通知公告弹窗
function handleOpenDialog(id?: string) {
  UserAPI.getOptions().then((data) => {
    userOptions.value = data;
  });

  dialog.visible = true;
  if (id) {
    dialog.title = t('system.notice.editNotice');
    NoticeAPI.getFormData(id).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    Object.assign(formData, { level: 0, targetType: 0 });
    dialog.title = t('system.notice.addAnnouncement');
  }
}

// 发布通知公告
function handlePublish(id: string) {
  NoticeAPI.publish(id).then(() => {
    ElMessage.success(t('system.notice.publishSuccess'));
    handleQuery();
  });
}

// 撤回通知公告
function handleRevoke(id: string) {
  NoticeAPI.revoke(id).then(() => {
    ElMessage.success(t('system.notice.revokeSuccess'));
    handleQuery();
  });
}

// 通知公告表单提交
function handleSubmit() {
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const id = formData.id;
      if (id) {
        NoticeAPI.update(id, formData)
          .then(() => {
            ElMessage.success(t('system.common.editSuccess'));
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        NoticeAPI.create(formData)
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
  formData.targetType = 1;
}

// 关闭通知公告弹窗
function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}

// 删除通知公告
function handleDelete(id?: number) {
  const deleteIds = [id || selectIds.value].join(",");
  if (!deleteIds) {
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
      NoticeAPI.deleteByIds(deleteIds)
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

const closeDetailDialog = () => {
  detailDialog.visible = false;
};

const openDetailDialog = async (id: string) => {
  const noticeDetail = await NoticeAPI.getDetail(id);
  currentNotice.value = noticeDetail;
  detailDialog.visible = true;
};

onMounted(() => {
  handleQuery();
});
</script>
