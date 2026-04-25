DC = COMPOSE_BAKE=true docker compose -f docker-compose.yml

all: up

up:
	@$(DC) up -d

down:
	@$(DC) down

restart: down up

build:
	@$(DC) build

rebuild:
	@$(DC) up -d --build --force-recreate --no-cache

fclean:
	@$(DC) down -v --rmi all --remove-orphans
	@docker builder prune -f

init:
	@./scripts/init.sh

.PHONY: all up down restart build rebuild fclean
