include .env

all: up 

up: .env backend frontend
	docker compose up

down:
	docker compose down

build:
	docker compose build

backend:
	cp .env backend/
	docker compose run backend pnpm install

frontend:
	docker compose run frontend pnpm install

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