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
	docker compose run --rm --no-deps backend pnpm install

frontend/node_modules:
	docker compose run --rm --no-deps frontend pnpm install

backend/.env: .env
	cp .env backend/.env

.env:
	cp .env.sample .env

format:
	docker compose run --rm --no-deps frontend pnpm format
	docker compose run --rm --no-deps backend pnpm format

test:
	docker compose --profile test up db-test -d
	docker compose run --rm --no-deps backend pnpm test
	docker compose run --rm --no-deps backend pnpm test:integration
	docker compose run --rm --no-deps backend pnpm test:e2e
	docker compose run --rm --no-deps backend pnpm lint
	docker compose run --rm --no-deps frontend pnpm test
	docker compose run --rm --no-deps frontend pnpm lint
	docker compose --profile test down db-test

backend-sh:
	docker compose run --rm backend sh

frontend-sh:
	docker compose run --rm frontend sh

db-console:
	docker compose run --rm db \
		psql -h db -U ${DATABASE_USER} -d ${DATABASE_NAME}

nginx:
	nginx -p $PWD -c nginx.conf -s reload

ngrok: nginx
	ngrok http --domain=transcendence.ngrok.app 8080

