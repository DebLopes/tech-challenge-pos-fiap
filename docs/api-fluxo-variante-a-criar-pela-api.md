# Variante A — Criar tudo pela API

Objetivo: mesmo tipo de cenário que o teste `test/integration/ordem-de-servico/service-order-flow.integration-spec.ts`, com dados que **não chocam** com as fixtures da migration (`52998224725`, `APL-1234`, `DEMO-*`).

**Antes:** login e contexto em [Fluxo feliz da API — índice](api-fluxo-url-body.md).

| Campo | Valor de exemplo |
|-------|------------------|
| Documento (`document`) | `11144477735` |
| Placa (`plate`) | `RKM4J91` |
| Produtos | `FLUX-A-01`, `FLUX-A-02` |
| `catalogServiceId` (após criar serviço) | usa o `id` da resposta do POST em `/services` *(exemplo ilustrativo:* `8dab6eb7-09a2-44bc-b93e-260f67258e3c`*) |
| `clientId` / `vehicleId` | usa os `id` das respostas dos POST em `/clients` e `/vehicle` *(exemplos ilustrativos nos bodies abaixo)* |

## Produto principal

**URL:** `POST http://localhost:3000/product` · **JWT**

```json
{
  "code": "FLUX-A-01",
  "name": "Peça integração",
  "description": "Para FIFO na OS"
}
```

## Lote do produto principal

**URL:** `POST http://localhost:3000/product-batch` · **JWT**

```json
{
  "name": "Lote integração",
  "productCode": "FLUX-A-01",
  "quantity": 100,
  "costPrice": 10,
  "salePrice": 25
}
```

## Produto extra

**URL:** `POST http://localhost:3000/product` · **JWT**

```json
{
  "code": "FLUX-A-02",
  "name": "Peça avulsa integração"
}
```

## Lote do produto extra

**URL:** `POST http://localhost:3000/product-batch` · **JWT**

```json
{
  "name": "Lote peça avulsa",
  "productCode": "FLUX-A-02",
  "quantity": 50,
  "costPrice": 5,
  "salePrice": 12
}
```

## Serviço de catálogo

**URL:** `POST http://localhost:3000/services` · **JWT**

```json
{
  "name": "Serviço integração OS",
  "description": "Com uma peça padrão",
  "basePrice": 80,
  "active": true,
  "defaultParts": [{ "productCode": "FLUX-A-01", "quantity": 1 }]
}
```

## Cliente

**URL:** `POST http://localhost:3000/clients` · **JWT**

```json
{
  "name": "Cliente integração",
  "document": "11144477735",
  "email": "fluxo-doc-a@test.dev"
}
```

## Veículo

**URL:** `POST http://localhost:3000/vehicle` · **JWT**

```json
{
  "plate": "RKM4J91",
  "model": "HR-V",
  "brand": "Honda",
  "year": 2024
}
```

## Ordem de serviço

**URL:** `POST http://localhost:3000/service-orders` · **JWT**

```json
{
  "clientId": "87042d7c-6942-4a9e-ba88-2615f5923265",
  "vehicleId": "979614bc-5331-433b-b400-c5663db9055f",
  "requestedServicesDescription": "Revisão integração"
}
```

Substitui `clientId` e `vehicleId` pelos `id` reais das respostas anteriores. Guarda o `id` desta OS como `{OS_ID}`.

---

## Passos após criar a OS

**`{OS_ID}`:** `id` devolvido pelo `POST /service-orders` acima. Usa nas URLs desta secção.

**Ordem:** `PATCH .../diagnosis` (estado `IN_DIAGNOSIS`) → linhas na OS (`/services`, `/parts`) → resto do fluxo.

**Valores desta variante:** documento `11144477735`, placa `RKM4J91`, `catalogServiceId` = `id` do teu `POST /services` *(troca o exemplo abaixo)*, peça avulsa `FLUX-A-02`.

### Diagnóstico

**Inicia o diagnóstico:** a OS passa para **`IN_DIAGNOSIS`**. No fluxo deste guia, faz este passo **antes** de `POST .../services` e `POST .../parts` (mudança de status antes de acrescentar peças e serviços). Gerar orçamento exige diagnóstico já registado.

**URL:** `PATCH http://localhost:3000/service-orders/{OS_ID}/diagnosis` · **JWT**

```json
{
  "diagnosis": "Diagnóstico iniciado."
}
```

### Serviço do catálogo na OS

**URL:** `POST http://localhost:3000/service-orders/{OS_ID}/services` · **JWT**

```json
{
  "catalogServiceId": "8dab6eb7-09a2-44bc-b93e-260f67258e3c",
  "quantity": 1
}
```

*(Substitui `catalogServiceId` pelo `id` real do serviço criado em `/services`.)*

### Peça avulsa na OS

**URL:** `POST http://localhost:3000/service-orders/{OS_ID}/parts` · **JWT**

```json
{
  "productCode": "FLUX-A-02",
  "quantity": 2
}
```

### Gerar orçamento

**Fecha o valor:** calcula totais (FIFO nas peças) e coloca a OS **à espera de aprovação**.

Na **primeira vez** nesse estado há **notificação simulada** (sem e-mail real): registo no **log** com prefixo `[orçamento enviado]` e JSON.

- API local (`yarn start:dev`): **terminal** do processo.
- Docker (`docker-compose`): **`docker compose logs -f api`**.

Repetir `POST /budget` no mesmo estado costuma **não** voltar a imprimir esse envio.

**URL:** `POST http://localhost:3000/service-orders/{OS_ID}/budget` · **JWT** · sem body.

### Consulta pública do orçamento

**URL:** `GET http://localhost:3000/public/service-orders/{OS_ID}/budget?document=11144477735&plate=RKM4J91`

Sem JWT · sem body.

### Aprovação pública do orçamento

**URL:** `POST http://localhost:3000/public/service-orders/{OS_ID}/approve-budget?document=11144477735&plate=RKM4J91`

Sem JWT · sem body.

### Finalizar execução

**URL:** `POST http://localhost:3000/service-orders/{OS_ID}/finish` · **JWT** · sem body.

### Status público (antes da entrega)

**URL:** `GET http://localhost:3000/public/service-orders/status?document=11144477735`

Sem JWT · sem body.

### Métrica — tempo médio de execução

**URL:** `GET http://localhost:3000/service-orders/metrics/average-execution-time` · **JWT** · sem body.

### Entregar veículo

**URL:** `POST http://localhost:3000/service-orders/{OS_ID}/deliver` · **JWT** · sem body.

### Detalhe da OS

**URL:** `GET http://localhost:3000/service-orders/{OS_ID}` · **JWT** · sem body.

### Status público (após entrega)

**URL:** `GET http://localhost:3000/public/service-orders/status?document=11144477735`

Após `DELIVERED`, esta OS deixa de aparecer na lista.
