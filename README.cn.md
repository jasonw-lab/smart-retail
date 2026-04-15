<div align="center">
  <img alt="SmartRetail Pro" width="80" height="80" src="./apps/frontend/src/assets/smartretail-logo.svg">
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

本项目基于 `docs/design/smart-retail-requirements.md` 和 `docs/design/ui/smart-retail-ui-design.md`，实现面向无人超市的 Phase 1 PoC。  
从源码上看，主要实现位于 `apps/frontend/src/views/retail` 与 `apps/backend/src/main/java/com/youlai/boot/modules/retail/controller`，核心覆盖门店监控、商品库存管理、告警处理以及外部世界模拟。

## 技术栈

### 前端
- **核心框架**: [Vue.js 3.5.13](https://vuejs.org/)
- **构建工具**: [Vite 6.3.2](https://vitejs.dev/)
- **开发语言**: [TypeScript 5.8.3](https://www.typescriptlang.org/)
- **UI组件库**: [Element Plus 2.9.9](https://element-plus.org/)
- **状态管理**: [Pinia 3.0.2](https://pinia.vuejs.org/)
- **路由管理**: [Vue Router 4.5.0](https://router.vuejs.org/)
- **HTTP客户端**: [Axios 1.8.4](https://axios-http.com/)
- **国际化**: [Vue I18n 11.1.3](https://vue-i18n.intlify.dev/)
- **数据可视化**: [ECharts 5.6.0](https://echarts.apache.org/), [vue-echarts 7.0.3](https://github.com/ecomfe/vue-echarts)
- **实时通信**: [STOMP.js 7.1.1](https://stomp-js.github.io/)
- **富文本 / 辅助 UI**: WangEditor, SortableJS, ExcelJS, Codemirror
- **样式基础**: Sass 1.86.3, UnoCSS 65.4.3, Animate.css 4.1.1

### 开发工具
- **包管理器**: [pnpm](https://pnpm.io/)
- **代码质量**: [ESLint 9.25.0](https://eslint.org/), [Prettier 3.5.3](https://prettier.io/), [Stylelint 16.18.0](https://stylelint.io/)
- **Mock 开发支持**: vite-plugin-mock-dev-server 1.8.5

### 后端
- **语言 / 运行时**: Java 17
- **框架**: Spring Boot 3.3.6
- **安全**: Spring Security
- **ORM / SQL 映射**: MyBatis Plus 3.5.5
- **连接池**: Druid 1.2.24
- **API 文档**: Knife4j 4.5.0 / OpenAPI 3
- **对象映射**: MapStruct 1.6.3
- **缓存 / 分布式锁**: Redis, Redisson 3.40.2, Caffeine
- **对象存储**: MinIO 8.5.10
- **工具 / 辅助**: Hutool 5.8.34, Spring Dotenv 4.0.0, FastExcel 1.1.0
- **测试**: Spring Boot Test, Testcontainers 1.19.7, 基于 REST Assured 的 API 测试

### 模拟器
- **语言 / 运行时**: Java 17
- **框架**: Spring Boot 3.3.5
- **任务基础设施**: PowerJob Worker 5.1.1
- **通信**: Spring Web, Jackson Databind

## 功能模块

### 仪表盘
- **仪表盘**: 展示 KPI、销售趋势、库存状态和最新告警。

### 门店管理
- **门店列表**: 管理门店状态、地址和运行情况。
- **支付历史**: 提供销售 / 支付数据的列表与汇总 API。
- **设备列表**: 监控门店设备状态、最后一次 Heartbeat 和设备类型。

### 商品与库存
- **商品列表**: 支持商品编码、名称、分类、价格、补货点、最大库存等信息的列表、检索、新增和编辑。
- **分类管理**: 提供商品分类 API，并在商品列表页按分类管理。
- **库存列表**: 查看按门店 / 商品维度的库存数量、批次、保质期和状态。
- **入出库管理**: 以库存事务方式管理入库、出库和废弃，并支持历史查询。

### 告警管理
- **告警列表**: 列表展示缺货、临期、库存过高、通信中断、支付终端异常等告警，并支持状态管理。
- **外部世界模拟**: 通过 PowerJob Worker 发送 Heartbeat 和 Payment，复现后端监控与检测流程。

### 客户管理 (未来规划 / Phase 2+)
- **远程支持**: 针对门店商品购买时的故障及支付异常，提供远程客服支持。
- **退款与退货管理**: 扩展无人结算场景下的退款请求处理及退货状态的统一管理功能。
- **会员属性与购买分析**: 与门店官方 App 联动，管理顾客购买记录、积分发放以及营销活动方案。

### 系统功能
- **管理基础**: 提供用户、角色、菜单、部门、字典、通知等基础管理能力。
- **认证与授权**: 基于 Spring Security 和 JWT 提供认证、路由权限和角色权限控制。
- **API / 文档**: 可通过 Knife4j / OpenAPI 使用接口文档。
- **实时通信**: 包含基于 WebSocket / STOMP 的通信基础设施。

## 环境要求

| 环境类型       | 名称                     |
|----------------|-----------------------------|
| **开发工具**   | [Visual Studio Code](https://code.visualstudio.com/Download) |
| **运行环境**   | Node 18 + (推荐[22.9.0](https://npmmirror.com/mirrors/node/v22.9.0/))  |
> ⚠️ 注意：Node.js 20.6.0版本存在兼容性问题，请勿使用

## 快速开始

```bash
# 克隆代码
git clone https://github.com/jasonw-lab/smart-retail.git.git

# 进入目录
cd mall-retail

# 安装 pnpm
npm install pnpm -g

# 安装依赖
pnpm install

# 启动 (前端)
cd apps/frontend
pnpm run dev
```
