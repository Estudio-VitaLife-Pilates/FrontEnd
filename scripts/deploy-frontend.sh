#!/bin/bash
set -euo pipefail

image_tag="${1:?Usage: deploy-frontend IMAGE_TAG AWS_REGION ECR_REGISTRY BACKEND_PRIVATE_IP}"
region="${2:?AWS_REGION is required}"
registry="${3:?ECR_REGISTRY is required}"
backend_private_ip="${4:?BACKEND_PRIVATE_IP is required}"

if [[ ! "$image_tag" =~ ^[A-Za-z0-9_.-]{1,128}$ ]]; then
  echo "Invalid ECR image tag" >&2
  exit 2
fi
if [[ ! "$backend_private_ip" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
  echo "Invalid backend private IP" >&2
  exit 2
fi

export DEBIAN_FRONTEND=noninteractive
if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1 || \
   ! command -v nginx >/dev/null 2>&1 || ! command -v aws >/dev/null 2>&1 || \
   ! command -v curl >/dev/null 2>&1; then
  apt-get update
  apt-get install -y awscli curl docker.io docker-compose-v2 nginx
fi

install -d -m 755 /etc/docker
cat > /tmp/pilates-docker-daemon.json <<'DOCKER'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "5"
  },
  "live-restore": true
}
DOCKER
if ! cmp -s /tmp/pilates-docker-daemon.json /etc/docker/daemon.json; then
  install -m 644 /tmp/pilates-docker-daemon.json /etc/docker/daemon.json
  systemctl restart docker
fi
systemctl enable --now docker

cat > /etc/nginx/sites-available/default <<NGINX
server {
    listen 80 default_server;
    server_name _;

    location /api/ {
        proxy_pass http://${backend_private_ip}:8080/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX
nginx -t
systemctl enable --now nginx
systemctl reload nginx

compose_dir=/opt/infra-pilates/frontend
install -d -m 750 "$compose_dir"
cat > "$compose_dir/compose.yml" <<'COMPOSE'
services:
  frontend:
    image: ${FRONTEND_IMAGE:?FRONTEND_IMAGE must be set}
    container_name: pilates-frontend
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:80"
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "5"
COMPOSE

aws ecr get-login-password --region "$region" | \
  docker login --username AWS --password-stdin "$registry"

image="$registry/frontend/dev:$image_tag"
printf 'FRONTEND_IMAGE=%s\n' "$image" > "$compose_dir/.env"
chmod 600 "$compose_dir/.env"
docker compose --project-name pilates-frontend --project-directory "$compose_dir" \
  -f "$compose_dir/compose.yml" pull
docker compose --project-name pilates-frontend --project-directory "$compose_dir" \
  -f "$compose_dir/compose.yml" up -d --remove-orphans
for attempt in $(seq 1 30); do
  if curl --fail --silent http://127.0.0.1:8080/ >/dev/null; then
    printf '%s\n' "$image_tag" > "$compose_dir/image-tag"
    chmod 600 "$compose_dir/image-tag"
    exit 0
  fi
  sleep 2
done

docker compose --project-name pilates-frontend --project-directory "$compose_dir" \
  -f "$compose_dir/compose.yml" logs --tail=100 >&2
echo "Frontend container did not become available on port 8080." >&2
exit 1
