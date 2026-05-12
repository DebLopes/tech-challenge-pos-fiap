# Imagem para desenvolvimento (docker compose): deps completas + Nest CLI em /app
FROM node:22-bookworm AS development
WORKDIR /app
ENV NODE_ENV=development
RUN corepack enable
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
EXPOSE 3000
CMD ["yarn", "start:dev"]

FROM node:latest AS build

WORKDIR /usr/src/app

COPY package.json ./
COPY tsconfig.json ./
RUN npm install
COPY . .
RUN npm run build

RUN find . -type f -name '*.json' -exec mkdir -p dist/"$(dirname {})" \; -exec cp {} dist/"{}" \;

FROM node:alpine

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package.json ./
COPY --from=build /usr/src/app/dist ./dist
RUN npm install --only=production

RUN echo "starting the app"

EXPOSE 3000

CMD ["node", "dist/main.js"]