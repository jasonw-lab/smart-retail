import type { App } from "vue";

import { setupDirective } from "@/directive";
import { setupI18n } from "@/lang";
import { setupRouter } from "@/router";
import { setupStore } from "@/store";
import { setupElIcons } from "./icons";
import { setupPermission } from "./permission";
import { InstallCodeMirror } from "codemirror-editor-vue3";
import ElementPlus from "element-plus";
import ja from "element-plus/dist/locale/ja.mjs";

export default {
  install(app: App<Element>) {
    // 自定义指令(directive)
    setupDirective(app);
    // 路由(router)
    setupRouter(app);
    // 状态管理(store)
    setupStore(app);
    // 国际化
    setupI18n(app);
    // Element-plus图标
    setupElIcons(app);
    // Element-plus日本語化
    app.use(ElementPlus, {
      locale: ja,
    });
    // 路由守卫
    setupPermission();
    // 注册 CodeMirror
    app.use(InstallCodeMirror);
  },
};
