# 4モデル自律開発パイプライン

4つのAIモデル (Claude, Kimi K2.6, Codex, Gemini) を組み合わせた自律的な機能開発パイプライン。

## 概要

```
┌─────────────────────────────────────────────────────────────────────┐
│                         パイプライン全体像                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [人間] 00_feature_request.md を作成                                │
│           │                                                         │
│           ▼                                                         │
│  ┌─────────────────┐                                               │
│  │ Stage 1: Claude │ 要件定義 + アーキテクチャ設計                  │
│  └────────┬────────┘                                               │
│           │ 10_requirements.md, 11_architecture.md                  │
│           ▼                                                         │
│  ┌─────────────────┐                                               │
│  │ Stage 2: Gemini │ アーキテクチャレビュー (広い文脈の一貫性)      │
│  └────────┬────────┘                                               │
│           │ 12_review_arch_gemini.md                                │
│           ▼                                                         │
│  ┌─────────────────┐                                               │
│  │ Stage 3: Kimi   │ UI/API/DB 詳細設計                             │
│  └────────┬────────┘                                               │
│           │ 20_ui_design.md, 21_api_design.md, 22_db_design.md      │
│           ▼                                                         │
│  ┌─────────────────┐                                               │
│  │ Stage 4: Codex  │ 設計レビュー (型・命名・冪等性の厳密性)        │
│  └────────┬────────┘                                               │
│           │ 23_review_design_codex.md                               │
│           ▼                                                         │
│  ┌─────────────────┐                                               │
│  │ Stage 5: Kimi   │ 実装 + Backend E2E + Frontend E2E             │
│  └────────┬────────┘                                               │
│           │ 30_impl_report.md + 実際のコード                        │
│           ▼                                                         │
│  ┌──────────────────────┐                                          │
│  │ Stage 6: Codex+Gemini│ コードレビュー (並行二重チェック)         │
│  └────────┬─────────────┘                                          │
│           │ 31_review_code_codex.md, 31_review_code_gemini.md       │
│           ▼                                                         │
│  ┌─────────────────┐                                               │
│  │ Stage 7: Claude │ 最終統合・判定                                 │
│  └────────┬────────┘                                               │
│           │ 40_synthesis.md                                         │
│           ▼                                                         │
│  [人間] 最終レポート確認 → マージ判断                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 前提条件

### CLI ツール

以下のCLIがインストール・認証済みであること:

| CLI | 状態 | 用途 |
|-----|------|------|
| `claude` | OK | 要件/アーキ設計, 最終統合 |
| `kimi` | OK | 詳細設計, 実装 |
| `codex` | OK | 設計/コードレビュー |
| `gemini` | OK | アーキ/コードレビュー |

### 認証

各CLIは事前に認証を完了しておくこと:
- Claude: Max サブスクリプション
- Kimi: OAuth認証
- Codex: ChatGPT Plus
- Gemini: プラン認証

## レビュー担当方針

レビューは3ステージあり、性質に応じてモデルを使い分けます。

| Stage | デフォルト担当 | 理由 |
|-------|---------------|------|
| Stage 2 (アーキレビュー) | Gemini 単独 | 要件網羅性・非機能要件・スコープ整合という広い文脈の一貫性チェック |
| Stage 4 (設計レビュー) | Codex 単独 | API/DBスキーマの型・命名・冪等性という実装に近い厳密性チェック |
| Stage 6 (コードレビュー) | Codex + Gemini 並行 | マージ直前の最終ゲート。後戻りコスト最大のため二重チェック |

### レビュー担当の変え方

`config.sh` の `STAGE*_REVIEWERS` を編集するだけで、単独・交代・並行を切り替え可能:

```bash
# 単独レビュー (1モデル)
STAGE2_REVIEWERS="gemini"

# 担当交代 (別モデルに変更)
STAGE2_REVIEWERS="codex"

