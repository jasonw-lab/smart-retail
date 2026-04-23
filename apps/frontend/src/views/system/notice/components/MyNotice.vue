<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item :label="t('system.notice.noticeTableTitle')" prop="title">
          <el-input
            v-model="queryParams.title"
            :placeholder="t('system.notice.placeholder.keyword')"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" @click="handleQuery()">
            <template #icon>
              <Search />
            </template>
            {{ t('system.common.search') }}
          </el-button>
          <el-button @click="handleResetQuery()">
            <template #icon>
              <Refresh />
            </template>
            {{ t('system.common.reset') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        class="data-table__content"
      >
        <el-table-column type="index" :label="t('system.config.index')" width="60" />
        <el-table-column :label="t('system.notice.noticeTableTitle')" prop="title" min-width="200" />
        <el-table-column align="center" :label="t('system.notice.type')" width="150">
          <template #default="scope">
            <DictLabel v-model="scope.row.type" code="notice_type" />
          </template>
        </el-table-column>
        <el-table-column align="center" :label="t('system.notice.publisher')" prop="publisherName" width="100" />
        <el-table-column align="center" :label="t('system.notice.level')" width="100">
          <template #default="scope">
            <DictLabel v-model="scope.row.level" code="notice_level" />
          </template>
        </el-table-column>
        <el-table-column
          key="releaseTime"
          align="center"
          :label="t('system.notice.publishTime')"
          prop="publishTime"
          width="150"
        />

        <el-table-column align="center" :label="t('system.notice.publisher')" prop="publisherName" width="150" />
        <el-table-column align="center" :label="t('system.notice.myNotice.readStatus')" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.isRead == 1" type="success">{{ t('system.notice.myNotice.read') }}</el-tag>
            <el-tag v-else type="info">{{ t('system.notice.myNotice.unread') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" :label="t('system.common.operation')" width="80">
          <template #default="scope">
            <el-button type="primary" size="small" link @click="handleReadNotice(scope.row.id)">
              {{ t('system.notice.view') }}
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

    <el-dialog
      v-model="noticeDialogVisible"
      :title="noticeDetail?.title ?? t('system.notice.detail')"
      width="800px"
      custom-class="notice-detail"
    >
      <div v-if="noticeDetail" class="notice-detail__wrapper">
        <div class="notice-detail__meta">
          <span>
            <el-icon><User /></el-icon>
            {{ noticeDetail.publisherName }}
          </span>
          <span class="ml-2">
            <el-icon><Timer /></el-icon>
            {{ noticeDetail.publishTime }}
          </span>
        </div>

        <div class="notice-detail__content">
          <div v-html="noticeDetail.content"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineOptions({
  name: "MyNotice",
  inheritAttrs: false,
});

import NoticeAPI, { NoticePageVO, NoticePageQuery, NoticeDetailVO } from "@/api/system/notice.api";

const { t } = useI18n();

const queryFormRef = ref();
const pageData = ref<NoticePageVO[]>([]);

const loading = ref(false);
const total = ref(0);

const queryParams = reactive<NoticePageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const noticeDialogVisible = ref(false);
const noticeDetail = ref<NoticeDetailVO | null>(null);

// 查询通知公告
function handleQuery() {
  loading.value = true;
  NoticeAPI.getMyNoticePage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 重置通知公告查询
function handleResetQuery() {
  queryFormRef.value!.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

// 阅读通知公告
function handleReadNotice(id: string) {
  NoticeAPI.getDetail(id).then((data) => {
    noticeDialogVisible.value = true;
    noticeDetail.value = data;
  });
}

onMounted(() => {
  handleQuery();
});
</script>

<style lang="scss" scoped>
:deep(.el-dialog__header) {
  text-align: center;
}
.notice-detail {
  &__wrapper {
    padding: 0 20px;
  }

  &__meta {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__publisher {
    margin-right: 24px;

    i {
      margin-right: 4px;
    }
  }

  &__content {
    max-height: 60vh;
    padding-top: 16px;
    margin-bottom: 24px;
    overflow-y: auto;
    border-top: 1px solid var(--el-border-color);

    &::-webkit-scrollbar {
      width: 6px;
    }
  }
}
</style>
