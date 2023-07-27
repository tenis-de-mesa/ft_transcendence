FROM node:lts-alpine

RUN npm i -g pnpm

WORKDIR /backend

COPY . .

RUN pnpm i

CMD ["pnpm", "start:dev"]