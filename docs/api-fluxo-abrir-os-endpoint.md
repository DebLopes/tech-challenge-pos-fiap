# Abrir OS numa única chamada — `POST /service-orders/open`

Endpoint que cria a OS **numa só requisição**: recebe cliente, veículo, serviços e peças no mesmo body e devolve a OS já com as linhas vinculadas. Cliente e veículo são **reaproveitados** quando o documento/placa já existirem; caso contrário, são criados. Não substitui o `POST /service-orders` (criação por `clientId`/`vehicleId`).

**Antes:** login e contexto em [Fluxo feliz da API — índice](api-fluxo-url-body.md).

> **Pré-requisito importante:** os **serviços** e as **peças** informados no body **já precisam estar cadastrados** antes desta chamada. O endpoint **não cria** serviço de catálogo nem produto/peça — apenas os **vincula** à OS. Cliente e veículo, sim, são criados quando não existem.
>
> - `services[].catalogServiceId` deve ser o `id` de um serviço **existente** e **ativo** (`POST /services`). Serviço inexistente → `404 Catalog service not found`; serviço inativo → `400 Cannot add an inactive catalog service to an order`.
> - `parts[].productCode` deve ser o código de um produto **existente** (`POST /product`, e normalmente com lote em `POST /product-batch` para haver estoque). Produto inexistente → `404 Product "<code>" not found`.
>
> Como a criação da OS e a vinculação de serviços/peças acontecem na mesma chamada, se um `catalogServiceId` ou `productCode` não existir a requisição falha **após** o cliente/veículo já terem sido criados.

**Papéis autorizados:** `ADMIN`, `ATENDENTE` (JWT obrigatório).

## Pré-cadastro (serviço e peça)

Precisas de pelo menos um serviço de catálogo e um produto/peça cadastrados. Se ainda não tens, cria como na [Variante A](api-fluxo-variante-a-criar-pela-api.md):

### Produto/peça

**URL:** `POST http://localhost:3000/product` · **JWT**

```json
{
  "code": "OLEO01",
  "name": "Óleo 5W30",
  "description": "Peça para vincular na OS"
}
```

### Lote do produto (estoque)

**URL:** `POST http://localhost:3000/product-batch` · **JWT**

```json
{
  "name": "Lote óleo",
  "productCode": "OLEO01",
  "quantity": 100,
  "costPrice": 10,
  "salePrice": 25
}
```

### Serviço de catálogo

**URL:** `POST http://localhost:3000/services` · **JWT**

```json
{
  "name": "Troca de óleo",
  "description": "Serviço com peça padrão",
  "basePrice": 80,
  "active": true,
  "defaultParts": [{ "productCode": "OLEO01", "quantity": 1 }]
}
```

Guarda o `id` devolvido por `POST /services` — é o `catalogServiceId` usado abaixo.

## Abrir a OS

**URL:** `POST http://localhost:3000/service-orders/open` · **JWT**

```json
{
  "client": {
    "name": "João Silva",
    "document": "12345678909",
    "email": "joao@email.com"
  },
  "vehicle": {
    "plate": "NBK-6334",
    "model": "HR-V",
    "brand": "Honda",
    "year": 2024
  },
  "requestedServicesDescription": "Cliente reclama de barulho na suspensão",
  "services": [
    { "catalogServiceId": "8dab6eb7-09a2-44bc-b93e-260f67258e3c", "quantity": 1 }
  ],
  "parts": [{ "productCode": "OLEO01", "quantity": 1 }]
}
```

Substitui `catalogServiceId` pelo `id` real do teu `POST /services`. `requestedServicesDescription`, `services` e `parts` são **opcionais** — mas se enviares `services`/`parts`, os itens precisam já existir (ver pré-requisito acima).

A resposta traz a OS criada com o `id`; guarda-o como `{OS_ID}` para os passos seguintes.

**Status no banco:** a OS aberta por este endpoint é **sempre** salva como **`RECEIVED`**, com ou sem `services`/`parts` no body. Os serviços e peças são vinculados sem disparar a mudança automática de status; a transição para `IN_DIAGNOSIS` acontece só no passo de diagnóstico (`PATCH .../diagnosis`).

> Isto é específico deste fluxo. Nos endpoints avulsos (`POST /service-orders/{OS_ID}/services` e `.../parts`), adicionar a primeira linha continua movendo a OS de `RECEIVED` para `IN_DIAGNOSIS` automaticamente.

---

## Passos após criar a OS

A OS fica em `RECEIVED` após a abertura. O fluxo seguinte é o mesmo das outras variantes: `PATCH .../diagnosis` (passa para `IN_DIAGNOSIS` e regista o texto do diagnóstico; obrigatório antes do orçamento) → `POST .../budget` → público → finalizar → entregar. Consulta a secção «Passos após criar a OS» em [Variante A](api-fluxo-variante-a-criar-pela-api.md#passos-após-criar-a-os), usando o `{OS_ID}` devolvido aqui, o documento `12345678909` e a placa `NBK-6334`.

> Como os serviços e peças já foram vinculados na abertura, normalmente não precisas repetir `POST .../services` e `POST .../parts` — segue direto para `PATCH .../diagnosis` e depois `POST .../budget`.

---

## Ver também

- Teste de referência: `test/integration/ordem-de-servico/open-service-order.integration-spec.ts`.
- Índice do fluxo feliz: [api-fluxo-url-body.md](api-fluxo-url-body.md).
