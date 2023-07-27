FROM node:lts-alpine

RUN npm i -g pnpm

WORKDIR /app

COPY . .

RUN pnpm i

CMD ["pnpm", "start"]