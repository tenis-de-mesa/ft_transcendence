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
	rm -rf backend/.pnpm-store
	rm -rf frontend/node_modules
	rm -rf frontend/.pnpm-store

backend/node_modules:
	docker compose run backend pnpm install

frontend/node_modules:
	docker compose run frontend pnpm install

backend/.env: .env
	cp .env backend/.env

.env:
	cp .env.sample .env

format:
	docker compose run frontend pnpm format
	docker compose run backend pnpm format

test:
	docker stop transcendence-db-test && docker rm transcendence-db-test || true
	docker run -d \
		--name="transcendence-db-test" \
		-p 5555:5432 \
		-e POSTGRES_DB=postgres \
		-e POSTGRES_USER=postgres \
		-e POSTGRES_PASSWORD=postgres \
		--network=transcendence-network-internal \
		postgres:alpine
	docker compose run frontend pnpm test
	docker compose run backend pnpm test
	docker compose run backend pnpm test:e2e
	docker stop transcendence-db-test && docker rm transcendence-db-test || true

backend-sh:
	docker compose run backend sh

frontend-sh:
	docker compose run frontend sh

db-console:
	docker compose run db \
		psql -h db -U ${DATABASE_USER} -d ${DATABASE_NAME}
