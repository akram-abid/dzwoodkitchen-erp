#!/bin/bash
set -euo pipefail

REPO_URL="git@github.com:akram-abid/dzwoodkitchen-erp.git"
APP_DIR="/opt/dzwk-erp"
STACK_NAME="dzwk-erp"

if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git fetch origin main
  git reset --hard origin/main
  git clean -fd
else
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

[ -f .env.prod ] || { echo ".env.prod not found in $APP_DIR, aborting"; exit 1; }

IMAGE_TAG=$(git rev-parse --short HEAD)
docker info 2>/dev/null | grep -q "Swarm: active" || docker swarm init

docker build --shm-size=1g -t dzwk-erp:"$IMAGE_TAG" -t dzwk-erp:latest .

# swarm secrets
export ENV_SECRET_NAME="env_prod_$(sha256sum .env.prod | cut -c1-8)"
export POSTGRES_SECRET_NAME="postgres_password_$(sha256sum .postgres_password | cut -c1-8)"

# unique tag per run forces swarm to actually roll the service
export APP_IMAGE="dzwk-erp:$IMAGE_TAG"

docker stack deploy -c docker-compose.yml "$STACK_NAME" --with-registry-auth

echo "waiting for ${STACK_NAME}_app to converge..."
TIMEOUT=180
ELAPSED=0
until [ "$(docker service ls --filter name="${STACK_NAME}_app" --format '{{.Replicas}}' | cut -d/ -f1)" = \
        "$(docker service ls --filter name="${STACK_NAME}_app" --format '{{.Replicas}}' | cut -d/ -f2)" ]; do
  sleep 5
  ELAPSED=$((ELAPSED + 5))
  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    echo "service did not converge within ${TIMEOUT}s, check: docker service ps ${STACK_NAME}_app"
    exit 1
  fi
done

docker image prune -f --filter "until=48h"

# remove orphaned env_prod_* secrets
CURRENT_SECRET=$(docker service inspect "${STACK_NAME}_app" \
  --format '{{range .Spec.TaskTemplate.ContainerSpec.Secrets}}{{.SecretName}}{{end}}')
for s in $(docker secret ls --filter name=env_prod_ --format '{{.Name}}'); do
  [ "$s" != "$CURRENT_SECRET" ] && docker secret rm "$s" 2>/dev/null || true
done
