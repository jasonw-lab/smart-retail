<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
        <el-form-item :label="t('system.common.keyword')" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="t('system.menu.placeholder.keywords')"
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
            v-hasPerm="['sys:menu:add']"
            type="success"
            icon="plus"
            @click="handleOpenDialog('0')"
          >
            {{ t('system.common.add') }}
          </el-button>
        </div>
      </div>

      <el-table
        ref="dataTableRef"
        v-loading="loading"
        row-key="id"
        :data="menuTableData"
        :tree-props="{
          children: 'children',
          hasChildren: 'hasChildren',
        }"
        class="data-table__content"
        @row-click="handleRowClick"
      >
        <el-table-column :label="t('system.menu.name')" min-width="200">
          <template #default="scope">
            <template v-if="scope.row.icon && scope.row.icon.startsWith('el-icon')">
              <el-icon style="vertical-align: -0.15em">
                <component :is="scope.row.icon.replace('el-icon-', '')" />
              </el-icon>
            </template>
            <template v-else-if="scope.row.icon">
              <div :class="`i-svg:${scope.row.icon}`" />
            </template>
            {{ scope.row.name }}
          </template>
        </el-table-column>

        <el-table-column :label="t('system.menu.type')" align="center" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.type === MenuTypeEnum.CATALOG" type="warning">{{ t('system.menu.types.catalog') }}</el-tag>
            <el-tag v-if="scope.row.type === MenuTypeEnum.MENU" type="success">{{ t('system.menu.types.menu') }}</el-tag>
            <el-tag v-if="scope.row.type === MenuTypeEnum.BUTTON" type="danger">{{ t('system.menu.types.button') }}</el-tag>
            <el-tag v-if="scope.row.type === MenuTypeEnum.EXTLINK" type="info">{{ t('system.menu.types.extlink') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('system.menu.routeName')" align="left" width="150" prop="routeName" />
        <el-table-column :label="t('system.menu.routePath')" align="left" width="150" prop="routePath" />
        <el-table-column :label="t('system.menu.component')" align="left" width="250" prop="component" />
        <el-table-column :label="t('system.menu.permission')" align="center" width="200" prop="perm" />
        <el-table-column :label="t('system.common.status')" align="center" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.visible === 1" type="success">{{ t('system.common.show') }}</el-tag>
            <el-tag v-else type="info">{{ t('system.common.hide') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('system.common.sort')" align="center" width="80" prop="sort" />
        <el-table-column fixed="right" align="center" :label="t('system.common.operation')" width="220">
          <template #default="scope">
            <el-button
              v-if="scope.row.type == MenuTypeEnum.CATALOG || scope.row.type == MenuTypeEnum.MENU"
              v-hasPerm="['sys:menu:add']"
              type="primary"
              link
              size="small"
              icon="plus"
              @click.stop="handleOpenDialog(scope.row.id)"
            >
              {{ t('system.common.add') }}
            </el-button>

            <el-button
              v-hasPerm="['sys:menu:edit']"
              type="primary"
              link
              size="small"
              icon="edit"
              @click.stop="handleOpenDialog(undefined, scope.row.id)"
            >
              {{ t('system.common.edit') }}
            </el-button>
            <el-button
              v-hasPerm="['sys:menu:delete']"
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

    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <el-form ref="menuFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item :label="t('system.menu.parentMenu')" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :placeholder="t('system.menu.placeholder.selectParent')"
            :data="menuOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <el-form-item :label="t('system.menu.name')" prop="name">
          <el-input v-model="formData.name" :placeholder="t('system.menu.placeholder.name')" />
        </el-form-item>

        <el-form-item :label="t('system.menu.type')" prop="type">
          <el-radio-group v-model="formData.type" @change="handleMenuTypeChange">
            <el-radio :value="MenuTypeEnum.CATALOG">{{ t('system.menu.types.catalog') }}</el-radio>
            <el-radio :value="MenuTypeEnum.MENU">{{ t('system.menu.types.menu') }}</el-radio>
            <el-radio :value="MenuTypeEnum.BUTTON">{{ t('system.menu.types.button') }}</el-radio>
            <el-radio :value="MenuTypeEnum.EXTLINK">{{ t('system.menu.types.extlink') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="formData.type == MenuTypeEnum.EXTLINK" :label="t('system.menu.externalLink')" prop="path">
          <el-input v-model="formData.routePath" :placeholder="t('system.menu.placeholder.externalLink')" />
        </el-form-item>

        <el-form-item v-if="formData.type == MenuTypeEnum.MENU" prop="routeName">
          <template #label>
            <div class="flex-y-center">
              {{ t('system.menu.routeName') }}
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  {{ t('system.menu.tooltip.routeName') }}
                </template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-input v-model="formData.routeName" :placeholder="t('system.menu.placeholder.routeName')" />
        </el-form-item>

        <el-form-item
          v-if="formData.type == MenuTypeEnum.CATALOG || formData.type == MenuTypeEnum.MENU"
          prop="routePath"
        >
          <template #label>
            <div class="flex-y-center">
              {{ t('system.menu.routePath') }}
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  {{ t('system.menu.tooltip.routePath') }}
                </template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-input
            v-if="formData.type == MenuTypeEnum.CATALOG"
            v-model="formData.routePath"
            :placeholder="t('system.menu.placeholder.routePathCatalog')"
          />
          <el-input v-else v-model="formData.routePath" :placeholder="t('system.menu.placeholder.routePathMenu')" />
        </el-form-item>

        <el-form-item v-if="formData.type == MenuTypeEnum.MENU" prop="component">
          <template #label>
            <div class="flex-y-center">
              {{ t('system.menu.component') }}
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  {{ t('system.menu.tooltip.component') }}
                </template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>

          <el-input v-model="formData.component" :placeholder="t('system.menu.placeholder.component')" style="width: 95%">
            <template v-if="formData.type == MenuTypeEnum.MENU" #prepend>src/views/</template>
            <template v-if="formData.type == MenuTypeEnum.MENU" #append>.vue</template>
          </el-input>
        </el-form-item>

        <el-form-item v-if="formData.type == MenuTypeEnum.MENU">
          <template #label>
            <div class="flex-y-center">
              {{ t('system.menu.routeParams') }}
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  {{ t('system.menu.tooltip.routeParams') }}
                </template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>

          <div v-if="!formData.params || formData.params.length === 0">
            <el-button type="success" plain @click="formData.params = [{ key: '', value: '' }]">
              {{ t('system.menu.addRouteParams') }}
            </el-button>
          </div>

          <div v-else>
            <div v-for="(item, index) in formData.params" :key="index">
              <el-input v-model="item.key" :placeholder="t('system.menu.paramName')" style="width: 100px" />

              <span class="mx-1">=</span>

              <el-input v-model="item.value" :placeholder="t('system.menu.paramValue')" style="width: 100px" />

              <el-icon
                v-if="formData.params.indexOf(item) === formData.params.length - 1"
                class="ml-2 cursor-pointer color-[var(--el-color-success)]"
                style="vertical-align: -0.15em"
                @click="formData.params.push({ key: '', value: '' })"
              >
                <CirclePlusFilled />
              </el-icon>
              <el-icon
                class="ml-2 cursor-pointer color-[var(--el-color-danger)]"
                style="vertical-align: -0.15em"
                @click="formData.params.splice(formData.params.indexOf(item), 1)"
              >
                <DeleteFilled />
              </el-icon>
            </div>
          </div>
        </el-form-item>

        <el-form-item v-if="formData.type !== MenuTypeEnum.BUTTON" prop="visible" :label="t('system.menu.visibleStatus')">
          <el-radio-group v-model="formData.visible">
            <el-radio :value="1">{{ t('system.common.show') }}</el-radio>
            <el-radio :value="0">{{ t('system.common.hide') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="formData.type === MenuTypeEnum.CATALOG || formData.type === MenuTypeEnum.MENU"
        >
          <template #label>
            <div class="flex-y-center">
              {{ t('system.menu.alwaysShow') }}
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  <div style="white-space: pre-line">{{ t('system.menu.tooltip.alwaysShow') }}</div>
                </template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>

          <el-radio-group v-model="formData.alwaysShow">
            <el-radio :value="1">{{ t('system.common.yes') }}</el-radio>
            <el-radio :value="0">{{ t('system.common.no') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="formData.type === MenuTypeEnum.MENU" :label="t('system.menu.cachePage')">
          <el-radio-group v-model="formData.keepAlive">
            <el-radio :value="1">{{ t('system.common.open') }}</el-radio>
            <el-radio :value="0">{{ t('system.common.close') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="t('system.common.sort')" prop="sort">
          <el-input-number
            v-model="formData.sort"
            style="width: 100px"
            controls-position="right"
            :min="0"
          />
        </el-form-item>

        <!-- 权限标识 -->
        <el-form-item v-if="formData.type == MenuTypeEnum.BUTTON" :label="t('system.menu.permission')" prop="perm">
          <el-input v-model="formData.perm" :placeholder="t('system.menu.placeholder.permission')" />
        </el-form-item>

        <el-form-item v-if="formData.type !== MenuTypeEnum.BUTTON" :label="t('system.menu.icon')" prop="icon">
          <!-- 图标选择器 -->
          <icon-select v-model="formData.icon" />
        </el-form-item>

        <el-form-item v-if="formData.type == MenuTypeEnum.CATALOG" :label="t('system.menu.redirect')">
          <el-input v-model="formData.redirect" :placeholder="t('system.menu.placeholder.redirect')" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">{{ t('system.common.confirm') }}</el-button>
          <el-button @click="handleCloseDialog">{{ t('system.common.cancel') }}</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/store/modules/app.store";
import { DeviceEnum } from "@/enums/settings/device.enum";

import MenuAPI, { MenuQuery, MenuForm, MenuVO } from "@/api/system/menu.api";
import { MenuTypeEnum } from "@/enums/system/menu.enum";

defineOptions({
  name: "SysMenu",
  inheritAttrs: false,
});

const { t } = useI18n();
const appStore = useAppStore();

const queryFormRef = ref();
const menuFormRef = ref();

const loading = ref(false);
const dialog = reactive({
  title: "",
  visible: false,
});

const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));
// 查询参数
const queryParams = reactive<MenuQuery>({});
// 菜单表格数据
const menuTableData = ref<MenuVO[]>([]);
// 顶级菜单下拉选项
const menuOptions = ref<OptionType[]>([]);
// 初始菜单表单数据
const initialMenuFormData = ref<MenuForm>({
  id: undefined,
  parentId: "0",
  visible: 1,
  sort: 1,
  type: MenuTypeEnum.MENU, // 默认菜单
  alwaysShow: 0,
  keepAlive: 1,
  params: [],
});
// 菜单表单数据
const formData = ref({ ...initialMenuFormData.value });
// 表单验证规则
const rules = computed(() => ({
  parentId: [{ required: true, message: t('system.menu.rules.parentMenu'), trigger: "blur" }],
  name: [{ required: true, message: t('system.menu.rules.name'), trigger: "blur" }],
  type: [{ required: true, message: t('system.menu.rules.type'), trigger: "blur" }],
  routeName: [{ required: true, message: t('system.menu.rules.routeName'), trigger: "blur" }],
  routePath: [{ required: true, message: t('system.menu.rules.routePath'), trigger: "blur" }],
  component: [{ required: true, message: t('system.menu.rules.component'), trigger: "blur" }],
  visible: [{ required: true, message: t('system.menu.rules.visibleStatus'), trigger: "change" }],
}));

// 选择表格的行菜单ID
const selectedMenuId = ref<string | undefined>();

// 查询菜单
function handleQuery() {
  loading.value = true;
  MenuAPI.getList(queryParams)
    .then((data) => {
      menuTableData.value = data;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

// 行点击事件
function handleRowClick(row: MenuVO) {
  selectedMenuId.value = row.id;
}

/**
 * 打开表单弹窗
 *
 * @param parentId 父菜单ID
 * @param menuId 菜单ID
 */
function handleOpenDialog(parentId?: string, menuId?: string) {
  MenuAPI.getOptions(true)
    .then((data) => {
      menuOptions.value = [{ value: "0", label: t('system.menu.topMenu'), children: data }];
    })
    .then(() => {
      dialog.visible = true;
      if (menuId) {
        dialog.title = t('system.menu.editMenu');
        MenuAPI.getFormData(menuId).then((data) => {
          initialMenuFormData.value = { ...data };
          formData.value = data;
        });
      } else {
        dialog.title = t('system.menu.addMenu');
        formData.value.parentId = parentId?.toString();
      }
    });
}

// 菜单类型切换
function handleMenuTypeChange() {
  // 如果菜单类型改变
  if (formData.value.type !== initialMenuFormData.value.type) {
    if (formData.value.type === MenuTypeEnum.MENU) {
      // 目录切换到菜单时，清空组件路径
      if (initialMenuFormData.value.type === MenuTypeEnum.CATALOG) {
        formData.value.component = "";
      } else {
        // 其他情况，保留原有的组件路径
        formData.value.routePath = initialMenuFormData.value.routePath;
        formData.value.component = initialMenuFormData.value.component;
      }
    }
  }
}

/**
 * 提交表单
 */
function handleSubmit() {
  menuFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      const menuId = formData.value.id;
      if (menuId) {
        //修改时父级菜单不能为当前菜单
        if (formData.value.parentId == menuId) {
          ElMessage.error(t('system.menu.message.parentCannotBeSelf'));
          return;
        }
        MenuAPI.update(menuId, formData.value).then(() => {
          ElMessage.success(t('system.common.editSuccess'));
          handleCloseDialog();
          handleQuery();
        });
      } else {
        MenuAPI.create(formData.value).then(() => {
          ElMessage.success(t('system.common.addSuccess'));
          handleCloseDialog();
          handleQuery();
        });
      }
    }
  });
}

// 删除菜单
function handleDelete(menuId: string) {
  if (!menuId) {
    ElMessage.warning(t('system.common.selectDeleteItem'));
    return false;
  }

  ElMessageBox.confirm(t('system.common.confirmDelete'), t('system.common.warning'), {
    confirmButtonText: t('system.common.confirm'),
    cancelButtonText: t('system.common.cancel'),
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      MenuAPI.deleteById(menuId)
        .then(() => {
          ElMessage.success(t('system.common.deleteSuccess'));
          handleQuery();
        })
        .finally(() => {
          loading.value = false;
        });
    },
    () => {
      ElMessage.info(t('system.common.cancelDelete'));
    }
  );
}

function resetForm() {
  menuFormRef.value.resetFields();
  menuFormRef.value.clearValidate();
  formData.value = {
    id: undefined,
    parentId: "0",
    visible: 1,
    sort: 1,
    type: MenuTypeEnum.MENU, // 默认菜单
    alwaysShow: 0,
    keepAlive: 1,
    params: [],
  };
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
