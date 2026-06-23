# Codex レビュー依頼：AI 優先アラートアシスタント

## 概要
- **目的**: 「今日対応すべき優先アラートは？」のみに対応する AI アシスタント機能を実装
- **AI基盤**: Google Gemini Flash（`gemini-2.0-flash-001`）
- **対象ブランチ**: `feature/agent`（`smart-retail-dx` / `smart-dx-backend` の両リポジトリ）
- **設計書**: `docs/design/smart-retail-ai-alert-assistant.md` v1.0.1

## リポジトリ・ブランチ

### フロントエンド・設計書
- Repository: `github.com:jasonw-lab/smart-retail.git`
- Branch: `feature/agent`
- PR URL: https://github.com/jasonw-lab/smart-retail/pull/new/feature/agent

### バックエンド
- Repository: `github.com:jasonw-lab/smart-dx-backend.git`
- Branch: `feature/agent`
- PR URL: https://github.com/jasonw-lab/smart-dx-backend/pull/new/feature/agent

## 変更範囲

### smart-retail-dx
- `docs/design/smart-retail-ai-alert-assistant.md`（新規）
- `docs/design/smart-retail-ai.md`（Gemini 採用の注記追加）
- `apps/frontend/src/api/retail/ai.ts`（新規）
- `apps/frontend/src/views/retail/alert/assistant.vue`（新規）
- `apps/frontend/src/router/index.ts`（AI優先アラート ルート追加）

### smart-dx-backend
- `apps/backend/services/retail-be/src/main/java/com/smartdx/retail/ai/...`（新規）
  - `config/AlertAssistantConfig.java`
  - `controller/AlertAssistantController.java`
  - `service/AlertAssistantService.java`, `service/impl/AlertAssistantServiceImpl.java`
  - `model/req/AlertAssistantReq.java`, `model/vo/AlertAssistantVO.java`
  - `llm/LlmClient.java`, `LlmRequest.java`, `LlmResponse.java`, `LlmException.java`, `ConversationMessage.java`
  - `llm/impl/GeminiLlmClient.java`
- `apps/backend/services/retail-be/src/main/java/com/smartdx/retail/service/AlertService.java`
- `apps/backend/services/retail-be/src/main/java/com/smartdx/retail/service/impl/AlertServiceImpl.java`
- `apps/backend/services/retail-be/src/main/resources/application.yml`
- `apps/backend/services/retail-be/src/test/java/com/smartdx/retail/config/TestSecurityConfig.java`（新規）
- `apps/backend/services/retail-be/src/test/java/com/smartdx/retail/e2e/AlertAssistantE2ETest.java`（新規）
- `apps/backend/services/retail-be/src/test/resources/application-e2e.yml`

## レビュー観点

1. **設計書との整合**: 実装が `docs/design/smart-retail-ai-alert-assistant.md` の内容を満たしているか
2. **API 設計**: `POST /api/v1/retail/ai/alerts/priority` の入出力、バリデーション、エラーハンドリング
3. **LLM 実装**: Gemini クライアントの実装、プロンプト、フォールバック、設定
4. **データ取得**: 本日未解決アラートのクエリ、優先度ソート、既存 `AlertPageVO` の再利用
5. **フロントエンド UI**: 画面構成、API 呼び出し、バリデーション、表示内容
6. **セキュリティ**: JWT 認証、テスト用 `TestSecurityConfig` の妥当性
7. **テスト**: E2E テストの網羅性と実行可能性
8. **既存コード影響**: `retail-be` 以外のモジュールに意図しない変更がないか

## テスト実行結果

```bash
cd /Users/wangjw/Dev/Git/ross-dev2024/vps/smart-dx-backend/apps/backend
export DOCKER_HOST=unix:///Users/wangjw/.orbstack/run/docker.sock
mvn test -pl services/retail-be -Dtest='com.smartdx.retail.e2e.AlertAssistantE2ETest'
```

結果: **4 tests, 0 failures, 0 errors**

## 留意事項
- `smart-dx-backend` リポジトリには `property-be` 等の既存未コミット変更がありますが、今回のコミット対象外です。
- LLM 呼び出しは API キー未設定時にフォールバック動作します。E2E でもフォールバック経由で検証しています。

## 依頼内容
上記ブランチをチェックアウトし、コードレビューを実施してください。指摘事項があればコメントまたは本ファイルに追記してください。必要に応じて修正ブランチの作成も検討してください。
