<template>
  <div>
    <el-dialog
      v-model="visible"
      :align-center="true"
      :title="t('system.user.import.title')"
      width="600px"
      @close="handleClose"
    >
      <el-scrollbar max-height="60vh">
        <el-form
          ref="importFormRef"
          label-width="auto"
          style="padding-right: var(--el-dialog-padding-primary)"
          :model="importFormData"
          :rules="importFormRules"
        >
          <el-form-item :label="t('system.user.import.fileName')" prop="files">
            <el-upload
              ref="uploadRef"
              v-model:file-list="importFormData.files"
              class="w-full"
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              :drag="true"
              :limit="1"
              :auto-upload="false"
              :on-exceed="handleFileExceed"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                {{ t('system.user.import.dragText') }}
                <em>{{ t('system.user.import.clickUpload') }}</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  {{ t('system.user.import.tip') }}
                  <el-link
                    type="primary"
                    icon="download"
                    underline="never"
                    @click="handleDownloadTemplate"
                  >
                    {{ t('system.user.import.downloadTemplate') }}
                  </el-link>
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <div style="padding-right: var(--el-dialog-padding-primary)">
          <el-button v-if="resultData.length > 0" type="primary" @click="handleShowResult">
            {{ t('system.user.import.errorInfo') }}
          </el-button>
          <el-button
            type="primary"
            :disabled="importFormData.files.length === 0"
            @click="handleUpload"
          >
            {{ t('system.common.confirm') }}
          </el-button>
          <el-button @click="handleClose">{{ t('system.common.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="resultVisible" :title="t('system.user.import.result')" width="600px">
      <el-alert
        :title="t('system.user.import.resultInfo', { invalid: invalidCount, valid: validCount })"
        type="warning"
        :closable="false"
      />
      <el-table :data="resultData" style="width: 100%; max-height: 400px">
        <el-table-column prop="index" align="center" width="100" type="index" :label="t('system.user.import.index')" />
        <el-table-column prop="message" :label="t('system.user.import.errorInfo')" width="400">
          <template #default="scope">
            {{ scope.row }}
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseResult">{{ t('system.common.close') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { ElMessage, type UploadUserFile } from "element-plus";
import UserAPI from "@/api/system/user.api";
import { ResultEnum } from "@/enums/api/result.enum";

const { t } = useI18n();

const emit = defineEmits(["import-success"]);
const visible = defineModel("modelValue", {
  type: Boolean,
  required: true,
  default: false,
});

const resultVisible = ref(false);
const resultData = ref<string[]>([]);
const invalidCount = ref(0);
const validCount = ref(0);

const importFormRef = ref(null);
const uploadRef = ref(null);

const importFormData = reactive<{
  files: UploadUserFile[];
}>({
  files: [],
});

watch(visible, (newValue) => {
  if (newValue) {
    resultData.value = [];
    resultVisible.value = false;
    invalidCount.value = 0;
    validCount.value = 0;
  }
});

const importFormRules = computed(() => ({
  files: [{ required: true, message: t('system.user.import.fileRequired'), trigger: "blur" }],
}));

// 文件超出个数限制
const handleFileExceed = () => {
  ElMessage.warning(t('system.user.import.fileLimit'));
};

// 下载导入模板
const handleDownloadTemplate = () => {
  UserAPI.downloadTemplate().then((response: any) => {
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
};

// 上传文件
const handleUpload = async () => {
  if (!importFormData.files.length) {
    ElMessage.warning(t('system.user.import.selectFile'));
    return;
  }

  try {
    const result = await UserAPI.import("1", importFormData.files[0].raw as File);
    if (result.code === ResultEnum.SUCCESS && result.invalidCount === 0) {
      ElMessage.success(t('system.user.import.success', { count: result.validCount }));
      emit("import-success");
      handleClose();
    } else {
      ElMessage.error(t('system.user.import.failed'));
      resultVisible.value = true;
      resultData.value = result.messageList;
      invalidCount.value = result.invalidCount;
      validCount.value = result.validCount;
    }
  } catch (error: any) {
    console.error(error);
    ElMessage.error(t('system.user.import.failed') + "：" + error);
  }
};

// 显示错误信息
const handleShowResult = () => {
  resultVisible.value = true;
};

// 关闭错误信息弹窗
const handleCloseResult = () => {
  resultVisible.value = false;
};

// 关闭弹窗
const handleClose = () => {
  importFormData.files.length = 0;
  visible.value = false;
};
</script>
