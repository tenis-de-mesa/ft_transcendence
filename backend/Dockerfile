FROM node:18-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN apk add --no-cache python3 make g++

WORKDIR /backend

CMD ["pnpm", "start:dev"]