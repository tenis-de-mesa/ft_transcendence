FROM node:18-alpine

# https://pnpm.io/installation#using-corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /backend

CMD ["pnpm", "start:dev"]