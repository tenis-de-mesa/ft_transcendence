all: up

up: format
	docker compose up --build

down:
	docker compose down

format:
	cd backend && pnpm format
	cd frontend && pnpm format