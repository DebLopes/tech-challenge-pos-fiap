# Fluxo feliz da API — URL e body

Duas formas de chegar à mesma sequência (**registar diagnóstico** com `PATCH .../diagnosis`, passando a OS para `IN_DIAGNOSIS` → **só depois** linhas de serviço e peças → orçamento → público → finalizar → entregar). Cada guia de variante inclui **os passos após criar a OS** (o mesmo fluxo, com valores já escolhidos para A ou B).

| Variante | Documento | Quando usar |
|----------|-----------|---------------|
| **[A — Criar tudo pela API](api-fluxo-variante-a-criar-pela-api.md)** | Guia próprio | Banco sem fixtures ou queres dados que **não colidem** com a migration (CPF, placa e códigos de produto próprios). |
| **[B — Usar migration](api-fluxo-variante-b-migration-fixtures.md)** | Guia próprio | Depois de `yarn migrate:up`; reaproveita cliente, veículo, produtos `DEMO-*` e serviços com IDs fixos. |

**Base:** `http://localhost:3000`

**JWT:** obtém com `POST /auth/login`; nos passos protegidos usa `Authorization: Bearer <access_token>` e `Content-Type: application/json` quando há body.

**`{OS_ID}`:** em cada guia é o `id` devolvido pelo **`POST /service-orders`** dessa variante. Substitui `{OS_ID}` nas URLs da secção «Passos após criar a OS» do mesmo ficheiro.

---

## Login

**Autenticação na API.** Devolve o JWT (`access_token`).

**URL:** `POST http://localhost:3000/auth/login`

**Autenticação:** não

**Body:**

```json
{
  "email": "admin@local.dev",
  "password": "admin123"
}
```

*(Credenciais padrão do seed — [.env.example](../.env.example).)*

---

## Ver também

- Teste de referência (fluxo completo): `test/integration/ordem-de-servico/service-order-flow.integration-spec.ts`.
- Migrations demo (Variante B): [fixtures](../migrations/20250504130000-demo-fixtures.js) e [catálogo demo](../migrations/20250504140000-demo-catalog-services.js).