# 並行レビュー (複数モデル、スペース区切り)
STAGE6_REVIEWERS="codex gemini"
```

## ディレクトリ構成

```
agentic-dev/
├── README.md                 # このファイル
├── PROJECT_CONTEXT.md        # プロジェクト調査結果
├── config.sh                 # CLI設定・レビュー担当割当
├── orchestrate.sh            # オーケストレータ (実行可能)
├── prompts/                  # 各ステージのプロンプト
│   ├── stage1_claude.md
│   ├── stage2_review.md
│   ├── stage3_kimi_design.md
│   ├── stage4_review.md
│   ├── stage5_kimi_impl.md
│   ├── stage6_review.md
│   └── stage7_claude_synthesis.md
├── handoff/                  # ハンドオフファイル
│   └── 00_feature_request.md # 入力テンプレート
└── logs/                     # 実行ログ (自動生成)
```

## 使い方

### 段階導入 (推奨)

**重要**: 最初は全自動で回さず、ステージを1つずつ手動実行してハンドオフ品質を確認すること。安定後に `orchestrate.sh` で全自動化に移行。

```bash
# 1. 機能要望を記入
vim agentic-dev/handoff/00_feature_request.md

# 2. Stage 1 のみ実行
./agentic-dev/orchestrate.sh --stage 1

# 3. 出力を確認
cat agentic-dev/handoff/10_requirements.md
cat agentic-dev/handoff/11_architecture.md

# 4. 問題なければ次のステージへ
./agentic-dev/orchestrate.sh --stage 2

# 5. レビュー結果を確認
cat agentic-dev/handoff/12_review_arch_gemini.md

# ... 以降、各ステージを確認しながら進める
```

### 全自動実行 (安定後)

ステージごとの品質が安定したら、全自動実行に移行:

```bash
# 機能要望を記入
vim agentic-dev/handoff/00_feature_request.md

# 全ステージ実行
./agentic-dev/orchestrate.sh
```

### ドライラン

実際のCLI実行なしでコマンドを確認:

```bash
./agentic-dev/orchestrate.sh --dry-run
```

## 安全装置

### 自動停止条件

| 条件 | Exit Code | 対応 |
|------|-----------|------|
| Stage 1 で「## 要確認(人間へ)」がある | 2 | 人間が確認して修正 |
| Stage 2 レビューで `[BLOCKER]` / `REQUEST_CHANGES` | 3 | Stage 1 を修正して再実行 |
| Stage 4 レビューで `[BLOCKER]` / `REQUEST_CHANGES` | 4 | Stage 3 を修正して再実行 |
| Stage 5 で「## 行き詰まり」がある | 5 | 人間が介入して問題解決 |
| Stage 6 レビュー3回差し戻し | 6 | 人間が介入して問題解決 |

### Git Worktree

- パイプラインは `main` ブランチを直接変更しない
- 新しい worktree を作成し、独立したブランチで作業
- 完了後、人間がマージを判断

## 設定カスタマイズ

`config.sh` を編集して環境に合わせる:

```bash
# CLI コマンドの調整
CLAUDE_CMD="claude"
CLAUDE_ARGS="--print"

# レビュー担当の調整
STAGE2_REVIEWERS="gemini"      # アーキレビュー
STAGE4_REVIEWERS="codex"       # 設計レビュー
STAGE6_REVIEWERS="codex gemini" # コードレビュー (並行)

# リトライ回数
MAX_REVIEW_ROUNDS=3
MAX_IMPL_RETRIES=3
```

## トラブルシューティング

### CLI が見つからない

```bash
command -v claude kimi codex gemini
```

見つからない場合は各CLIをインストールし、PATHを通すこと。

### 認証エラー

各CLIの認証状態を確認:

```bash
claude --version
kimi auth status
codex --help
gemini --version
```

### Worktree エラー

既存の worktree が残っている場合:

```bash
git worktree list
git worktree remove <path>
```

## 参照ドキュメント

- プロジェクトコンテキスト: `PROJECT_CONTEXT.md`
- 各ステージのプロンプト: `prompts/`
- ハンドオフファイル仕様: 各プロンプト内の「出力フォーマット」セクション
