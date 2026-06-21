#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "ERROR: .env not found."
  echo "Please copy .env.example to .env and fill SERVER_IP, SSH_USER, SSH_PASSWORD."
  exit 1
fi

# Load .env without leaking values to shell history
set -a
# shellcheck source=/dev/null
source .env
set +a

required_vars=(SERVER_IP SSH_USER SSH_PASSWORD)
for v in "${required_vars[@]}"; do
  if [ -z "${!v:-}" ]; then
    echo "ERROR: $v is not set in .env"
    exit 1
  fi
done

KEY_PATH="${SSH_KEY_PATH:-$HOME/.ssh/id_ed25519}"
PUB_KEY_PATH="${KEY_PATH}.pub"

echo "==> Using SSH key: $KEY_PATH"
echo "==> Target host:   ${SSH_USER}@${SERVER_IP}"

# 1. SSH key generation (idempotent)
if [ ! -f "$KEY_PATH" ]; then
  echo "==> Generating ed25519 SSH key at $KEY_PATH ..."
  ssh-keygen -t ed25519 -N "" -f "$KEY_PATH" -C "smart-retail-deploy-$(whoami)@$(hostname -s)"
else
  echo "==> SSH key already exists: $KEY_PATH"
fi

# 2. Copy public key if passwordless SSH is not yet configured (one-time password use)
echo "==> Testing passwordless SSH ..."
if ssh -o BatchMode=yes -o ConnectTimeout=5 "${SSH_USER}@${SERVER_IP}" echo "passwordless-ok" >/dev/null 2>&1; then
  echo "==> Passwordless SSH is already configured."
else
  echo "==> Passwordless SSH not available. Copying public key with ssh-copy-id ..."

  # Accept host key automatically without interactive prompt
  mkdir -p ~/.ssh
  ssh-keyscan -H "$SERVER_IP" >> ~/.ssh/known_hosts 2>/dev/null || true

  /usr/bin/expect -f - <<EXPECT
set timeout 60
spawn ssh-copy-id -o StrictHostKeyChecking=accept-new -i ${PUB_KEY_PATH} ${SSH_USER}@${SERVER_IP}
expect {
  "yes/no"    { send "yes\r"; exp_continue }
  "password:" { send "${SSH_PASSWORD}\r"; exp_continue }
  "Password:" { send "${SSH_PASSWORD}\r"; exp_continue }
  eof
}
EXPECT
fi

# 3. SSH connection test (must succeed)
echo "==> Verifying SSH connection ..."
if ! ssh -o BatchMode=yes -o ConnectTimeout=5 "${SSH_USER}@${SERVER_IP}" echo "SSH-OK"; then
  echo "ERROR: SSH connection test failed."
  echo "Possible causes:"
  echo "  - SERVER_IP / SSH_USER is incorrect"
  echo "  - SSH_PASSWORD is incorrect"
  echo "  - Remote server does not allow password authentication"
  echo "  - Remote SSH server is not reachable"
  exit 1
fi

# 4. Docker context creation (idempotent)
if docker context ls --format '{{.Name}}' | grep -qx "ubuntu-stag"; then
  echo "==> Docker context 'ubuntu-stag' already exists."
else
  echo "==> Creating Docker context 'ubuntu-stag' ..."
  docker context create ubuntu-stag --docker "host=ssh://${SSH_USER}@${SERVER_IP}"
fi

# 5. Remote Docker test
echo "==> Verifying remote Docker daemon ..."
if ! docker --context ubuntu-stag ps >/dev/null 2>&1; then
  echo "ERROR: Remote Docker daemon is not responding."
  echo "Possible causes:"
  echo "  - Docker is not installed on the remote host"
  echo "  - Docker daemon is not running on the remote host"
  echo "  - Remote user is not in the 'docker' group"
  exit 1
fi

echo ""
echo "==> Remote deployment environment is ready."
echo "    You can now run: make deploy"
