# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SmartRetail Pro** - Retail inventory and sales management system

| Component | Path | Stack |
|-----------|------|-------|
| Backend API | `apps/backend/` | Java 17, Spring Boot 3.3, MyBatis Plus, Spring Security |
| Frontend UI | `apps/frontend/` | Vue 3, TypeScript, Vite, Element Plus, Pinia |
| Frontend EC | `apps/frontend-ec/` | E-commerce frontend (separate) |

## Build & Run Commands

### Backend
```bash
# Run application
cd apps/backend && ./mvnw spring-boot:run

# Run all tests
cd apps/backend && ./mvnw test

# Run single test class
cd apps/backend && ./mvnw test -Dtest=ProductControllerRestAssuredTest

# Build
cd apps/backend && ./mvnw clean package -DskipTests
```

### Frontend
```bash
# Install dependencies
cd apps/frontend && pnpm install

# Development server
cd apps/frontend && pnpm dev

# Build
cd apps/frontend && pnpm build

# Lint
cd apps/frontend && pnpm lint:eslint
cd apps/frontend && pnpm lint:prettier
cd apps/frontend && pnpm lint:stylelint
```

## Architecture

### Backend Structure
```
apps/backend/src/main/java/com/youlai/boot/
├── modules/retail/          # Business modules (modifiable)
│   ├── controller/          # REST endpoints
│   ├── converter/           # MapStruct converters (entity/form/vo)
│   ├── mapper/              # MyBatis mapper interfaces
│   ├── model/
│   │   ├── entity/          # Database entities
│   │   ├── form/            # Request DTOs for create/update
│   │   ├── query/           # Request DTOs for search
│   │   └── vo/              # Response DTOs
│   ├── service/             # Service interfaces
│   └── service/impl/        # Service implementations
├── common/                  # Shared utilities (protected)
├── config/                  # Spring configurations (protected)
├── core/                    # Core framework (protected)
├── shared/                  # Shared components (protected)
└── system/                  # System management (protected)
```

### Frontend Structure
```
apps/frontend/src/
├── api/                     # API client modules
├── views/                   # Page components
├── components/              # Reusable components
├── store/                   # Pinia stores
├── router/                  # Vue Router config
├── utils/                   # Utilities (request.ts wraps axios)
└── types/                   # TypeScript definitions
```

## Modifiable Scope

Freely modifiable:
- `apps/backend/src/main/java/com/youlai/boot/modules/retail/`
- `apps/backend/src/main/resources/mapper/retail/`
- `apps/frontend/src/` (retail-related)

Changes outside these directories require justification.

## Development Conventions

### Backend
- All Java files: `@author jason.w`
- Tests: REST Assured integration tests extending `BaseControllerTest`
- Test location: `apps/backend/src/test/java/com/youlai/boot/modules/retail/`
- Test profile: `@ActiveProfiles("test")`

### Frontend API Pattern
Use `request<any, T>()` from `@/utils/request`:
```typescript
return request<any, PageResult<ProductVO[]>>({
  url: `${BASE_URL}/page`,
  method: "get",
  params: queryParams,
});
```

The request wrapper returns `response.data.data` directly. Frontend receives:
- `Result<T>` -> `T`
- `PageResult<T>` -> `{ list, total }`

## Reference Documents

- Requirements: `docs/architecture/design/smart-retail-requirements.md`
- UI Design: `docs/architecture/design/smart-retail-ui-design.md`
- DB Design: `docs/architecture/design/smart-retail-sql.md`
- Issues: `docs/issues/plan_*.md`
- Project rules: `AGENT.md`

## Git Workflow
- 新しいissueに対応するとき、ブランチを現在のbranchから対応用branch新規作成する
- Branch: `feature/issue-<number>-<description>`
- PR target: `develop` branch
- Commit format: `feat(scope): description (issue-XXX)`
