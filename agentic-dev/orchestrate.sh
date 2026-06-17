#!/usr/bin/env bash
# orchestrate.sh - 4モデル自律開発パイプライン オーケストレータ
#
# 使い方:
#   ./orchestrate.sh [--stage N] [--dry-run]
#
# オプション:
#   --stage N    指定ステージのみ実行 (1-7)
#   --dry-run    実行せずコマンドを表示

set -euo pipefail

# =============================================================================
# 設定読み込み
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config.sh"

# =============================================================================
# 引数解析
# =============================================================================

SINGLE_STAGE=""
DRY_RUN=false

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
        *)
            error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# =============================================================================
# 初期化
# =============================================================================

mkdir -p "${LOG_DIR}"
mkdir -p "${HANDOFF_DIR}"

TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
LOGFILE="${LOG_DIR}/run_${TIMESTAMP}.log"

# =============================================================================
# Worktree 作成
# =============================================================================

setup_worktree() {
    stage_start "Worktree Setup"

    local branch_name="${WORKTREE_PREFIX}-${TIMESTAMP}"
    local worktree_path="${PROJECT_ROOT}/${WORKTREE_DIR}/${branch_name}"

    log "Creating worktree: ${worktree_path}"
    log "Branch: ${branch_name}"

    if [[ "${DRY_RUN}" == "true" ]]; then
        log "[DRY-RUN] git worktree add -b ${branch_name} ${worktree_path}"
        WORK_DIR="${PROJECT_ROOT}"
    else
        cd "${PROJECT_ROOT}"
        mkdir -p "$(dirname "${worktree_path}")"
        git worktree add -b "${branch_name}" "${worktree_path}" HEAD
        WORK_DIR="${worktree_path}"
    fi

    export WORK_DIR
    log "Working directory: ${WORK_DIR}"
    stage_end "Worktree Setup"
}

# =============================================================================
# CLI実行ヘルパー
# =============================================================================

run_model() {
    local model="$1"
    local prompt_file="$2"
    local output_file="$3"

    local cli_cmd
    cli_cmd=$(get_cli_cmd "${model}")

    log "Running ${model}: ${prompt_file} -> ${output_file}"

    if [[ "${DRY_RUN}" == "true" ]]; then
        log "[DRY-RUN] ${cli_cmd} < ${prompt_file} > ${output_file}"
        return 0
    fi

    cd "${WORK_DIR}"
    eval "${cli_cmd}" < "${prompt_file}" > "${output_file}" 2>&1 || {
        error "${model} execution failed"
        return 1
    }
}

# =============================================================================
# 汎用レビュー実行関数
# =============================================================================
# 使い方: run_review_stage <prompt_path> <output_prefix> "<reviewers>"
# reviewers はスペース区切りで複数指定可能 (並行レビュー)
# 出力は {prefix}_{model}.md に書き出される

run_review_stage() {
    local prompt_path="$1"
    local output_prefix="$2"
    local reviewers="$3"

    log "Review stage: reviewers=[${reviewers}]"

    for model in ${reviewers}; do
        local output_file="${HANDOFF_DIR}/${output_prefix}_${model}.md"

        # プロンプトにモデル名を埋め込んだ一時ファイルを作成
        local temp_prompt
        temp_prompt=$(mktemp)
        cat "${prompt_path}" > "${temp_prompt}"
        echo -e "\n\n---\n# 実行情報\nレビュアーモデル: ${model}\n出力ファイル名: ${output_prefix}_${model}.md" >> "${temp_prompt}"

        run_model "${model}" "${temp_prompt}" "${output_file}"
        rm "${temp_prompt}"

        log "Review output: ${output_file}"
    done
}

# =============================================================================
# ハンドオフ判定
# =============================================================================

check_human_required() {
    local file="$1"
    if grep -q "## 要確認(人間へ)" "${file}" 2>/dev/null; then
        return 0  # 人間の確認が必要
    fi
    return 1
}

