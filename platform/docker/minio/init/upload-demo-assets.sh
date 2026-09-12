#!/usr/bin/env bash
# ============================================================================
# MinIO デモアセット投入スクリプト
# ----------------------------------------------------------------------------
# 用途:
#   docs/design/db/property_demo_data.sql / opensearch demo bulk と整合する
#   30 件分のデモ画像 (JPEG/PNG) と PDF を MinIO バケットへアップロードする。
#
# 前提:
#   - MinIO Client (mc) がインストール済み (https://min.io/docs/minio/linux/reference/minio-mc.html)
#   - MinIO サーバが起動済み (default: http://localhost:9000)
#   - 認証情報は環境変数 / .env で設定済み
#
# 環境変数:
#   MINIO_ENDPOINT    default: http://localhost:9000
#   MINIO_ACCESS_KEY  default: minioadmin
#   MINIO_SECRET_KEY  default: minioadmin
#   MINIO_BUCKET      default: property
#   MINIO_ALIAS       default: smart-property-demo
#
# 使い方:
#   bash platform/docker/minio/init/upload-demo-assets.sh
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES_DIR="${SCRIPT_DIR}/templates"
MANIFEST_FILE="${SCRIPT_DIR}/asset-manifest.txt"

MINIO_ENDPOINT="${MINIO_ENDPOINT:-http://localhost:9000}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:-${MINIO_ROOT_USER:-minioadmin}}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY:-${MINIO_ROOT_PASSWORD:-minioadmin}}"
MINIO_BUCKET="${MINIO_BUCKET:-property}"
MINIO_ALIAS="${MINIO_ALIAS:-smart-property-demo}"

log() {
  echo "[upload-demo-assets] $*"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: '$1' が見つかりません。MinIO Client (mc) をインストールしてください。" >&2
    exit 1
  fi
}

require_cmd mc

if [[ ! -f "${MANIFEST_FILE}" ]]; then
  echo "ERROR: マニフェストが見つかりません: ${MANIFEST_FILE}" >&2
  exit 1
fi

if [[ ! -d "${TEMPLATES_DIR}" ]]; then
  echo "ERROR: テンプレートディレクトリが見つかりません: ${TEMPLATES_DIR}" >&2
  exit 1
fi

log "MinIO エイリアスを設定: ${MINIO_ALIAS} -> ${MINIO_ENDPOINT}"
mc alias set "${MINIO_ALIAS}" "${MINIO_ENDPOINT}" "${MINIO_ACCESS_KEY}" "${MINIO_SECRET_KEY}" >/dev/null

if ! mc ls "${MINIO_ALIAS}/${MINIO_BUCKET}" >/dev/null 2>&1; then
  log "バケット作成: ${MINIO_BUCKET}"
  mc mb --ignore-existing "${MINIO_ALIAS}/${MINIO_BUCKET}" >/dev/null
else
  log "バケット既存: ${MINIO_BUCKET}"
fi

uploaded=0
skipped=0
failed=0

while IFS='|' read -r template object_key; do
  # コメント行・空行をスキップ
  case "${template}" in
    ''|\#*) continue ;;
  esac

  template="${template// /}"
  object_key="${object_key## }"
  object_key="${object_key%% }"

  if [[ -z "${object_key}" ]]; then
    continue
  fi

  src="${TEMPLATES_DIR}/${template}"
  if [[ ! -f "${src}" ]]; then
    echo "ERROR: テンプレートが見つかりません: ${src}" >&2
    failed=$((failed+1))
    continue
  fi

  dst="${MINIO_ALIAS}/${MINIO_BUCKET}/${object_key}"
  if mc cp --quiet "${src}" "${dst}" >/dev/null 2>&1; then
    uploaded=$((uploaded+1))
  else
    echo "ERROR: アップロード失敗: ${object_key}" >&2
    failed=$((failed+1))
  fi
done < "${MANIFEST_FILE}"

log "完了: uploaded=${uploaded} skipped=${skipped} failed=${failed}"

# ============================================================================
# image-search DEMO 画像のアップロード
# ============================================================================
IMAGE_SEARCH_DIR="${SCRIPT_DIR}/image-search"
if [[ -d "${IMAGE_SEARCH_DIR}" ]]; then
  log "image-search DEMO 画像をアップロード中..."
  img_uploaded=0
  for img in "${IMAGE_SEARCH_DIR}"/*.jpg; do
    if [[ -f "${img}" ]]; then
      filename=$(basename "${img}")
      dst="${MINIO_ALIAS}/${MINIO_BUCKET}/demo/image-search/${filename}"
      if mc cp --quiet "${img}" "${dst}" >/dev/null 2>&1; then
        img_uploaded=$((img_uploaded+1))
        log "  アップロード完了: demo/image-search/${filename}"
      else
        echo "ERROR: アップロード失敗: demo/image-search/${filename}" >&2
        failed=$((failed+1))
      fi
    fi
  done
  log "image-search DEMO 画像: ${img_uploaded} 件アップロード完了"
fi

if [[ "${failed}" -gt 0 ]]; then
  exit 1
fi
