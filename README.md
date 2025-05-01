<div align="center">
  <img alt="SmartRetail Pro" width="80" height="80" src="./src/assets/smartretail-logo.svg">
  <h1>SmartRetail Pro</h1>

  <img src="https://img.shields.io/badge/Vue-3.5.13-brightgreen.svg"/>
  <img src="https://img.shields.io/badge/Vite-6.2.2-green.svg"/>
  <img src="https://img.shields.io/badge/Element Plus-2.9.9-blue.svg"/>
  <img src="https://img.shields.io/badge/license-MIT-green.svg"/>
  

</div>

![](https://foruda.gitee.com/images/1708618984641188532/a7cca095_716974.png "rainbow.png")



## Project Overview

[√](https://github.com/ross-dev2024/mall-retail)

### Product Management
- **Product List**: A screen to browse and search all registered products. Filtering is possible by product status, category, price, etc.
- **Product Registration/Edit**: A screen for registering new products or updating existing product information. Set product name, description, images, price, stock quantity, etc.
- **Inventory Management**: A screen to check and update inventory status in real-time. Features include low stock alerts and incoming stock management.
- **Category Management**: A screen to manage the hierarchical structure of product categories. Supports drag-and-drop reordering.

### Order Management
- **Order List**: Displays a list of all orders with detailed information. Filtering is possible by order status, payment status, etc.
- **Order Details**: Shows detailed information for individual orders. Manages order items, shipping information, billing information, etc.
- **Shipping Management**: A screen for processing order shipments and tracking delivery status. Can integrate with logistics information.
- **Returns/Cancellation Processing**: A screen for managing and processing return and cancellation requests.

### Customer Management
- **Customer List**: Displays a list of registered customers with detailed information. Features search and filtering capabilities.
- **Customer Details**: Centralized management of individual customer information, purchase history, inquiry history, etc.
- **Membership Rank Management**: A screen for managing customer membership ranks and point systems.
- **Marketing**: A screen for managing email newsletters and special offers.

### System Features

- **System Functions**: Provides functional modules such as user management, role management, menu management, department management, and dictionary management.
- **Permission Management**: Supports various permission management methods including dynamic routing, button permissions, role permissions, and data permissions.

- **Core Features**: Provides features such as internationalization, multiple layouts, dark mode, full screen, watermark, API documentation, and code generator.
- **Continuous Updates**: The project is continuously updated as open source, with tools and dependencies updated in real-time.

## Screenshots

TODO

## Technology Stack

### Frontend
- **Core Framework**: [Vue.js 3.5.13](https://vuejs.org/) - A progressive JavaScript framework for building reactive UI components
- **Development Build Tool**: [Vite 6.2.2](https://vitejs.dev/) - A modern frontend tool that provides a fast development environment and optimized builds
- **UI Library**: [Element Plus 2.9.9](https://element-plus.org/) - A design component library for Vue 3
- **State Management**: [Pinia 3.0.2](https://pinia.vuejs.org/) - An intuitive and TypeScript-friendly state management library for Vue
- **Routing**: [Vue Router 4.5.0](https://router.vuejs.org/) - A routing library for Vue applications
- **Language**: [TypeScript 5.8.3](https://www.typescriptlang.org/) - Improves code quality and development efficiency through static typing
- **HTTP Communication**: [Axios 1.8.4](https://axios-http.com/) - A Promise-based HTTP client for browsers and Node.js
- **Internationalization**: [Vue I18n 11.1.3](https://vue-i18n.intlify.dev/) - An internationalization library for Vue applications
- **Data Visualization**: [ECharts 5.6.0](https://echarts.apache.org/) - A powerful chart and data visualization library
- **Editor**: [WangEditor 5.6.34](http://www.wangeditor.com/) - A modern web rich text editor
- **CSS**: [Sass 1.86.3](https://sass-lang.com/) - An extension language that supports efficient CSS writing

### Development Tools
- **Code Quality**: [ESLint 9.25.0](https://eslint.org/), [Prettier 3.5.3](https://prettier.io/), [Stylelint 16.18.0](https://stylelint.io/) - Maintains code quality and style consistency
- **Commit Management**: [Husky 9.1.7](https://typicode.github.io/husky/), [Commitlint 19.8.0](https://commitlint.js.org/) - Git hooks and commit message standardization
- **Package Management**: [pnpm](https://pnpm.io/) - A fast and efficient Node.js package manager
- **Auto Import**: [unplugin-auto-import 19.1.2](https://github.com/antfu/unplugin-auto-import) - Automatic import of components and functions
- **Utility**: [UnoCSS 65.4.3](https://github.com/unocss/unocss) - An instant on-demand utility CSS engine

### Backend (Optional)
- **Java**: [Spring Boot](https://spring.io/projects/spring-boot) - A Java framework for enterprise application development
- **Node.js**: [Nest.js](https://nestjs.com/) - A framework for building efficient and scalable server-side applications

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
git clone https://github.com/ross-dev2024/mall-retail.git

# Move to the directory
cd mall-retail

# Install pnpm
npm install pnpm -g

# Install dependencies
pnpm install

# Start
pnpm run
``` 