# レビュー出力群に BLOCKER/REQUEST_CHANGES があるか (ワイルドカード対応)
check_review_blocker() {
    local prefix="$1"
    local pattern="${HANDOFF_DIR}/${prefix}_*.md"

    for f in ${pattern}; do
        if [[ -f "$f" ]] && grep -qE '\[BLOCKER\]|REQUEST_CHANGES' "$f" 2>/dev/null; then
            log "Blocker found in: $f"
            return 0
        fi
    done
    return 1
}

check_impl_stuck() {
    local file="$1"
    if grep -q "## 行き詰まり" "${file}" 2>/dev/null; then
        return 0
    fi
    return 1
}

# =============================================================================
# ステージ関数
# =============================================================================

stage1_requirements_architecture() {
    stage_start "Stage 1: Requirements & Architecture (Claude)"

    local prompt="${PROMPTS_DIR}/stage1_claude.md"
    local input="${HANDOFF_DIR}/${INPUT_FEATURE_REQUEST}"
    local output_req="${HANDOFF_DIR}/${OUT_REQUIREMENTS}"
    local output_arch="${HANDOFF_DIR}/${OUT_ARCHITECTURE}"

    if [[ ! -f "${input}" ]]; then
        error "Feature request not found: ${input}"
        echo ">>> 次のアクション: ${input} を作成してください"
        exit 1
    fi

    # プロンプトと入力を結合
    local combined_prompt
    combined_prompt=$(mktemp)
    cat "${prompt}" > "${combined_prompt}"
    echo -e "\n\n---\n# 機能要望入力\n" >> "${combined_prompt}"
    cat "${input}" >> "${combined_prompt}"

    run_model "claude" "${combined_prompt}" "${output_req}"
    rm "${combined_prompt}"

    # 人間確認が必要かチェック
    if check_human_required "${output_req}"; then
        log "Human review required"
        echo ">>> 人間の確認が必要です"
        echo ">>> 確認ファイル: ${output_req}"
        exit 2
    fi

    stage_end "Stage 1"
}

stage2_architecture_review() {
    stage_start "Stage 2: Architecture Review (${STAGE2_REVIEWERS})"

    local prompt="${PROMPTS_DIR}/stage2_review.md"
    local input="${HANDOFF_DIR}/${OUT_ARCHITECTURE}"

    # レビュー対象を結合したプロンプトを作成
    local combined_prompt
    combined_prompt=$(mktemp)
    cat "${prompt}" > "${combined_prompt}"
    echo -e "\n\n---\n# 要件定義\n" >> "${combined_prompt}"
    cat "${HANDOFF_DIR}/${OUT_REQUIREMENTS}" >> "${combined_prompt}"
    echo -e "\n\n---\n# アーキテクチャ設計\n" >> "${combined_prompt}"
    cat "${input}" >> "${combined_prompt}"

    run_review_stage "${combined_prompt}" "${OUT_ARCH_REVIEW_PREFIX}" "${STAGE2_REVIEWERS}"
    rm "${combined_prompt}"

    if check_review_blocker "${OUT_ARCH_REVIEW_PREFIX}"; then
        log "Architecture review has blockers - returning to Stage 1"
        echo ">>> アーキテクチャレビューでブロッカーが検出されました"
        echo ">>> 確認ファイル: ${HANDOFF_DIR}/${OUT_ARCH_REVIEW_PREFIX}_*.md"
        echo ">>> Stage 1 を修正して再実行してください"
        exit 3
    fi

    stage_end "Stage 2"
}

