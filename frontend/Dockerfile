FROM node:lts-alpine

RUN npm i -g pnpm

WORKDIR /frontend

COPY . .

RUN pnpm i

CMD ["pnpm", "dev"]