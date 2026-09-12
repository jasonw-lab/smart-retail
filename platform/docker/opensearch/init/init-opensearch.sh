#!/usr/bin/env sh

set -eu

OPENSEARCH_URL="${OPENSEARCH_URL:-http://smart-dx-opensearch:9200}"
INIT_DIR="${INIT_DIR:-/init}"
TEMPLATE_FILE="${INIT_DIR}/realty-listings-template.json"
DEMO_BULK_FILE="${INIT_DIR}/realty-listings-demo-bulk.ndjson"

# ADR-004:
#   OpenSearch document _id rule is tenantId:scope:propertyCode.
#   Existing indices are deleted and recreated by this init script so mapping
#   changes are applied deterministically in the demo/docker environment.
#
# Optional environment variables:
#   RESET_OPENSEARCH_INDICES=true|false  default: true
#   IMPORT_DEMO_DATA=true|false          default: true
#   OPENSEARCH_URL=http://host:9200
#   INIT_DIR=/init
RESET_OPENSEARCH_INDICES="${RESET_OPENSEARCH_INDICES:-true}"
IMPORT_DEMO_DATA="${IMPORT_DEMO_DATA:-true}"

log() {
  echo "[opensearch-init] $*"
}

log "Waiting for OpenSearch: ${OPENSEARCH_URL}"
until curl -fsS "${OPENSEARCH_URL}/_cluster/health?wait_for_status=yellow&timeout=5s" >/dev/null; do
  sleep 2
done

log "Creating ingest pipeline: realty-attachment"
curl -fsS -X PUT "${OPENSEARCH_URL}/_ingest/pipeline/realty-attachment" \
  -H "Content-Type: application/json" \
  --data-binary "@${INIT_DIR}/realty-attachment-pipeline.json" >/dev/null

log "Creating index template: realty-listings-template"
curl -fsS -X PUT "${OPENSEARCH_URL}/_index_template/realty-listings-template" \
  -H "Content-Type: application/json" \
  --data-binary "@${TEMPLATE_FILE}" >/dev/null

template_version="$(jq -r '.template.mappings._meta.version // "unknown"' "${TEMPLATE_FILE}")"

for index_name in realty_published_listings realty_draft_listings; do
  if [ "${RESET_OPENSEARCH_INDICES}" = "true" ]; then
    log "Deleting index if exists: ${index_name}"
    delete_status="$(curl -sS -o /dev/null -w '%{http_code}' -X DELETE \
      "${OPENSEARCH_URL}/${index_name}" 2>/dev/null || true)"
    case "${delete_status}" in
      200|404)
        ;;
      *)
        echo "ERROR: Unexpected delete status ${delete_status} for ${index_name}" >&2
        exit 1
        ;;
    esac
  fi

  http_status="$(curl -sS -o /dev/null -w '%{http_code}' \
    "${OPENSEARCH_URL}/${index_name}" 2>/dev/null || true)"

  case "${http_status}" in
    200)
      existing_version="$(curl -fsS "${OPENSEARCH_URL}/${index_name}/_mapping" \
        | jq -r ".[\"${index_name}\"].mappings._meta.version // \"unknown\"" 2>/dev/null || echo "unknown")"
      if [ "${existing_version}" = "${template_version}" ]; then
        log "Index already exists: ${index_name} (mapping version=${existing_version}, in sync)"
      else
        echo "ERROR: ${index_name} mapping version=${existing_version} but template version=${template_version}." >&2
        echo "ERROR: Set RESET_OPENSEARCH_INDICES=true to recreate demo indices." >&2
        exit 1
      fi
      ;;
    404)
      log "Creating index: ${index_name} (template version=${template_version})"
      curl -fsS -X PUT "${OPENSEARCH_URL}/${index_name}" >/dev/null
      ;;
    *)
      echo "ERROR: Unexpected status ${http_status} for ${index_name}" >&2
      exit 1
      ;;
  esac
done

if [ "${IMPORT_DEMO_DATA}" = "true" ]; then
  if [ ! -f "${DEMO_BULK_FILE}" ]; then
    echo "ERROR: Demo bulk file not found: ${DEMO_BULK_FILE}" >&2
    exit 1
  fi

  log "Importing demo data: ${DEMO_BULK_FILE}"
  bulk_response="$(curl -fsS -X POST "${OPENSEARCH_URL}/_bulk?refresh=true" \
    -H "Content-Type: application/x-ndjson" \
    --data-binary "@${DEMO_BULK_FILE}")"

  bulk_errors="$(printf '%s' "${bulk_response}" | jq -r '.errors')"
  if [ "${bulk_errors}" != "false" ]; then
    echo "ERROR: Demo bulk import has errors" >&2
    printf '%s\n' "${bulk_response}" | jq '.items[] | select(.index.error != null)'
    exit 1
  fi

  imported_count="$(printf '%s' "${bulk_response}" | jq '.items | length')"
  log "Demo import completed: ${imported_count} documents"
else
  log "Skipping demo data import because IMPORT_DEMO_DATA=${IMPORT_DEMO_DATA}"
fi

log "OpenSearch initialization completed."