stage3_design() {
    stage_start "Stage 3: UI/API/DB Design (Kimi)"

    local prompt="${PROMPTS_DIR}/stage3_kimi_design.md"
    local output_ui="${HANDOFF_DIR}/${OUT_UI_DESIGN}"

    # 全入力を結合
    local combined_prompt
    combined_prompt=$(mktemp)
    cat "${prompt}" > "${combined_prompt}"
    echo -e "\n\n---\n# 要件定義\n" >> "${combined_prompt}"
    cat "${HANDOFF_DIR}/${OUT_REQUIREMENTS}" >> "${combined_prompt}"
    echo -e "\n\n---\n# アーキテクチャ設計\n" >> "${combined_prompt}"
    cat "${HANDOFF_DIR}/${OUT_ARCHITECTURE}" >> "${combined_prompt}"

    run_model "kimi" "${combined_prompt}" "${output_ui}"
    rm "${combined_prompt}"

    stage_end "Stage 3"
}

stage4_design_review() {
    stage_start "Stage 4: Design Review (${STAGE4_REVIEWERS})"

    local prompt="${PROMPTS_DIR}/stage4_review.md"

    # 設計ファイルを結合
    local combined_prompt
    combined_prompt=$(mktemp)
    cat "${prompt}" > "${combined_prompt}"
    echo -e "\n\n---\n# UI設計\n" >> "${combined_prompt}"
    cat "${HANDOFF_DIR}/${OUT_UI_DESIGN}" >> "${combined_prompt}"
    echo -e "\n\n---\n# API設計\n" >> "${combined_prompt}"
    cat "${HANDOFF_DIR}/${OUT_API_DESIGN}" >> "${combined_prompt}"
    echo -e "\n\n---\n# DB設計\n" >> "${combined_prompt}"
    cat "${HANDOFF_DIR}/${OUT_DB_DESIGN}" >> "${combined_prompt}"

    run_review_stage "${combined_prompt}" "${OUT_DESIGN_REVIEW_PREFIX}" "${STAGE4_REVIEWERS}"
    rm "${combined_prompt}"

    if check_review_blocker "${OUT_DESIGN_REVIEW_PREFIX}"; then
        log "Design review has blockers - returning to Stage 3"
        echo ">>> 設計レビューでブロッカーが検出されました"
        echo ">>> 確認ファイル: ${HANDOFF_DIR}/${OUT_DESIGN_REVIEW_PREFIX}_*.md"
        echo ">>> Stage 3 を修正して再実行してください"
        exit 4
    fi

    stage_end "Stage 4"
}

stage5_implementation() {
    stage_start "Stage 5: Implementation (Kimi)"

    local prompt="${PROMPTS_DIR}/stage5_kimi_impl.md"
    local output="${HANDOFF_DIR}/${OUT_IMPL_REPORT}"

    # 全設計ファイルを結合
    local combined_prompt
    combined_prompt=$(mktemp)
    cat "${prompt}" > "${combined_prompt}"
    echo -e "\n\n---\n# 要件定義\n" >> "${combined_prompt}"
    cat "${HANDOFF_DIR}/${OUT_REQUIREMENTS}" >> "${combined_prompt}"
    echo -e "\n\n---\n# UI設計\n" >> "${combined_prompt}"
    cat "${HANDOFF_DIR}/${OUT_UI_DESIGN}" >> "${combined_prompt}"
    echo -e "\n\n---\n# API設計\n" >> "${combined_prompt}"
    cat "${HANDOFF_DIR}/${OUT_API_DESIGN}" >> "${combined_prompt}"
    echo -e "\n\n---\n# DB設計\n" >> "${combined_prompt}"
    cat "${HANDOFF_DIR}/${OUT_DB_DESIGN}" >> "${combined_prompt}"

    run_model "kimi" "${combined_prompt}" "${output}"
    rm "${combined_prompt}"

    if check_impl_stuck "${output}"; then
        log "Implementation is stuck"
        echo ">>> 実装が行き詰まりました"
        echo ">>> 確認ファイル: ${output}"
        exit 5
    fi

    stage_end "Stage 5"
}

