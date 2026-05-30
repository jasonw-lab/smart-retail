# {機能名} タスクプラン

## メタ情報

- 機能名: {機能名}
- 対象フェーズ: implementation
- 担当: claude-code

---

## タスク一覧

### Task 1: {タスク名}

**種別:** backend
**対象ファイル:** apps/backend/src/main/java/com/youlai/boot/module/{module}/...
**指示:**
{具体的な指示を記載}

**レビュー観点:**
- {観点1}
- {観点2}
- {観点3}

---

### Task 2: {タスク名}

**種別:** backend
**対象ファイル:** apps/backend/src/main/java/com/youlai/boot/module/{module}/...
**依存タスク:** Task 1
**指示:**
{具体的な指示を記載}

**レビュー観点:**
- {観点1}
- {観点2}

---

### Task 3: {タスク名}

**種別:** frontend
**対象ファイル:** apps/frontend/src/features/{feature}/...
**依存タスク:** Task 2
**指示:**
{具体的な指示を記載}

**レビュー観点:**
- {観点1}
- {観点2}
- {観点3}

---

## 備考

- 各タスクは Claude Code で実行後、Codex でレビュー
- レビュー指摘は最大3回のイテレーションで解消
- High 指摘が残る場合は人間介入
