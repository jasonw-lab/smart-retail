#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"

# Load .env if present
if [ -f "${ENV_FILE}" ]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

BASEPATH="${BASEPATH:-/mydata}"
echo "=========================================="
echo "Setting up local environment directories"
echo "Target BASEPATH: ${BASEPATH}"
echo "=========================================="

# If running on macOS and BASEPATH is a symlink (e.g. synthetic.conf), ensure OrbStack VM has the same symlink
if [ "$(uname)" = "Darwin" ] && [ -L "${BASEPATH}" ]; then
  REAL_BASEPATH="$(cd "${BASEPATH}" && pwd -P)"
  if docker info 2>/dev/null | grep -qi "orbstack"; then
    echo "==> Ensuring OrbStack VM symlink for ${BASEPATH} -> ${REAL_BASEPATH} ..."
    docker run --rm --privileged --pid=host alpine chroot /proc/1/root sh -c \
      "[ -L '${BASEPATH}' ] || (rm -rf '${BASEPATH}' && ln -s '${REAL_BASEPATH}' '${BASEPATH}')" 2>/dev/null || true
  fi
fi

# 1. Create directories
echo "==> Creating directories under ${BASEPATH} ..."
mkdir -p "${BASEPATH}/mysql_3306/conf"
mkdir -p "${BASEPATH}/mysql_3306/data"
mkdir -p "${BASEPATH}/mysql_3306/log"

mkdir -p "${BASEPATH}/redis/conf"
mkdir -p "${BASEPATH}/redis/data"

mkdir -p "${BASEPATH}/minio/data"

mkdir -p "${BASEPATH}/nginx/conf/conf.d/sub"
mkdir -p "${BASEPATH}/nginx/html/retail"
mkdir -p "${BASEPATH}/nginx/logs"
mkdir -p "${BASEPATH}/nginx/apps-env/mall-retail/platform/docker"

mkdir -p "${BASEPATH}/app/backend/logs"
mkdir -p "${BASEPATH}/app/simulator/logs"

# 2. Copy config files if not already existing
echo "==> Deploying configuration templates ..."

# MySQL my.cnf
if [ ! -f "${BASEPATH}/mysql_3306/conf/my.cnf" ]; then
  if [ -f "${SCRIPT_DIR}/mysql/conf/my.cnf" ]; then
    cp "${SCRIPT_DIR}/mysql/conf/my.cnf" "${BASEPATH}/mysql_3306/conf/my.cnf"
    echo "  - Copied my.cnf to ${BASEPATH}/mysql_3306/conf/my.cnf"
  fi
else
  echo "  - my.cnf already exists, skipping."
fi

# Redis redis.conf
if [ ! -f "${BASEPATH}/redis/conf/redis.conf" ]; then
  if [ -f "${SCRIPT_DIR}/redis/config/redis.conf" ]; then
    cp "${SCRIPT_DIR}/redis/config/redis.conf" "${BASEPATH}/redis/conf/redis.conf"
    echo "  - Copied redis.conf to ${BASEPATH}/redis/conf/redis.conf"
  fi
else
  echo "  - redis.conf already exists, skipping."
fi

# Nginx configs
if [ ! -f "${BASEPATH}/nginx/conf/nginx.conf" ] && [ -f "${SCRIPT_DIR}/nginx/conf/nginx.conf" ]; then
  cp "${SCRIPT_DIR}/nginx/conf/nginx.conf" "${BASEPATH}/nginx/conf/nginx.conf"
  echo "  - Copied nginx.conf"
fi

if [ ! -f "${BASEPATH}/nginx/conf/conf.d/default.conf" ] && [ -f "${SCRIPT_DIR}/nginx/conf/conf.d/default.conf" ]; then
  cp "${SCRIPT_DIR}/nginx/conf/conf.d/default.conf" "${BASEPATH}/nginx/conf/conf.d/default.conf"
  echo "  - Copied default.conf"
fi

# Stub sub/ec-demo.conf if not present to avoid nginx include errors
if [ ! -f "${BASEPATH}/nginx/conf/conf.d/sub/ec-demo.conf" ]; then
  cat << 'CONF_EOF' > "${BASEPATH}/nginx/conf/conf.d/sub/ec-demo.conf"
# Local ec-demo stub
# (Add ec-demo specific reverse proxy routes here if needed)
CONF_EOF
  echo "  - Created stub ec-demo.conf"
fi

# front.sh compatible .env.prod
PROD_ENV_STUB="${BASEPATH}/nginx/apps-env/mall-retail/platform/docker/.env.prod"
if [ ! -f "${PROD_ENV_STUB}" ]; then
  cat << ENV_PROD_EOF > "${PROD_ENV_STUB}"
# front.sh local stub
BASEPATH=${BASEPATH}
ENV_PROD_EOF
  echo "  - Created ${PROD_ENV_STUB} for front.sh"
fi

# 3. Ensure Docker network exists
NETWORK_NAME="jason-lab-net"
if docker network inspect "${NETWORK_NAME}" >/dev/null 2>&1; then
  echo "==> Docker network '${NETWORK_NAME}' already exists."
else
  echo "==> Creating Docker network '${NETWORK_NAME}' ..."
  docker network create "${NETWORK_NAME}"
fi

echo ""
echo "=== Local environment setup completed successfully! ==="
echo "You can now run:"
echo "  cd ${SCRIPT_DIR} && docker compose -f docker-compose-env.yml up -d"
echo ""
