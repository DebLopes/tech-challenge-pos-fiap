# =========================
# Development
# =========================
FROM node:22.17.1-bookworm AS development

WORKDIR /app

ENV NODE_ENV=development

RUN corepack enable

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["yarn", "start:dev"]


# =========================
# Build
# =========================
FROM node:22.17.1-bookworm AS build

WORKDIR /usr/src/app

RUN corepack enable

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

RUN find . -type f -name '*.json' \
  -exec mkdir -p dist/"$(dirname {})" \; \
  -exec cp {} dist/"{}" \;


# =========================
# Production
# =========================
FROM node:22.17.1-alpine3.22 AS production

WORKDIR /usr/src/app

RUN corepack enable

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production

COPY --chown=node:node --from=build /usr/src/app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]