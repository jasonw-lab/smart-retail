#!/usr/bin/env bash
# =============================================================================
# seed-demo-embeddings.sh
# =============================================================================
# DEMO用固定画像の embedding vector を OpenSearch から取得し MySQL に投入する
#
# ADR-011: OpenSearch 専用戦略
# - DEMO画像の embedding は MySQL property_demo_embedding テーブルに保存
# - 本番物件の embedding は OpenSearch feature_vector に保存
#
# 使用方法:
#   OPENSEARCH_URL="http://192.168.1.199:9200" \
#   MYSQL_HOST="192.168.1.199" \
#   MYSQL_USER="root" \
#   MYSQL_PASSWORD="xxx" \
#   MYSQL_DATABASE="property_admin_tenant" \
#   ./seed-demo-embeddings.sh
#
# 環境変数:
#   OPENSEARCH_URL     - OpenSearch URL (default: http://localhost:9200)
#   MYSQL_HOST         - MySQL host (default: localhost)
#   MYSQL_PORT         - MySQL port (default: 3306)
#   MYSQL_USER         - MySQL user (default: root)
#   MYSQL_PASSWORD     - MySQL password (required)
#   MYSQL_DATABASE     - MySQL database (default: property_admin_tenant)
#   OPENSEARCH_INDEX   - OpenSearch index (default: realty_published_listings)
#   DRY_RUN            - Set to "true" for dry run (default: false)
# =============================================================================

set -euo pipefail

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
OPENSEARCH_URL="${OPENSEARCH_URL:-http://localhost:9200}"
OPENSEARCH_INDEX="${OPENSEARCH_INDEX:-realty_published_listings}"
MYSQL_HOST="${MYSQL_HOST:-localhost}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-}"
MYSQL_DATABASE="${MYSQL_DATABASE:-property_admin_tenant}"
DRY_RUN="${DRY_RUN:-false}"

# DEMO mapping: demo_ref -> propertyType for selecting source vector
# 各DEMOは対応する物件種別の既存物件からベクトルを取得
# Note: bash 3.2 compatible (no associative arrays)
DEMO_REFS="demo-highrise-001 demo-house-001 demo-commercial-001"

get_property_type() {
    local demo_ref="$1"
    case "$demo_ref" in
        demo-highrise-001) echo "mansion" ;;
        demo-house-001)    echo "house" ;;
        demo-commercial-001) echo "retail" ;;
        *) echo "" ;;
    esac
}

# -----------------------------------------------------------------------------
# Logging
# -----------------------------------------------------------------------------
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*" >&2
}

# -----------------------------------------------------------------------------
# Validation
# -----------------------------------------------------------------------------
validate_dependencies() {
    local has_error=0

    if ! command -v curl &> /dev/null; then
        log_error "Missing required command: curl"
        has_error=1
    fi
    if ! command -v jq &> /dev/null; then
        log_error "Missing required command: jq"
        has_error=1
    fi
    if ! command -v mysql &> /dev/null; then
        log_error "Missing required command: mysql"
        has_error=1
    fi

    if [ "$has_error" -eq 1 ]; then
        exit 1
    fi
}

validate_config() {
    if [ -z "$MYSQL_PASSWORD" ]; then
        log_error "MYSQL_PASSWORD is required"
        exit 1
    fi
}

# -----------------------------------------------------------------------------
# OpenSearch Operations
# -----------------------------------------------------------------------------
check_opensearch() {
    log "Checking OpenSearch connection: ${OPENSEARCH_URL}"

    local http_status
    http_status=$(curl -s -o /dev/null -w '%{http_code}' \
        "${OPENSEARCH_URL}/_cluster/health" 2>/dev/null || echo "000")

    if [ "$http_status" != "200" ]; then
        log_error "OpenSearch is not available (HTTP ${http_status})"
        log_error "URL: ${OPENSEARCH_URL}"
        exit 1
    fi

    log "OpenSearch connection OK"
}

