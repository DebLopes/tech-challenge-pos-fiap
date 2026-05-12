# Tech Challenge Pós FIAP — Oficina

API de oficina mecânica: ordens de serviço, clientes, veículos, catálogo, produtos, estoque e rotas públicas para orçamento/status. **NestJS**, **TypeScript**, **MongoDB**, **JWT** e **Swagger** em **`/api`**.

---

## Como rodar o projeto com Docker Compose

### Requisitos

- **Docker** — criar e gerir contêineres.
- **Docker Compose** — subir API e Mongo juntos.
- **Node.js** (recomendado via [nvm](https://github.com/nvm-sh/nvm), versão em [.nvmrc](.nvmrc)) e **Yarn** — para instalar dependências e correr **`yarn migrate:up`** na tua máquina (as migrations ligam ao Mongo em `localhost:27017`).

### Execução

1. **Clonar** o repositório na tua máquina:

   SSH:

   ```bash
   git clone git@github.com:SEU_USUARIO/tech-challenge-pos-fiap.git
   ```

   HTTPS:

   ```bash
   git clone https://github.com/SEU_USUARIO/tech-challenge-pos-fiap.git
   ```

2. **Entrar na pasta** do projeto:

   ```bash
   cd tech-challenge-pos-fiap
   ```

3. **Ativar a versão de Node** do projeto (se usares nvm):

   ```bash
   nvm use
   ```

   Se a versão ainda não existir: `nvm install` e depois `nvm use`.

4. **Instalar dependências:**

   ```bash
   yarn install
   ```

5. **Criar o ficheiro de ambiente** a partir do exemplo:

   ```bash
   cp .env.example .env
   ```

   O `.env` deve ter `MONGO_URL` apontando para o Mongo no host (ex.: `mongodb://localhost:27017/techChallenge`), para a API no host e para as migrations — ver comentários em [.env.example](.env.example).

6. **Subir os serviços** (API + Mongo em segundo plano, com rebuild se necessário):

   ```bash
   docker compose up -d --build
   ```

   Em ambientes mais antigos, o equivalente pode ser: `docker-compose up -d --build`.

7. **Aplicar migrations** (dados iniciais na base), **na máquina**, com o mesmo `MONGO_URL` do `.env`:

   ```bash
   yarn migrate:up
   ```

**Depois de subir**

- API: **http://localhost:3000**
- **Documentação interativa (Swagger):** **http://localhost:3000/api**
- Utilizador seed (login): `admin@local.dev` / `admin123`

---

## Execução local sem Docker (API na máquina)

1. Segue os passos **1 a 5** da secção anterior (clone, `cd`, `nvm use`, `yarn install`, `cp .env.example .env`).
2. Garante **Node** (via nvm ou instalador oficial) e **Yarn**.
3. **MongoDB** acessível na porta **27017**, por exemplo só o Mongo com Docker:

   ```bash
   docker compose up -d mongo
   ```

   ou:

   ```bash
   docker run -d --name mongo-dev -p 27017:27017 mongo:7
   ```

4. **Migrations** e **arranque em modo desenvolvimento:**

   ```bash
   yarn migrate:up
   yarn start:dev
   ```

5. Abre o Swagger: **http://localhost:3000/api**

---

## Documentação das APIs

A referência completa dos endpoints, corpos de pedido e respostas está no **Swagger/OpenAPI** em:

**http://localhost:3000/api**

Lá podes testar rotas com JWT (botão *Authorize*, token do `POST /auth/login`) e as rotas públicas sob **`/public/...`**.

### Tecnologias utilizadas

- Node.js, TypeScript  
- NestJS, Mongoose, Passport/JWT  
- MongoDB  
- Docker e Docker Compose  
- migrate-mongo (migrations)

### Visão geral dos recursos (detalhe no Swagger)

| Área | Exemplos (prefixos reais no Swagger) |
|------|----------------------------------------|
| Autenticação | `POST /auth/login`, `POST /auth/users` |
| Clientes, veículos | `/clients`, `/vehicle` |
| Produtos e estoque | `/product`, `/product-batch` |
| Catálogo e OS | `/services`, `/service-orders` |
| Público (cliente) | `GET /public/service-orders/...`, aprovar/rejeitar orçamento |

---

## Testes, lint e produção

| Comando | Descrição |
|---------|-----------|
| `yarn test` | Testes unitários (com cobertura) |
| `yarn lint` | ESLint |
| `yarn format` | Prettier |
| `yarn build` | Build para produção |
| `yarn start:prod` | Correr o build |

Roteiro manual de testes: [docs/testes-passo-a-passo.md](docs/testes-passo-a-passo.md). Fluxo feliz só com **URL e body:** [docs/api-fluxo-url-body.md](docs/api-fluxo-url-body.md) (índice e login), [docs/api-fluxo-variante-a-criar-pela-api.md](docs/api-fluxo-variante-a-criar-pela-api.md) (criar dados pela API) e [docs/api-fluxo-variante-b-migration-fixtures.md](docs/api-fluxo-variante-b-migration-fixtures.md) (fixtures `yarn migrate:up`).

**Licença:** UNLICENSED (projeto acadêmico).
