# Feature Development Workflow

汎用的な機能開発ワークフロー。
Claude Code でタスク実行後、Codex でレビューを行い、最大3回のイテレーションで品質を担保する。

---

## 概要

```
┌─────────────────────────────────────────────────────────────┐
│                    Feature Dev Workflow                     │
├─────────────────────────────────────────────────────────────┤
│  1. task_plan.md を読み込み                                  │
│  2. 各タスクを Claude Code で実行                            │
│  3. タスク完了後、Codex でレビュー（同一セッション継続）      │
│  4. 指摘があれば Claude Code で修正（最大3回）               │
│  5. 次のタスクへ進む                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## ファイル構成

```
workflow/
├── feature-dev-workflow.md    # 本ドキュメント
├── scripts/
│   └── feature_workflow.py    # ワークフロー実行スクリプト
└── plans/                     # タスクプランファイル格納
    └── {feature}_task_plan.md
```

---

## task_plan.md フォーマット

タスクプランファイルは以下の形式で記述する。

```markdown
# {機能名} タスクプラン

## メタ情報

- 機能名: お気に入り物件
- 対象フェーズ: implementation
- 担当: claude-code

---

## タスク一覧

### Task 1: バックエンドEntity作成

**種別:** backend
**対象ファイル:** apps/backend/src/main/java/com/youlai/boot/module/favorite/...
**指示:**
FavoriteProperty Entity を作成してください。
- テーブル: biz_favorite_property
- カラム: id, user_id, property_id, created_at

**レビュー観点:**
- MyBatis-Plus アノテーション
- 命名規則
- BaseEntity 継承

---

### Task 2: Mapper/Service作成

**種別:** backend
**対象ファイル:** apps/backend/src/main/java/com/youlai/boot/module/favorite/...
**依存タスク:** Task 1
**指示:**
Mapper と Service を作成してください。

**レビュー観点:**
- CRUD操作
- トランザクション管理

---

### Task 3: フロントエンドAPI連携

**種別:** frontend
**対象ファイル:** apps/frontend/src/features/favorite/...
**依存タスク:** Task 2
**指示:**
お気に入りAPI呼び出しのhooksを作成してください。

**レビュー観点:**
- TanStack Query
- エラーハンドリング
```

---

## ワークフロー実行

### 基本実行

```bash
# 単一タスクプラン実行（レビュー有効）
python workflow/scripts/feature_workflow.py \
  --plan workflow/plans/favorite_task_plan.md

# レビューなしで実行
python workflow/scripts/feature_workflow.py \
  --plan workflow/plans/favorite_task_plan.md \
  --no-review

# 特定タスクのみ実行
python workflow/scripts/feature_workflow.py \
  --plan workflow/plans/favorite_task_plan.md \
  --task "Task 1"

# ドライラン（実行せず計画のみ表示）
python workflow/scripts/feature_workflow.py \
  --plan workflow/plans/favorite_task_plan.md \
  --dry-run
```

### パラメータ

| パラメータ | 短縮 | 説明 | デフォルト |
|-----------|------|------|-----------|
| `--plan` | `-p` | タスクプランファイル | 必須 |
| `--task` | `-t` | 実行するタスク | 全タスク |
| `--dry-run` | `-n` | 実行せず計画のみ表示 | false |
| `--no-review` | - | レビューをスキップ | false（レビュー有効） |

### 環境変数

```bash
export MAX_REVIEW_ITERATIONS=3    # レビュー最大回数（デフォルト: 3）
export CODEX_SESSION_REUSE=true   # セッション再利用（デフォルト: true）
```

---

## レビューフロー

```
┌──────────────────────────────────────────────────────────────┐
│                    Review Flow (per Task)                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Claude Code: タスク実行                                     │
│       ↓                                                      │
│  Codex: レビュー（iteration 1）                              │
│       ↓                                                      │
│  指摘あり? ─── No ──→ 次のタスクへ                           │
│       │                                                      │
│      Yes                                                     │
│       ↓                                                      │
│  Claude Code: 修正（同一セッション）                         │
│       ↓                                                      │
│  Codex: 再レビュー（iteration 2, 同一セッション）            │
│       ↓                                                      │
│  指摘あり? ─── No ──→ 次のタスクへ                           │
│       │                                                      │
│      Yes                                                     │
│       ↓                                                      │
│  Claude Code: 修正                                           │
│       ↓                                                      │
│  Codex: 再レビュー（iteration 3, 同一セッション）            │
│       ↓                                                      │
│  High指摘あり? ─ No → 次のタスクへ                           │
│       │                                                      │
│      Yes                                                     │
│       ↓                                                      │
│  人間介入レポート生成                                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## セッション管理

Codex セッションは以下のルールで管理する。

### 同一セッション継続の条件

- 同一タスク内のレビュー・修正サイクル
- 前回の指摘コンテキストを保持したい場合

### 新規セッション開始の条件

- 新しいタスク開始時
- 明示的にリセットを指定した場合

### セッションID保存先

```
.workflow/sessions/
├── {task_id}.session        # タスク単位のセッションID
└── current.session          # 現在のアクティブセッション
```

---

## 出力ファイル

### レビュー結果

```
review/
├── {timestamp}_{plan_name}_{task_id}_review_1.md
├── {timestamp}_{plan_name}_{task_id}_review_2.md
├── {timestamp}_{plan_name}_{task_id}_review_3.md
└── INTERVENTION_REQUIRED_{timestamp}_{plan_name}_{task_id}.md   # 人間介入必要時
```

例: `review/20260528-103000_favorite_task_plan_task_1_review_1.md`

### ワークフローログ

```
.workflow/
├── logs/
│   └── {timestamp}_{feature}.log
├── sessions/
│   └── {task_id}.session
└── status/
    └── {feature}_status.json
```

---

## ステータス管理

`{feature}_status.json` の形式：

```json
{
  "feature": "お気に入り物件",
  "started_at": "2026-05-28T10:00:00",
  "updated_at": "2026-05-28T12:30:00",
  "status": "in_progress",
  "tasks": [
    {
      "id": "task_1",
      "name": "バックエンドEntity作成",
      "status": "completed",
      "iterations": 2,
      "session_id": "sess_abc123"
    },
    {
      "id": "task_2",
      "name": "Mapper/Service作成",
      "status": "in_progress",
      "iterations": 1,
      "session_id": "sess_def456"
    }
  ]
}
```

---

## エラーハンドリング

### リトライポリシー

| エラー種別 | リトライ | アクション |
|-----------|---------|-----------|
| Claude API タイムアウト | 3回 | 指数バックオフ |
| Codex API タイムアウト | 3回 | 指数バックオフ |
| レビュー指摘解消失敗 | - | 人間介入レポート |
| 依存タスク未完了 | - | スキップ＆警告 |

### 人間介入トリガー

1. 最大イテレーション後も High 指摘が残存
2. 同一指摘が3回連続で発生
3. タスク間の整合性エラー

---

## 関連ファイル

- 設計ワークフロー: `.workflow/DESIGN-WORKFLOW.md`
- レビュー基準: `.claude/config/review-criteria.yaml`
- Codexレビュースクリプト: `.workflow/scripts/codex-review.sh`
