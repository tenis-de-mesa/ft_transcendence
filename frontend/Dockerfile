FROM node:lts-alpine

RUN npm i -g pnpm

WORKDIR /app

COPY . .

RUN pnpm i

RUN pnpm build

CMD ["pnpm", "dev"]