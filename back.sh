#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_DIR="${SCRIPT_DIR}/platform/docker"
COMPOSE_FILE="${COMPOSE_DIR}/docker-compose-app.yml"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

extract_basepath_from_file() {
    local file="$1"
    local line

    [ -f "$file" ] || return 1

    line="$(grep -E '^[[:space:]]*(export[[:space:]]+)?BASEPATH[[:space:]]*=' "$file" | tail -n 1 || true)"
    [ -n "$line" ] || return 1

    printf '%s\n' "$line" \
        | sed -E "s/^[[:space:]]*(export[[:space:]]+)?BASEPATH[[:space:]]*=[[:space:]]*//; s/[[:space:]]+$//; s/^['\"]//; s/['\"]$//"
}

resolve_basepath() {
    local candidate=""
    local source_file=""

    if [ -n "${BASEPATH:-}" ]; then
        BASEPATH_SOURCE="environment"
        export BASEPATH
        return 0
    fi

    for source_file in \
        "$HOME/.bashrc" \
        "$HOME/.bash_profile" \
        "$HOME/.profile" \
        "$HOME/.zshrc" \
        "$HOME/.zprofile" \
        "$COMPOSE_DIR/.env.prod" \
        "$COMPOSE_DIR/.env"; do
        candidate="$(extract_basepath_from_file "$source_file" || true)"
        if [ -n "$candidate" ]; then
            BASEPATH="$candidate"
            BASEPATH_SOURCE="$source_file"
            export BASEPATH
            return 0
        fi
    done

    return 1
}

resolve_basepath || true

ENV_FILE="${BASEPATH}/nginx/apps-env/mall-retail/platform/docker/.env.prod"

if [ -z "${BASEPATH:-}" ]; then
    echo -e "${RED}Error: BASEPATH is not set${NC}"
    echo "Checked environment, shell profile files, and project .env files."
    exit 1
fi

if [ ! -d "$BASEPATH" ]; then
    echo -e "${RED}Error: BASEPATH does not exist: $BASEPATH${NC}"
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: .env file not found at $ENV_FILE${NC}"
    exit 1
fi

if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}Error: compose file not found: $COMPOSE_FILE${NC}"
    exit 1
fi

if ! docker network inspect jason-lab-net >/dev/null 2>&1; then
    echo -e "${RED}Error: network 'jason-lab-net' does not exist${NC}"
    echo -e "${YELLOW}Start the environment containers first.${NC}"
    echo "  cd ${COMPOSE_DIR} && docker compose --env-file .env -f docker-compose-env.yml up -d"
    exit 1
fi

# Default target is "all" when no argument is provided.
TARGET="${1:-all}"
shift || true

SERVICES=()
DISPLAY_TARGET="$TARGET"

case "$TARGET" in
    backend)
        SERVICES=("smart-retail-backend")
        ;;
    simulator)
        SERVICES=("smart-retail-simulator")
        ;;
    all)
        SERVICES=("smart-retail-backend" "smart-retail-simulator")
        ;;
    *)
        echo -e "${RED}Error: unsupported target '${TARGET}'${NC}"
        echo "Usage: $0 [backend|simulator|all]"
        exit 1
        ;;
esac

if [ "$#" -gt 0 ]; then
    echo -e "${RED}Error: too many arguments${NC}"
    echo "Usage: $0 [backend|simulator|all]"
    exit 1
fi

echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}Smart Retail App Deployment${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo "Loaded from: $ENV_FILE"
echo "BASEPATH: $BASEPATH"
echo "BASEPATH source: ${BASEPATH_SOURCE:-unknown}"
echo "Compose file: $COMPOSE_FILE"
echo "Target: $DISPLAY_TARGET"
echo ""
echo -e "${YELLOW}Services:${NC} ${SERVICES[*]}"
echo ""

cd "$COMPOSE_DIR"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build "${SERVICES[@]}"

echo ""
echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}Deployment Status${NC}"
echo -e "${GREEN}==============================================================================${NC}"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps "${SERVICES[@]}"
echo ""
echo -e "${GREEN}Usage:${NC}"
echo "  ./back.sh               # deploy all apps (default: all)"
echo "  ./back.sh all           # deploy all apps"
echo "  ./back.sh backend       # deploy backend only"
echo "  ./back.sh simulator     # deploy simulator only"
