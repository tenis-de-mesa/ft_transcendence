include .env

all: up

re: down clean up

up: .env backend/.env backend/node_modules frontend/node_modules
	docker compose up

down:
	docker compose down

clean: down
	docker compose rm -f
	rm -rf backend/node_modules 
	rm -rf frontend/node_modules

backend/node_modules:
	docker compose run backend pnpm install --frozen-lockfile

frontend/node_modules:
	docker compose run frontend pnpm install --frozen-lockfile

backend/.env: .env
	cp .env backend/.env

.env:
	cp .env.sample .env

format:
	docker compose run frontend pnpm format
	docker compose run backend pnpm format

test:
	docker compose run frontend pnpm test
	docker compose run backend pnpm test
	docker compose run backend pnpm test:e2e

backend-sh:
	docker compose run backend sh

frontend-sh:
	docker compose run frontend sh

db-console:
	docker compose run db \
		psql -h db -U ${DATABASE_USER} -d ${DATABASE_NAME}
