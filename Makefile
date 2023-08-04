include .env

all: up 

up: .env backend/node_modules frontend/node_modules
	docker compose up

down:
	docker compose down

backend/node_modules:
	cp .env backend/
	docker compose run backend pnpm install --frozen-lockfile

frontend/node_modules:
	docker compose run frontend pnpm install --frozen-lockfile

.env:
	cp .env.sample .env

format:
	docker compose run frontend pnpm format
	docker compose run backend pnpm format

test:
	docker compose run frontend pnpm test
	docker compose run backend pnpm test

backend-sh:
	docker compose run backend sh

db-console:
	docker compose run db \
		psql -h db -U ${POSTGRES_USER} -d ${POSTGRES_DB}
