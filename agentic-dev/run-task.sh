#!/usr/bin/env bash
# run-task.sh - タスクファイル指定型 実装パイプライン
#
# 使い方:
#   ./agentic-dev/run-task.sh tasks/01_login.md [--dry-run] [--stage N]
#
# フロー:
#   Stage 1: 調査 (Claude) - 現状把握・変更点特定
#   Stage 2: 実装+テスト (Kimi) - コード実装・テスト実行
#   Stage 3: レビュー (Codex) - コードレビュー・修正ループ

set -euo pipefail

# =============================================================================
# 設定読み込み
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config.sh"

# =============================================================================
# 引数解析
# =============================================================================

TASK_FILE=""
SINGLE_STAGE=""
DRY_RUN=false

show_usage() {
    cat << EOF
Usage: $0 <task-file> [options]

Arguments:
  task-file          タスクファイル (例: tasks/01_login.md)

Options:
  --stage N          指定ステージのみ実行 (1-3)
  --dry-run          実行せずコマンドを表示
  -h, --help         このヘルプを表示

Examples:
  $0 tasks/01_login.md
  $0 tasks/01_login.md --stage 1
  $0 tasks/01_login.md --dry-run
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --stage)
            SINGLE_STAGE="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        -*)
            error "Unknown option: $1"
            show_usage
            exit 1
            ;;
        \#*)
            # コメントは無視
            shift
            ;;
        *)
            if [[ -z "${TASK_FILE}" ]]; then
                TASK_FILE="$1"
            else
                # 追加の引数は無視（コメント等）
                :
            fi
            shift
            ;;
    esac
done

if [[ -z "${TASK_FILE}" ]]; then
    error "Task file required"
    show_usage
    exit 1
fi

