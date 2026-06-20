#!/usr/bin/env bash
# config.sh - 4モデル自律開発パイプライン設定

# =============================================================================
# CLI起動コマンド
# =============================================================================
# 各CLIの非対話実行コマンド。環境に合わせて調整すること。

# Claude Code CLI
# 例: claude --print --dangerously-skip-permissions (非対話)
CLAUDE_CMD="claude"
CLAUDE_ARGS="--print"

# Kimi K2.6 CLI
# 例: kimi --no-interactive --output-file <path>
KIMI_CMD="/Users/wangjw/.local/share/uv/tools/kimi-cli/bin/kimi"
KIMI_ARGS=""

# OpenAI Codex CLI
# 例: codex --approval-mode full-auto --quiet
CODEX_CMD="codex"
CODEX_ARGS="--approval-mode full-auto --quiet"

# Gemini CLI
# 例: gemini --non-interactive
GEMINI_CMD="gemini"
GEMINI_ARGS=""

# =============================================================================
# レビュー担当割り当て
# =============================================================================
# スペース区切りで複数指定 = 並行レビュー
# 単一指定 = 単独レビュー
# 値を書き換えるだけで担当交代・並行切替が可能

# Stage 2: アーキテクチャレビュー
# → 要件網羅性・非機能要件・スコープ整合という広い文脈の一貫性チェック
STAGE2_REVIEWERS="gemini"

# Stage 4: 設計レビュー
# → API/DBスキーマの型・命名・冪等性という実装に近い厳密性
STAGE4_REVIEWERS="codex"

# Stage 6: コードレビュー
# → マージ直前の最終ゲート、後戻りコスト最大のため二重チェック
STAGE6_REVIEWERS="codex gemini"

# =============================================================================
# リトライ・制限値
# =============================================================================

# 設計レビュー: 差し戻し1回で停止
MAX_DESIGN_REVIEW_ROUNDS=1

# コードレビュー: 最大リトライ回数
MAX_REVIEW_ROUNDS=3

# 実装リトライ: 同一修正の最大試行回数
MAX_IMPL_RETRIES=3

# =============================================================================
# Git Worktree
# =============================================================================

# Worktreeブランチ名プレフィックス
WORKTREE_PREFIX="agentic"

# Worktree作成先ディレクトリ (プロジェクトルートからの相対)
WORKTREE_DIR="../.worktrees"

# =============================================================================
# パス設定
# =============================================================================

# agentic-dev ディレクトリ (このファイルの場所)
AGENTIC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# プロジェクトルート
PROJECT_ROOT="$(cd "${AGENTIC_DIR}/.." && pwd)"

# ハンドオフディレクトリ
HANDOFF_DIR="${AGENTIC_DIR}/handoff"

# プロンプトディレクトリ
PROMPTS_DIR="${AGENTIC_DIR}/prompts"

# ログディレクトリ
LOG_DIR="${AGENTIC_DIR}/logs"

# =============================================================================
# ハンドオフファイル名
# =============================================================================

# 入力 (人間が書く)
INPUT_FEATURE_REQUEST="00_feature_request.md"

# Stage 1 出力
OUT_REQUIREMENTS="10_requirements.md"
OUT_ARCHITECTURE="11_architecture.md"

# Stage 2 出力 (レビュー) - 実際は 12_review_arch_{model}.md
OUT_ARCH_REVIEW_PREFIX="12_review_arch"

# Stage 3 出力
OUT_UI_DESIGN="20_ui_design.md"
OUT_API_DESIGN="21_api_design.md"
OUT_DB_DESIGN="22_db_design.md"

# Stage 4 出力 (レビュー) - 実際は 23_review_design_{model}.md
OUT_DESIGN_REVIEW_PREFIX="23_review_design"

# Stage 5 出力
OUT_IMPL_REPORT="30_impl_report.md"

# Stage 6 出力 (レビュー) - 実際は 31_review_code_{model}.md
OUT_CODE_REVIEW_PREFIX="31_review_code"

# Stage 7 出力
OUT_SYNTHESIS="40_synthesis.md"

# =============================================================================
# ユーティリティ関数
# =============================================================================

# タイムスタンプ付きログ出力
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

# エラーログ
error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*" >&2
}

# ステージ開始ログ
stage_start() {
    local stage_name="$1"
    echo ""
    echo "========================================================================"
    log "STAGE START: ${stage_name}"
    echo "========================================================================"
}

# ステージ完了ログ
stage_end() {
    local stage_name="$1"
    log "STAGE END: ${stage_name}"
}

# モデル名からCLIコマンドを取得
get_cli_cmd() {
    local model="$1"
    case "${model}" in
        claude) echo "${CLAUDE_CMD} ${CLAUDE_ARGS}" ;;
        kimi)   echo "${KIMI_CMD} ${KIMI_ARGS}" ;;
        codex)  echo "${CODEX_CMD} ${CODEX_ARGS}" ;;
        gemini) echo "${GEMINI_CMD} ${GEMINI_ARGS}" ;;
        *)      error "Unknown model: ${model}"; return 1 ;;
    esac
}
