# app deployment script

# shellcheck disable=SC2164
git pull
cd  ./apps/backend/docker

docker compose -f docker-compose-app.yml up -d --build