FROM node:lts-alpine

RUN npm i -g pnpm

WORKDIR /frontend

COPY . .

RUN pnpm i

RUN pnpm build

CMD ["pnpm", "dev"]