# CLAUDE.md

> 本ファイルの共通ルールは [`rule.md`](./rule.md) に集約しています。併せて参照してください。
> インフラ運用（M5 Mac OrbStack ローカル運用、リモート VPS デプロイ運用、環境変数設定など）の詳細は [`AGENTS.md`](./AGENTS.md) を参照してください。

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SmartRetail Pro** - Retail inventory and sales management system

| Component | Path | Stack |
|-----------|------|-------|
| Backend API | `../smart-dx-backend/apps/backend/` | Java 17, Spring Boot 3.3, MyBatis Plus, Spring Security |
| Frontend UI | `apps/frontend/` | Vue 3, TypeScript, Vite, Element Plus, Pinia |
| Frontend EC | `apps/frontend-ec/` | E-commerce frontend (separate) |
| Docker | `platform/docker/` | Docker Compose environment |

## Build & Run Commands

### Backend
```bash
# Run application
cd ../smart-dx-backend/apps/backend && ./mvnw spring-boot:run

# Run all tests
cd ../smart-dx-backend/apps/backend && ./mvnw test

# Run single test class
cd ../smart-dx-backend/apps/backend && ./mvnw test -Dtest=ProductControllerRestAssuredTest

# Build
cd ../smart-dx-backend/apps/backend && ./mvnw clean package -DskipTests
```

> **Note**: `apps/backend/` in this repository is deprecated. Use `../smart-dx-backend/apps/backend/` instead.

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

### Docker & Infrastructure

運用環境の詳細および切り替え基準（搭載メモリ >= 48GB の本機 M5 Mac は OrbStack、< 48GB は VPS）は [`AGENTS.md`](./AGENTS.md) を参照してください。

```bash
# ローカル開発インフラ (OrbStack)
cd platform/docker && make local-setup     # 初回ディレクトリ・設定初期化
cd platform/docker && make local-env-up    # インフラ起動 (MySQL, Redis, PowerJob)
cd platform/docker && make local-env-down  # インフラ停止

# リモートデプロイ (VPS)
cd platform/docker && make deploy          # backend デプロイ
cd platform/docker && make fe              # frontend ビルド & デプロイ
```

## Architecture

### Backend Structure
```
../smart-dx-backend/apps/backend/src/main/java/com/youlai/boot/
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
- `../smart-dx-backend/apps/backend/src/main/java/com/youlai/boot/modules/retail/`
- `../smart-dx-backend/apps/backend/src/main/resources/mapper/retail/`
- `apps/frontend/src/` (retail-related)
- `platform/docker/` (Docker configuration)

Changes outside these directories require justification.

## Ignored Folders

Folders matching `ign_*` are intentionally excluded from agent operations. Do not read, modify, or reference files inside them unless explicitly instructed.

## Development Conventions

### Backend
- All Java files: `@author jason.w`
- Tests: REST Assured integration tests extending `BaseControllerTest`
- Test location: `../smart-dx-backend/apps/backend/src/test/java/com/youlai/boot/modules/retail/`
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

## Environment Variables

- 環境変数は `apps/backend/.env` を参照する

## Reference Documents

- Requirements: `docs/architecture/design/smart-retail-requirements.md`
- UI Design: `docs/architecture/design/smart-retail-ui-design.md`
- DB Design: `docs/architecture/design/smart-retail-sql.md`
- Issues: `docs/issues/plan_*.md`
- Project rules: [`AGENTS.md`](./AGENTS.md)

## Git Workflow
- 新しいissueに対応するとき、ブランチを現在のbranchから対応用branch新規作成する
- Branch: `feature/issue-<number>-<description>`
- PR / MR target: `develop` branch（GitHub PR / GitLab MR。詳細は `AGENTS.md` 参照）
- Commit format: `feat(scope): description (issue-XXX)`
