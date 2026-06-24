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

---

## 対応状況（2026/06/23）

上記の Codex レビュー指摘に対応しました。

| # | 指摘 | 対応内容 |
|---|------|---------|
| 1 | LLM 設定バインド不備 | `AlertAssistantConfig` の prefix を `retail.ai.llm` → `retail.ai` に修正。設定バインドを検証する `AlertAssistantConfigTest` を追加。 |
| 2 | Gemini 呼び出しタイムアウト未適用 | `GeminiLlmClient` の `RestTemplate` に connect/read タイムアウトを `retail.ai.llm.timeout-ms` から設定。 |
| 3 | 監査ログ未実装 | `AlertAssistantServiceImpl` に `[AI_ALERT_AUDIT]` 構造化ログを追加。テナントID、ユーザーID、質問、alert件数、llmUsed、llmModel、fallback、latencyMs、エラー理由を記録。 |
| 4 | 空応答時の fallback フラグ不整合 | Gemini 空応答時は `LlmException` を投げ、呼び出し元の catch 分岐で `fallback=true` / `llmUsed=false` を返すよう修正。 |
| 5 | OpenAPI scan 対象漏れ | `retail-be` と `app` の `application.yml` の `springdoc.packages-to-scan` に `com.smartdx.retail.ai.controller` を追加。 |

### 検証結果（対応後）

```bash
cd /Users/wangjw/Dev/Git/ross-dev2024/vps/smart-dx-backend/apps/backend
export DOCKER_HOST=unix:///Users/wangjw/.orbstack/run/docker.sock
mvn test -pl services/retail-be -Dtest='com.smartdx.retail.ai.config.AlertAssistantConfigTest,com.smartdx.retail.e2e.AlertAssistantE2ETest'
```

結果: **5 tests, 0 failures, 0 errors** ✅

コミット: `smart-dx-backend/feature/agent 6505205`

---

## Codexレビュー結果 (2026/06/23)

### 指摘事項

#### [High] LLM設定が `AlertAssistantConfig` にバインドされず、APIキーを設定しても Gemini 経路が有効にならない

- 対象:
  - `../smart-dx-backend/apps/backend/services/retail-be/src/main/java/com/smartdx/retail/ai/config/AlertAssistantConfig.java:14`
  - `../smart-dx-backend/apps/backend/services/retail-be/src/main/resources/application.yml:101`

`AlertAssistantConfig` は `@ConfigurationProperties(prefix = "retail.ai.llm")` を指定していますが、クラス内は `llm.enabled` / `llm.apiKey` / `llm.model` のネスト構造です。一方、YAML は `retail.ai.llm.api-key` に値を定義しています。

この組み合わせでは `retail.ai.llm.api-key` が `AlertAssistantConfig.llm.apiKey` にバインドされず、`GeminiLlmClient.isAvailable()` が常に false になり得ます。そのため `GOOGLE_AI_API_KEY` を設定しても、実運用では Gemini を呼ばずフォールバックのみ返す可能性があります。

修正案: `AlertAssistantConfig` の prefix を `retail.ai` に変更する、または `LlmConfig` をトップレベルにフラット化して `retail.ai.llm.*` と一致させてください。併せて設定バインドのユニットテスト、または API キー設定時に `llmUsed=true` になるテストを追加してください。

#### [High] Gemini 呼び出しにタイムアウトが適用されておらず、5秒以内フォールバック要件を満たせない

- 対象:
  - `../smart-dx-backend/apps/backend/services/retail-be/src/main/java/com/smartdx/retail/ai/llm/impl/GeminiLlmClient.java:35`
  - `../smart-dx-backend/apps/backend/services/retail-be/src/main/java/com/smartdx/retail/ai/service/impl/AlertAssistantServiceImpl.java:89`

`AlertAssistantServiceImpl` は `LlmRequest.timeoutMs(5000)` を設定していますが、`GeminiLlmClient` 側ではこの値を使用していません。さらに `new RestTemplate()` に接続・読み取りタイムアウトが設定されていないため、Google API やネットワークが遅延した場合に、設計書の「LLM タイムアウト時は 200 / fallback=true」「初回応答 95%ile 5秒以内」を満たせません。

修正案: `RestTemplateBuilder` または `ClientHttpRequestFactory` で connect/read timeout を設定し、`LlmRequest.timeoutMs` または `retail.ai.llm.timeout-ms` を実際に反映してください。タイムアウト発生時に `fallback=true` で返るテストも追加してください。

#### [High] 設計で必須化された監査ログが実装されていない

- 対象:
  - `docs/design/smart-retail-ai-alert-assistant.md:87`
  - `../smart-dx-backend/apps/backend/services/retail-be/src/main/java/com/smartdx/retail/ai/service/impl/AlertAssistantServiceImpl.java:51`

設計書では AA-BE-007 として「API 呼び出しを監査ログに記録すること」が必須になっていますが、実装では通常呼び出し、LLM成功、LLM失敗、フォールバック、バリデーションエラーのいずれも監査ログに記録していません。現状は LLM 失敗時の warn ログだけで、コスト追跡・障害追跡・セキュリティ監査の要件を満たせません。

修正案: 既存の監査ログ基盤がある場合はそれを利用し、少なくとも呼び出しユーザー、テナント、質問種別、alert件数、llmUsed、llmModel、fallback、latency、エラー種別を記録してください。基盤が未整備であれば、設計側で「通常ログで代替」などの運用判断を明記する必要があります。

#### [Medium] Gemini 空応答時にフォールバック文を返しても `fallback=false` / `llmUsed=true` になる

- 対象:
  - `../smart-dx-backend/apps/backend/services/retail-be/src/main/java/com/smartdx/retail/ai/service/impl/AlertAssistantServiceImpl.java:97`

`callLlm()` は Gemini の `content` が空の場合に `buildFallbackSummary(alerts)` を `response.content` へ詰め直します。しかし呼び出し元はそのまま `llmUsed=true`、`fallback=false` としてレスポンスを返します。

この状態では UI と監査上、実際にはルールベース要約なのに LLM 成功扱いになります。設計書の `fallback` フラグの意味とも不整合です。

修正案: 空応答は例外として扱い通常の fallback 分岐へ流す、または `LlmResponse` に fallback 判定を持たせて `fallback=true` / `llmUsed=false` または `llmUsed=true` でも `fallback=true` として返してください。

#### [Low] OpenAPI の scan 対象に新規 AI controller パッケージが含まれていない

- 対象:
  - `../smart-dx-backend/apps/backend/app/src/main/resources/application.yml:190`
  - `../smart-dx-backend/apps/backend/services/retail-be/src/main/resources/application.yml:94`

Springdoc の `packages-to-scan` は `com.smartdx.retail.controller` までで、新規追加された `com.smartdx.retail.ai.controller` が含まれていません。API 自体は Spring の component scan で動作しますが、Swagger / Knife4j から `POST /api/v1/retail/ai/alerts/priority` が見えない可能性があります。

修正案: `com.smartdx.retail.ai.controller` を `packages-to-scan` に追加するか、`com.smartdx.retail` まで scan 対象を広げてください。

### 検証結果

- Backend compile: `mvn -pl services/retail-be -DskipTests compile` 成功
- Backend E2E: `mvn test -pl services/retail-be -Dtest='com.smartdx.retail.e2e.AlertAssistantE2ETest'` 成功（4 tests, 0 failures, 0 errors）
- Frontend type-check: `pnpm type-check` は既存の inventory/mock 系 TypeScript エラーで失敗。今回追加の `assistant.vue` / `ai.ts` 起因のエラーは検出されませんでした。
