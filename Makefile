all: up 

up: .env backend/node_modules frontend/node_modules
	docker compose up

backend/node_modules:
	docker compose run backend pnpm install

frontend/node_modules:
	docker compose run frontend pnpm install

down:
	docker compose down

.env:
	cp .env.sample .env

format:
	docker compose run frontend pnpm format
	docker compose run backend pnpm format

test:
	docker compose run frontend pnpm test
	docker compose run backend pnpm test