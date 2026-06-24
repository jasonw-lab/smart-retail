# Load environment variables from .env (optional, mostly for setup-remote.sh)
include .env
export

CONTEXT := ubuntu-stag

.PHONY: deploy logs ps down local fe

deploy:
	@echo "==> Switching Docker context to $(CONTEXT) ..."
	@docker context use $(CONTEXT)
	@set -e; \
	trap 'echo "==> Restoring Docker context to default ..."; docker context use default' EXIT; \
	echo "==> Deploying to remote (platform: linux/amd64) ..."; \
	DOCKER_DEFAULT_PLATFORM=linux/amd64 docker compose -f docker-compose-app.yml --profile backend up -d --build

fe:
	@echo "==> Building and deploying frontend on remote ..."
	@set -e; \
	ssh $(SSH_USER)@$(SERVER_IP) 'export VOLTA_HOME="$$HOME/.volta" && export PATH="$$VOLTA_HOME/bin:$$PATH" && export BASEPATH=/mydata2 && cd ~/smart-retail-dx && ./front.sh'
	@echo "==> Restarting remote nginx ..."
	@ssh $(SSH_USER)@$(SERVER_IP) 'docker restart ec-demo-nginx'

logs:
	@echo "==> Showing remote container logs ..."
	@docker --context $(CONTEXT) compose -f docker-compose-app.yml logs -f

ps:
	@echo "==> Remote container status ..."
	@docker --context $(CONTEXT) compose -f docker-compose-app.yml ps

down:
	@echo "==> Stopping remote containers ..."
	@docker --context $(CONTEXT) compose -f docker-compose-app.yml down

local:
	@echo "==> Switching Docker context to default (local) ..."
	@docker context use default
