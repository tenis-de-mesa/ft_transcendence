all: up

up:
	docker compose up --build

down:
	docker compose down

format:
	docker compose run frontend pnpm format
	docker compose run backend pnpm format