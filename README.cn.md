<div align="center">
  <img alt="SmartRetail Pro" width="80" height="80" src="./src/assets/smartretail-logo.svg">
  <h1>SmartRetail Pro</h1>

  <img src="https://img.shields.io/badge/Vue-3.5.13-brightgreen.svg"/>
  <img src="https://img.shields.io/badge/Vite-6.2.2-green.svg"/>
  <img src="https://img.shields.io/badge/Element Plus-2.9.9-blue.svg"/>
  <img src="https://img.shields.io/badge/license-MIT-green.svg"/>

</div>

![](https://foruda.gitee.com/images/1708618984641188532/a7cca095_716974.png "rainbow.png")

<div align="center">
  <a href="./README.md">简体中文</a> | <a href="./README.en.md">English</a> | <a href="./README.ja.md">日本語</a>
</div>

## 项目简介

SmartRetail Pro 是一款专为零售业打造的管理系统，基于 Vue3、Vite、TypeScript 和 Element-Plus 构建。系统提供完整的商品管理、订单处理、库存控制和客户管理功能，帮助零售商轻松实现业务数字化和高效管理。

## 技术栈

### 前端
- **核心框架**: [Vue.js 3.5.13](https://vuejs.org/) - 用于构建用户界面的渐进式JavaScript框架
- **构建工具**: [Vite 6.2.2](https://vitejs.dev/) - 下一代前端开发与构建工具
- **UI组件库**: [Element Plus 2.9.9](https://element-plus.org/) - 基于Vue 3的组件库
- **状态管理**: [Pinia 3.0.2](https://pinia.vuejs.org/) - 直观、类型安全的Vue状态管理库
- **路由管理**: [Vue Router 4.5.0](https://router.vuejs.org/) - Vue.js官方路由管理器
- **开发语言**: [TypeScript 5.8.3](https://www.typescriptlang.org/) - JavaScript的超集，提供类型检查
- **HTTP客户端**: [Axios 1.8.4](https://axios-http.com/) - 基于Promise的HTTP客户端
- **国际化**: [Vue I18n 11.1.3](https://vue-i18n.intlify.dev/) - Vue.js国际化插件
- **数据可视化**: [ECharts 5.6.0](https://echarts.apache.org/) - 强大的交互式图表库
- **富文本编辑器**: [WangEditor 5.6.34](http://www.wangeditor.com/) - 轻量级web富文本编辑器
- **CSS预处理器**: [Sass 1.86.3](https://sass-lang.com/) - 成熟、稳定、强大的CSS扩展语言

### 开发工具
- **代码质量**: [ESLint 9.25.0](https://eslint.org/), [Prettier 3.5.3](https://prettier.io/), [Stylelint 16.18.0](https://stylelint.io/) - 代码质量和风格工具
- **提交规范**: [Husky 9.1.7](https://typicode.github.io/husky/), [Commitlint 19.8.0](https://commitlint.js.org/) - Git hooks和提交消息规范化
- **包管理器**: [pnpm](https://pnpm.io/) - 快速、节省磁盘空间的包管理器
- **自动导入**: [unplugin-auto-import 19.1.2](https://github.com/antfu/unplugin-auto-import) - 自动导入组件和API
- **原子化CSS**: [UnoCSS 65.4.3](https://github.com/unocss/unocss) - 即时按需的原子CSS引擎

### 后端选项
- **Java后端**: [Spring Boot](https://spring.io/projects/spring-boot) - 简化企业级开发的Java框架
- **Node后端**: [Nest.js](https://nestjs.com/) - 用于构建高效可扩展的服务器端应用程序的框架

## 功能模块

### 商品管理
- **商品列表**: 浏览和搜索所有商品，支持按状态、类别、价格等条件筛选
- **商品编辑**: 创建和编辑商品信息，包括名称、描述、图片、价格、库存等
- **库存管理**: 实时查看和更新库存，支持库存预警和入库计划
- **分类管理**: 管理商品分类体系，支持拖拽排序

### 订单管理
- **订单列表**: 查看所有订单和详细信息，支持按订单状态、支付状态等筛选
- **订单详情**: 查看单个订单的详细信息，包括商品、配送、支付信息等
- **配送管理**: 处理订单发货和跟踪配送状态，支持与物流系统集成
- **退款处理**: 管理退款和取消订单请求

### 客户管理
- **客户列表**: 查看所有注册客户及其信息，支持搜索和筛选
- **客户详情**: 查看单个客户的详细信息，包括购买历史和沟通记录
- **会员等级**: 管理客户会员等级和积分系统
- **营销活动**: 创建和管理邮件营销和特别优惠

### 系统功能
- **用户管理**: 管理系统用户和权限
- **角色管理**: 设置不同角色的访问权限
- **菜单管理**: 自定义系统菜单结构
- **部门管理**: 管理组织部门架构
- **数据字典**: 维护系统通用数据

## 环境要求

| 环境类型       | 名称                     |
|----------------|-----------------------------|
| **开发工具**   | [Visual Studio Code](https://code.visualstudio.com/Download) |
| **运行环境**   | Node 18 + (推荐[22.9.0](https://npmmirror.com/mirrors/node/v22.9.0/))  |
> ⚠️ 注意：Node.js 20.6.0版本存在兼容性问题，请勿使用

## 快速开始