# 指定した propertyType の物件から feature_vector を取得
fetch_feature_vector() {
    local property_type="$1"

    log "Fetching feature_vector for propertyType=${property_type}"

    local query
    query=$(cat <<EOF
{
  "size": 1,
  "query": {
    "bool": {
      "filter": [
        { "term": { "propertyType": "${property_type}" } },
        { "exists": { "field": "feature_vector" } }
      ]
    }
  },
  "_source": ["propertyKey", "feature_vector"]
}
EOF
)

    local response
    response=$(curl -s -X POST "${OPENSEARCH_URL}/${OPENSEARCH_INDEX}/_search" \
        -H "Content-Type: application/json" \
        -d "$query" 2>/dev/null)

    local hit_count
    hit_count=$(echo "$response" | jq -r '.hits.total.value // 0')

    if [ "$hit_count" -eq 0 ]; then
        log "  No document found with feature_vector for propertyType=${property_type}"
        return 1
    fi

    local property_key
    property_key=$(echo "$response" | jq -r '.hits.hits[0]._source.propertyKey // empty')

    local feature_vector
    feature_vector=$(echo "$response" | jq -c '.hits.hits[0]._source.feature_vector // []')

    local vector_length
    vector_length=$(echo "$feature_vector" | jq 'length')

    if [ "$vector_length" -eq 0 ]; then
        log "  feature_vector is empty for propertyKey=${property_key}"
        return 1
    fi

    log "  Found feature_vector from propertyKey=${property_key} (${vector_length} dimensions)"
    echo "$feature_vector"
}

# -----------------------------------------------------------------------------
# MySQL Operations
# -----------------------------------------------------------------------------
check_mysql() {
    log "Checking MySQL connection: ${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}"

    if ! mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" \
        -e "SELECT 1" "$MYSQL_DATABASE" &>/dev/null; then
        log_error "MySQL connection failed"
        exit 1
    fi

    log "MySQL connection OK"
}

update_demo_embedding() {
    local demo_ref="$1"
    local embedding_vector="$2"

    if [ "$DRY_RUN" = "true" ]; then
        log "  [DRY RUN] Would update demo_ref=${demo_ref}"
        return 0
    fi

    # JSON をエスケープ（シングルクォート内なので最小限）
    local escaped_vector
    escaped_vector=$(echo "$embedding_vector" | sed "s/'/\\\\'/g")

    local sql="UPDATE property_demo_embedding SET embedding_vector = '${escaped_vector}' WHERE demo_ref = '${demo_ref}'"

    if mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" \
        -e "$sql" "$MYSQL_DATABASE" 2>/dev/null; then
        log "  Updated demo_ref=${demo_ref}"
        return 0
    else
        log_error "  Failed to update demo_ref=${demo_ref}"
        return 1
    fi
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
main() {
    log "=== DEMO Embedding Seeder ==="
    log "ADR-011: OpenSearch 専用戦略 - DEMO embedding を MySQL に投入"

    if [ "$DRY_RUN" = "true" ]; then
        log "DRY RUN mode enabled - no changes will be made"
    fi

    validate_dependencies
    validate_config
    check_opensearch
    check_mysql

    local success_count=0
    local fail_count=0
    local skip_count=0

    for demo_ref in $DEMO_REFS; do
        local property_type
        property_type=$(get_property_type "$demo_ref")

        if [ -z "$property_type" ]; then
            log "Skipping unknown demo_ref: ${demo_ref}"
            skip_count=$((skip_count + 1))
            continue
        fi

        log "Processing: ${demo_ref} -> ${property_type}"

        local feature_vector
        if feature_vector=$(fetch_feature_vector "$property_type"); then
            if update_demo_embedding "$demo_ref" "$feature_vector"; then
                success_count=$((success_count + 1))
            else
                fail_count=$((fail_count + 1))
            fi
        else
            log "  Skipping ${demo_ref} - no source vector available"
            skip_count=$((skip_count + 1))
        fi
    done

    log "=== Summary ==="
    log "Success: ${success_count}"
    log "Failed:  ${fail_count}"
    log "Skipped: ${skip_count}"

    if [ "$fail_count" -gt 0 ]; then
        exit 1
    fi

    log "=== Done ==="
}

main "$@"
