#!/bin/bash
#
# .env・設定ファイルのバックアップ/復元スクリプト
# 使用方法:
#   ./env-backup.sh backup   - .envおよび設定ファイルをバックアップ
#   ./env-backup.sh restore  - .envおよび設定ファイルを復元
#   ./env-backup.sh list     - ファイル状況を表示
#

# sh で呼ばれた場合でも bash で実行されるように自動再起動
if [ -z "$BASH_VERSION" ]; then
    exec bash "$0" "$@"
fi

set -e

# ~/.bashrc を読み込んで BASEPATH などの環境変数を取得
if [[ -f "$HOME/.bashrc" ]]; then
    # shellcheck source=/dev/null
    source "$HOME/.bashrc"
fi

# パス設定（スクリプトの場所を基準に相対パス）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
BASEPATH="${BASEPATH:-/Users/wangjw/Dev/_Env/_demo/seata-mode}"
BACKUP_DIR="${BASEPATH}/nginx/apps-env/mall-retail"

# バックアップ対象ファイル（プロジェクト相対パス）
ENV_FILES=(
    "platform/docker/.env"
    "apps/frontend/.env.production"
    "apps/frontend/.env.development"
    "apps/backend/.env"
    "apps/simulator/.env"
)

# バックアップ対象ファイル（絶対パス: nginx設定など）
CONF_FILES=(
)

# 絶対パスファイルのバックアップ先を返す（conf/ + フルパス）
conf_backup_path() {
    echo "$BACKUP_DIR/conf$1"
}

backup() {
    echo "=== .env ファイルをバックアップ ==="
    mkdir -p "$BACKUP_DIR"

    for env_file in "${ENV_FILES[@]}"; do
        src="$PROJECT_DIR/$env_file"
        # ディレクトリ構造を保持してバックアップ
        dest_dir="$BACKUP_DIR/$(dirname "$env_file")"
        dest="$BACKUP_DIR/$env_file"

        if [[ -f "$src" ]]; then
            mkdir -p "$dest_dir"
            cp "$src" "$dest"
            echo "  ✓ $env_file"
        else
            echo "  - $env_file (存在しない)"
        fi
    done

    echo ""
    echo "=== 設定ファイルをバックアップ ==="

    for conf_file in "${CONF_FILES[@]}"; do
        dest="$(conf_backup_path "$conf_file")"
        dest_dir="$(dirname "$dest")"

        if [[ -f "$conf_file" ]]; then
            mkdir -p "$dest_dir"
            cp "$conf_file" "$dest"
            echo "  ✓ $conf_file"
        else
            echo "  - $conf_file (存在しない)"
        fi
    done

    echo ""
    echo "バックアップ完了: $BACKUP_DIR"
}

restore() {
    echo "=== .env ファイルを復元 ==="

    if [[ ! -d "$BACKUP_DIR" ]]; then
        echo "エラー: バックアップディレクトリが存在しません: $BACKUP_DIR"
        exit 1
    fi

    for env_file in "${ENV_FILES[@]}"; do
        src="$BACKUP_DIR/$env_file"
        dest="$PROJECT_DIR/$env_file"
        dest_dir="$(dirname "$dest")"

        if [[ -f "$src" ]]; then
            mkdir -p "$dest_dir"
            cp "$src" "$dest"
            echo "  ✓ $env_file"
        else
            echo "  - $env_file (バックアップなし)"
        fi
    done

    echo ""
    echo "=== 設定ファイルを復元 ==="

    for conf_file in "${CONF_FILES[@]}"; do
        src="$(conf_backup_path "$conf_file")"
        dest_dir="$(dirname "$conf_file")"

        if [[ -f "$src" ]]; then
            mkdir -p "$dest_dir"
            cp "$src" "$conf_file"
            echo "  ✓ $conf_file"
        else
            echo "  - $conf_file (バックアップなし)"
        fi
    done

    echo ""
    echo "復元完了"
}

list() {
    echo "=== 現在の.envファイル状況 ==="
    echo ""
    echo "[プロジェクト: $PROJECT_DIR]"
    for env_file in "${ENV_FILES[@]}"; do
        src="$PROJECT_DIR/$env_file"
        if [[ -f "$src" ]]; then
            echo "  ✓ $env_file"
        else
            echo "  - $env_file (なし)"
        fi
    done
    echo ""
    echo "[バックアップ: $BACKUP_DIR]"
    if [[ -d "$BACKUP_DIR" ]]; then
        for env_file in "${ENV_FILES[@]}"; do
            src="$BACKUP_DIR/$env_file"
            if [[ -f "$src" ]]; then
                echo "  ✓ $env_file"
            else
                echo "  - $env_file (なし)"
            fi
        done
    else
        echo "  (バックアップディレクトリなし)"
    fi

    echo ""
    echo "[設定ファイル（絶対パス）]"
    for conf_file in "${CONF_FILES[@]}"; do
        live_status="なし"
        back_status="なし"
        [[ -f "$conf_file" ]] && live_status="あり"
        [[ -f "$(conf_backup_path "$conf_file")" ]] && back_status="あり"
        echo "  $conf_file  [実ファイル: $live_status / バックアップ: $back_status]"
    done
}

case "${1:-}" in
    backup)
        backup
        ;;
    restore)
        restore
        ;;
    list)
        list
        ;;
    *)
        echo "使用方法: $0 {backup|restore|list}"
        echo ""
        echo "  backup  - プロジェクトの.envおよび設定ファイルをバックアップ"
        echo "  restore - バックアップから.envおよび設定ファイルを復元"
        echo "  list    - 現在のファイル状況を表示"
        exit 1
        ;;
esac
