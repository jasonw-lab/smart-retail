<div align="center">
  <img alt="SmartRetail Pro" width="80" height="80" src="./apps/frontend/src/assets/smartretail-logo.svg">
  <h1>SmartRetail Pro</h1>

  <img src="https://img.shields.io/badge/Vue-3.5.13-brightgreen.svg"/>
  <img src="https://img.shields.io/badge/Vite-6.2.2-green.svg"/>
  <img src="https://img.shields.io/badge/Element Plus-2.9.9-blue.svg"/>
  <img src="https://img.shields.io/badge/license-MIT-green.svg"/>


</div>

![](https://foruda.gitee.com/images/1708618984641188532/a7cca095_716974.png "rainbow.png")



## Project Overview

This repository implements a Phase 1 PoC for unmanned retail stores based on `docs/design/smart-retail-requirements.md` and `docs/design/ui/smart-retail-ui-design.md`.  
In the source tree, the main implementation lives under `apps/frontend/src/views/retail` and `apps/backend/src/main/java/com/youlai/boot/modules/retail/controller`, covering store monitoring, product and inventory operations, alert handling, and external-world simulation.

### Dashboard
- **Dashboard**: Visualizes KPIs, sales trends, inventory status, and recent alerts.

### Store Management
- **Store List**: Manages store status, location, and operating conditions.
- **Payment History**: Provides list and summary APIs for sales and payment data.
- **Device List**: Monitors store devices, last heartbeat time, and device types.

### Product & Inventory
- **Product List**: Supports listing, searching, creating, and updating product code, name, category, price, reorder point, and max stock.
- **Category Management**: Includes product category APIs and category-based management in the product screen.
- **Inventory List**: Shows quantity, lot, expiry date, and inventory status by store and product.
- **Inbound / Outbound Management**: Manages inbound, outbound, and discard operations as inventory transactions with history lookup.

### Alert Management
- **Alert List**: Displays alerts such as low stock, expiry soon, overstock, communication down, and payment terminal failures, with status management.
- **External World Simulation**: Uses PowerJob Worker to send heartbeat and payment events and reproduce backend monitoring flows.

### Customer Management
- TODO

### System Features
- **Admin Foundation**: Includes user, role, menu, department, dictionary, and notification management as the platform base.
- **Authentication / Authorization**: Provides Spring Security and JWT-based authentication plus route and role permissions.
- **API / Documentation**: Exposes API documentation through Knife4j / OpenAPI.
- **Realtime Communication**: Includes WebSocket / STOMP-based communication infrastructure.

## Screenshots

TODO

## Technology Stack

### Frontend
- **Core Framework**: [Vue.js 3.5.13](https://vuejs.org/)
- **Build Tool**: [Vite 6.3.2](https://vitejs.dev/)
- **Language**: [TypeScript 5.8.3](https://www.typescriptlang.org/)
- **UI Library**: [Element Plus 2.9.9](https://element-plus.org/)
- **State Management**: [Pinia 3.0.2](https://pinia.vuejs.org/)
- **Routing**: [Vue Router 4.5.0](https://router.vuejs.org/)
- **HTTP Communication**: [Axios 1.8.4](https://axios-http.com/)
- **Internationalization**: [Vue I18n 11.1.3](https://vue-i18n.intlify.dev/)
- **Data Visualization**: [ECharts 5.6.0](https://echarts.apache.org/), [vue-echarts 7.0.3](https://github.com/ecomfe/vue-echarts)
- **Realtime Communication**: [STOMP.js 7.1.1](https://stomp-js.github.io/)
- **Rich Text / UI Helpers**: WangEditor, SortableJS, ExcelJS, Codemirror
- **Styling Foundation**: Sass 1.86.3, UnoCSS 65.4.3, Animate.css 4.1.1

### Development Tools
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Code Quality**: [ESLint 9.25.0](https://eslint.org/), [Prettier 3.5.3](https://prettier.io/), [Stylelint 16.18.0](https://stylelint.io/)
- **Mock Development Support**: vite-plugin-mock-dev-server 1.8.5

### Backend
- **Language / Runtime**: Java 17
- **Framework**: Spring Boot 3.3.6
- **Security**: Spring Security
- **ORM / SQL Mapper**: MyBatis Plus 3.5.5
- **Connection Pool**: Druid 1.2.24
- **API Documentation**: Knife4j 4.5.0 / OpenAPI 3
- **Object Mapping**: MapStruct 1.6.3
- **Cache / Distributed Locking**: Redis, Redisson 3.40.2, Caffeine
- **Object Storage**: MinIO 8.5.10
- **Utilities / Helpers**: Hutool 5.8.34, Spring Dotenv 4.0.0, FastExcel 1.1.0
- **Testing**: Spring Boot Test, Testcontainers 1.19.7, REST Assured-based API tests

### Simulator
- **Language / Runtime**: Java 17
- **Framework**: Spring Boot 3.3.5
- **Job Infrastructure**: PowerJob Worker 5.1.1
- **Communication**: Spring Web, Jackson Databind

## Project Setup

- **Environment Preparation**

| Environment Type | Name                   |
|----------------|------------------------|
| **Development Tool** | [Visual Studio Code](https://code.visualstudio.com/Download) |
| **Runtime Environment** | Node 18 or higher (recommended [22.9.0](https://npmmirror.com/mirrors/node/v22.9.0/)) |
> ⚠️ Note: Node.js 20.6.0 has some compatibility issues, please avoid using it

- **Quick Start**

```bash
# Clone the code
git clone https://github.com/jasonw-lab/smart-retail.git.git

# Move to the directory
cd mall-retail

# Install pnpm
npm install pnpm -g

# Install dependencies
pnpm install

# Start
pnpm run
``` 