stage6_code_review() {
    stage_start "Stage 6: Code Review (${STAGE6_REVIEWERS})"

    local prompt="${PROMPTS_DIR}/stage6_review.md"
    local round=1

    while [[ ${round} -le ${MAX_REVIEW_ROUNDS} ]]; do
        log "Code review round: ${round}/${MAX_REVIEW_ROUNDS}"

        # プロンプトと実装レポートを結合
        local combined_prompt
        combined_prompt=$(mktemp)
        cat "${prompt}" > "${combined_prompt}"
        echo -e "\n\n---\n# 実装レポート\n" >> "${combined_prompt}"
        cat "${HANDOFF_DIR}/${OUT_IMPL_REPORT}" >> "${combined_prompt}"

        run_review_stage "${combined_prompt}" "${OUT_CODE_REVIEW_PREFIX}" "${STAGE6_REVIEWERS}"
        rm "${combined_prompt}"

        if ! check_review_blocker "${OUT_CODE_REVIEW_PREFIX}"; then
            log "Code review passed"
            stage_end "Stage 6"
            return 0
        fi

        log "Code review has issues - requesting fixes"

        if [[ ${round} -lt ${MAX_REVIEW_ROUNDS} ]]; then
            # Kimiに修正を依頼 (Stage 5を再実行)
            stage5_implementation
        fi

        ((round++))
    done

    log "Max review rounds exceeded"
    echo ">>> コードレビューの最大リトライ回数 (${MAX_REVIEW_ROUNDS}) を超過しました"
    echo ">>> 確認ファイル: ${HANDOFF_DIR}/${OUT_CODE_REVIEW_PREFIX}_*.md"
    exit 6
}

stage7_synthesis() {
    stage_start "Stage 7: Synthesis (Claude)"

    local prompt="${PROMPTS_DIR}/stage7_claude_synthesis.md"
    local output="${HANDOFF_DIR}/${OUT_SYNTHESIS}"

    # 全成果物を結合
    local combined_prompt
    combined_prompt=$(mktemp)
    cat "${prompt}" > "${combined_prompt}"
    echo -e "\n\n---\n# 成果物一覧\n" >> "${combined_prompt}"
    for f in "${HANDOFF_DIR}"/*.md; do
        if [[ -f "$f" ]]; then
            echo -e "\n## $(basename "$f")\n" >> "${combined_prompt}"
            cat "$f" >> "${combined_prompt}"
        fi
    done

    run_model "claude" "${combined_prompt}" "${output}"
    rm "${combined_prompt}"

    stage_end "Stage 7"

    echo ""
    echo "========================================================================"
    log "PIPELINE COMPLETED"
    echo "========================================================================"
    echo ">>> 最終レポート: ${output}"
    echo ">>> ログファイル: ${LOGFILE}"
    echo ">>> Worktree: ${WORK_DIR}"
}

# =============================================================================
# メイン実行
# =============================================================================

main() {
    log "Starting 4-Model Autonomous Development Pipeline"
    log "Log file: ${LOGFILE}"
    log "Review config: Stage2=[${STAGE2_REVIEWERS}] Stage4=[${STAGE4_REVIEWERS}] Stage6=[${STAGE6_REVIEWERS}]"

    # Worktree作成
    setup_worktree

    # ステージ実行
    if [[ -n "${SINGLE_STAGE}" ]]; then
        case "${SINGLE_STAGE}" in
            1) stage1_requirements_architecture ;;
            2) stage2_architecture_review ;;
            3) stage3_design ;;
            4) stage4_design_review ;;
            5) stage5_implementation ;;
            6) stage6_code_review ;;
            7) stage7_synthesis ;;
            *) error "Invalid stage: ${SINGLE_STAGE}"; exit 1 ;;
        esac
    else
        stage1_requirements_architecture
        stage2_architecture_review
        stage3_design
        stage4_design_review
        stage5_implementation
        stage6_code_review
        stage7_synthesis
    fi
}

# ログにも出力
main 2>&1 | tee -a "${LOGFILE}"
