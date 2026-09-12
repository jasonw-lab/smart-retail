#!/bin/bash
# ==============================================================================
# ./dev.sh - SmartRetail Pro ローカル開発一括起動スクリプト (M5 Mac Native)
# ==============================================================================
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_REPO="/Volumes/Dev/Git/vps/smart-dx-backend"

echo "================================================================================"
echo "🚀 SmartRetail Pro Local AI-Driven Development (M5 Mac Native)"
echo "================================================================================"

# 0. Git Hook の両リポジトリ自動セットアップ
setup_hooks() {
  echo "🔧 [0/3] Checking post-commit auto-reload hooks..."
  mkdir -p "$PROJECT_ROOT/.git/hooks"
  cp "$PROJECT_ROOT/_scripts/git-hooks/post-commit" "$PROJECT_ROOT/.git/hooks/post-commit"
  chmod +x "$PROJECT_ROOT/.git/hooks/post-commit"

  if [ -d "$BACKEND_REPO/.git" ]; then
    mkdir -p "$BACKEND_REPO/.git/hooks"
    cp "$PROJECT_ROOT/_scripts/git-hooks/post-commit" "$BACKEND_REPO/.git/hooks/post-commit"
    chmod +x "$BACKEND_REPO/.git/hooks/post-commit"
    echo "   ==> Hooks installed in both smart-retail-dx and smart-dx-backend. ✅"
  fi
}
setup_hooks

# 1. OrbStack インフラコンテナの確認 & 起動
echo "📦 [1/3] Ensuring local infrastructure containers (OrbStack)..."
cd "$PROJECT_ROOT/platform/docker"

# BASEPATH (/mydata) の存在確認
BASEPATH_CHECK="/mydata"
if [ ! -d "$BASEPATH_CHECK" ]; then
  echo "   ⚠️ $BASEPATH_CHECK not found. Running initial setup (make local-setup)..."
  make local-setup || true
fi

# docker-compose-env.yml を up -d（起動済みはスキップされ、未起動のみ起動）
echo "   ==> Checking MySQL, Redis, OpenSearch, PowerJob..."
docker compose -f docker-compose-env.yml up -d

# MySQL の ヘルスチェック待機
echo "   ==> Waiting for MySQL readiness..."
RETRY=0
until docker compose -f docker-compose-env.yml ps smart-retail-mysql 2>/dev/null | grep -q "(healthy)" || [ $RETRY -ge 15 ]; do
  sleep 1
  RETRY=$((RETRY + 1))
done
echo "   ==> Infrastructure ready. ✅"

# 2. バックエンド起動 (Spring Boot 3.3 / Port 8080)
echo "☕ [2/3] Checking Spring Boot Backend..."
BACKEND_DIR="$BACKEND_REPO/apps/backend"
if [ ! -d "$BACKEND_DIR" ]; then
  BACKEND_DIR="$PROJECT_ROOT/apps/backend"
fi

BE_PID=""
if curl -sf --connect-timeout 1 --max-time 1 http://localhost:8080/actuator/health > /dev/null 2>&1; then
  echo "   ==> Backend already running on http://localhost:8080. ✅"
else
  echo "   ==> Starting Spring Boot backend with DevTools (logs: /tmp/smart-retail-backend.log)..."
  pkill -f "smart-dx-app" 2>/dev/null || true
  (cd "$BACKEND_DIR" && nohup mvn spring-boot:run -pl app -Dspring-boot.run.profiles=dev > /tmp/smart-retail-backend.log 2>&1 &)
  BE_PID=$!
  echo "   ==> Backend launched (PID: $BE_PID). Waiting for health check..."
  
  RETRY=0
  until curl -sf --connect-timeout 1 --max-time 1 http://localhost:8080/actuator/health > /dev/null 2>&1 || [ $RETRY -ge 35 ]; do
    sleep 1
    RETRY=$((RETRY + 1))
    printf "."
  done
  echo ""
  if curl -sf --connect-timeout 1 --max-time 1 http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "   ==> Backend is healthy on http://localhost:8080! ✅"
  else
    echo "   ⚠️ Backend launch taking longer than expected. Check logs: tail -f /tmp/smart-retail-backend.log"
  fi
fi

# クリーンアップ用トラップハンドラー
cleanup() {
  echo ""
  echo "🛑 Stopping local development processes..."
  if [ -n "$BE_PID" ]; then
    kill "$BE_PID" 2>/dev/null || true
  fi
  exit 0
}
trap cleanup SIGINT SIGTERM

# 3. フロントエンド起動 (Next.js 15 Turbopack / Port 3001)
echo "⚡ [3/3] Starting Next.js 15 Frontend on http://localhost:3001..."
echo "--------------------------------------------------------------------------------"
echo "💡 AI がコード修正・コミット後、ブラウザ画面は自動的にリフレッシュされます。"
echo "   終了時は Ctrl+C を押してください。"
echo "--------------------------------------------------------------------------------"

cd "$PROJECT_ROOT/apps/frontend-next"
pnpm dev