# タスクファイルの絶対パス解決
if [[ ! "${TASK_FILE}" = /* ]]; then
    TASK_FILE="${AGENTIC_DIR}/${TASK_FILE}"
fi

if [[ ! -f "${TASK_FILE}" ]]; then
    error "Task file not found: ${TASK_FILE}"
    exit 1
fi

TASK_NAME=$(basename "${TASK_FILE}" .md)

# =============================================================================
# 初期化
# =============================================================================

mkdir -p "${LOG_DIR}"

# タスク別の出力ディレクトリ
TASK_OUT_DIR="${AGENTIC_DIR}/output/${TASK_NAME}"
mkdir -p "${TASK_OUT_DIR}"

TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
LOGFILE="${LOG_DIR}/${TASK_NAME}_${TIMESTAMP}.log"

# =============================================================================
# CLI実行ヘルパー
# =============================================================================

run_model() {
    local model="$1"
    local prompt_file="$2"
    local output_file="$3"

    local cli_cmd
    cli_cmd=$(get_cli_cmd "${model}")

    log "Running ${model}: $(basename "${prompt_file}") -> $(basename "${output_file}")"

    if [[ "${DRY_RUN}" == "true" ]]; then
        log "[DRY-RUN] ${cli_cmd} < ${prompt_file} > ${output_file}"
        # ドライラン時はダミー出力を生成
        echo "# [DRY-RUN] ${model} output" > "${output_file}"
        return 0
    fi

    cd "${PROJECT_ROOT}"
    eval "${cli_cmd}" < "${prompt_file}" > "${output_file}" 2>&1 || {
        error "${model} execution failed"
        cat "${output_file}" >&2
        return 1
    }
}

# =============================================================================
# ステージ関数
# =============================================================================

stage1_investigate() {
    stage_start "Stage 1: Investigation (Claude)"

    local prompt="${PROMPTS_DIR}/impl_stage1_investigate.md"
    local output="${TASK_OUT_DIR}/01_investigation.md"

    # プロンプトとタスクを結合
    local combined_prompt
    combined_prompt=$(mktemp)
    cat "${prompt}" > "${combined_prompt}"
    echo -e "\n\n---\n# タスク定義\n" >> "${combined_prompt}"
    cat "${TASK_FILE}" >> "${combined_prompt}"

    run_model "claude" "${combined_prompt}" "${output}"
    rm "${combined_prompt}"

    log "Investigation output: ${output}"
    stage_end "Stage 1"
}

stage2_implement() {
    stage_start "Stage 2: Implementation + Test (Kimi)"

    local prompt="${PROMPTS_DIR}/impl_stage2_implement.md"
    local output="${TASK_OUT_DIR}/02_implementation.md"

    # プロンプト + タスク + 調査結果を結合
    local combined_prompt
    combined_prompt=$(mktemp)
    cat "${prompt}" > "${combined_prompt}"
    echo -e "\n\n---\n# タスク定義\n" >> "${combined_prompt}"
    cat "${TASK_FILE}" >> "${combined_prompt}"

    if [[ -f "${TASK_OUT_DIR}/01_investigation.md" ]]; then
        echo -e "\n\n---\n# 調査結果\n" >> "${combined_prompt}"
        cat "${TASK_OUT_DIR}/01_investigation.md" >> "${combined_prompt}"
    fi

    run_model "kimi" "${combined_prompt}" "${output}"
    rm "${combined_prompt}"

    log "Implementation output: ${output}"
    stage_end "Stage 2"
}

stage3_review() {
    stage_start "Stage 3: Code Review (Codex)"

    local prompt="${PROMPTS_DIR}/impl_stage3_review.md"
    local output="${TASK_OUT_DIR}/03_review.md"
    local round=1

    while [[ ${round} -le ${MAX_REVIEW_ROUNDS} ]]; do
        log "Code review round: ${round}/${MAX_REVIEW_ROUNDS}"

        # プロンプト + タスク + 実装結果を結合
        local combined_prompt
        combined_prompt=$(mktemp)
        cat "${prompt}" > "${combined_prompt}"
        echo -e "\n\n---\n# タスク定義\n" >> "${combined_prompt}"
        cat "${TASK_FILE}" >> "${combined_prompt}"
        echo -e "\n\n---\n# 実装レポート\n" >> "${combined_prompt}"
        cat "${TASK_OUT_DIR}/02_implementation.md" >> "${combined_prompt}"

        run_model "codex" "${combined_prompt}" "${output}"
        rm "${combined_prompt}"

        # レビュー結果チェック
        if ! grep -qE '\[BLOCKER\]|REQUEST_CHANGES' "${output}" 2>/dev/null; then
            log "Code review PASSED"
            stage_end "Stage 3"
            return 0
        fi

        log "Code review has issues"

        if [[ ${round} -lt ${MAX_REVIEW_ROUNDS} ]]; then
            log "Requesting fixes from Kimi..."

            # 修正依頼用のプロンプト作成
            local fix_prompt
            fix_prompt=$(mktemp)
            cat "${PROMPTS_DIR}/impl_stage2_implement.md" > "${fix_prompt}"
            echo -e "\n\n---\n# タスク定義\n" >> "${fix_prompt}"
            cat "${TASK_FILE}" >> "${fix_prompt}"
            echo -e "\n\n---\n# 前回の実装\n" >> "${fix_prompt}"
            cat "${TASK_OUT_DIR}/02_implementation.md" >> "${fix_prompt}"
            echo -e "\n\n---\n# レビュー指摘 (修正必須)\n" >> "${fix_prompt}"
            cat "${output}" >> "${fix_prompt}"

            run_model "kimi" "${fix_prompt}" "${TASK_OUT_DIR}/02_implementation.md"
            rm "${fix_prompt}"
        fi

        ((round++))
    done

    log "Max review rounds exceeded"
    echo ">>> コードレビューの最大リトライ回数 (${MAX_REVIEW_ROUNDS}) を超過しました"
    echo ">>> 確認ファイル: ${output}"
    exit 6
}

# =============================================================================
# メイン実行
# =============================================================================

main() {
    echo ""
    echo "========================================================================"
    log "Task Implementation Pipeline"
    echo "========================================================================"
    log "Task: ${TASK_FILE}"
    log "Output: ${TASK_OUT_DIR}"
    log "Log: ${LOGFILE}"
    echo ""

    # ステージ実行
    if [[ -n "${SINGLE_STAGE}" ]]; then
        case "${SINGLE_STAGE}" in
            1) stage1_investigate ;;
            2) stage2_implement ;;
            3) stage3_review ;;
            *) error "Invalid stage: ${SINGLE_STAGE} (valid: 1-3)"; exit 1 ;;
        esac
    else
        stage1_investigate
        stage2_implement
        stage3_review
    fi

    echo ""
    echo "========================================================================"
    log "PIPELINE COMPLETED"
    echo "========================================================================"
    echo ">>> 出力ディレクトリ: ${TASK_OUT_DIR}"
    echo ">>> ログファイル: ${LOGFILE}"
}

main 2>&1 | tee -a "${LOGFILE}"
