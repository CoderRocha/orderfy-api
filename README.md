# Orderfy API

Orderfy é uma simples API RESTful para gerenciamento de pedidos, desenvolvida em Node.js com Express e PostgreSQL.

## Stack

- JavaScript
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/products/docker-desktop/)
- [JWT](https://jwt.io/)

## Instalação e Requisitos

É necessário ter as seguintes ferramentas instaladas:

- [Node.js](https://nodejs.org/)
- [Postman](https://www.postman.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

Depois de instalar as ferramentas, execute os seguintes comandos:

```bash
# Instalar dependências
npm install

# Buildar a imagem Docker e o banco de dados PostgreSQL (Precisa do Docker Desktop)
docker compose up -d

# Iniciar o servidor em modo desenvolvimento
npm run dev
```

Após isso, o servidor estará disponível em `http://localhost:3000`.

---

## Endpoints

Abaixo é possível ver todos os endpoints disponíveis na API.

Para poder testar sem copiar os curls manualmente, siga o passo a passo a seguir:

O repositório inclui uma collection do Postman pronta para uso. Baixe o arquivo (`orderfy-api.postman_collection.json`) e importe-o no Postman.

Para importar o arquivo:

1. Abra o Postman
2. Clique em **Import**
3. Selecione o arquivo `orderfy-api.postman_collection.json`
4. Acesse a collection importada, escolha o endpoint desejado e clique em **Send**

Com isso, você pode testar os endpoints diretamente no Postman de maneira simplificada.

## Autenticação

A API utiliza uma autenticação via **JWT (JSON Web Token)**. Todos os endpoints de pedidos exigem um token válido no header `Authorization` para evitar acesso não autorizado.

Para autenticar, siga o passo a passo a seguir:

1. Registre um usuário em `POST /auth/register`
2. Faça login em `POST /auth/login`

Ao usar a collection do Postman, o token é salvo automaticamente na variável `{{token}}` após o login e enviado em todas as requisições de pedidos sem nenhuma configuração adicional.

Caso esteja testando via curl, envie o token manualmente no header:

```
Authorization: Bearer <token>
```

OBS: O token tem uma validade de **24 horas**.

### POST /auth/register
Registrar usuário.

**Request body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**curl:**
```bash
curl --location 'http://localhost:3000/auth/register' \
--request POST \
--header 'Content-Type: application/json' \
--data '{
  "username": "admin",
  "password": "admin123"
}'
```

**Response `201 Created`:**
```json
{
  "id": 1,
  "username": "admin"
}
```

---

### POST /auth/login
Login.

**Request body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**curl:**
```bash
curl --location 'http://localhost:3000/auth/login' \
--request POST \
--header 'Content-Type: application/json' \
--data '{
  "username": "admin",
  "password": "admin123"
}'
```

**Response `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST /order
Criar pedido.

**Request body:**
```json
{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}
```

**curl:**
```bash
curl --location 'http://localhost:3000/order' \
--request POST \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <token>' \
--data '{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}'
```

**Response `201 Created`:**
```json
{
  "orderId": "v10089015vdb-01",
  "value": "10000.00",
  "creationDate": "2023-07-19T12:24:11.530Z",
  "items": [
    {
      "id": 1,
      "orderId": "v10089015vdb-01",
      "productId": 2434,
      "quantity": 1,
      "price": "1000.00"
    }
  ]
}
```

---

### GET /order/:orderId
Buscar pedido por ID.

**curl:**
```bash
curl --location 'http://localhost:3000/order/v10089015vdb-01' \
--request GET \
--header 'Authorization: Bearer <token>'
```

**Response `200 OK`:**
```json
{
  "orderId": "v10089015vdb-01",
  "value": "10000.00",
  "creationDate": "2023-07-19T12:24:11.530Z",
  "items": [
    {
      "id": 1,
      "orderId": "v10089015vdb-01",
      "productId": 2434,
      "quantity": 1,
      "price": "1000.00"
    }
  ]
}
```

---

### GET /order/list
Listar todos os pedidos.

**curl:**
```bash
curl --location 'http://localhost:3000/order/list' \
--request GET \
--header 'Authorization: Bearer <token>'
```

**Response `200 OK`:**
```json
[
  {
    "orderId": "v10089015vdb-01",
    "value": "10000.00",
    "creationDate": "2023-07-19T12:24:11.530Z",
    "items": [
      {
        "id": 1,
        "orderId": "v10089015vdb-01",
        "productId": 2434,
        "quantity": 1,
        "price": "1000.00"
      }
    ]
  }
]
```

---

### PUT /order/:orderId
Atualizar pedido.

**curl:**
```bash
curl --location 'http://localhost:3000/order/v10089015vdb-01' \
--request PUT \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <token>' \
--data '{
  "valorTotal": 20000,
  "dataCriacao": "2023-07-20T09:00:00.000+00:00",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 2,
      "valorItem": 10000
    }
  ]
}'
```

**Response `200 OK`:**
```json
{
  "orderId": "v10089015vdb-01",
  "value": "20000.00",
  "creationDate": "2023-07-20T09:00:00.000Z",
  "items": [
    {
      "id": 2,
      "orderId": "v10089015vdb-01",
      "productId": 2434,
      "quantity": 2,
      "price": "10000.00"
    }
  ]
}
```

---

### DELETE /order/:orderId
Deletar pedido.

**curl:**
```bash
curl --location 'http://localhost:3000/order/v10089015vdb-01' \
--request DELETE \
--header 'Authorization: Bearer <token>'
```

**Response `200 OK`:**
```json
{
  "message": "Order 'v10089015vdb-01' deleted successfully."
}
```

---

## Respostas de erro

| Status | Descrição |
|--------|-----------|
| `400 Bad Request` | Campos obrigatórios ausentes ou incorretos |
| `401 Unauthorized` | Token ausente ou incorreto |
| `404 Not Found` | Pedido não encontrado |
| `409 Conflict` | Já existe um pedido ou usuário com esse ID |
| `500 Internal Server Error` | Erro interno no servidor |

**Exemplo `401`:**
```json
{
  "error": "Access denied. No token provided."
}
```

**Exemplo `404`:**
```json
{
  "error": "Order 'v10089015vdb-01' not found."
}
```

---

## Estrutura do projeto

```
orderfy-api/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js    # Handlers de registro e login
│   │   └── order.controller.js   # Handlers e mapping dos campos
│   ├── database/
│   │   └── migrations.js         # Criação das tabelas no banco
│   ├── middleware/
│   │   └── auth.middleware.js    # Validação do token JWT
│   ├── models/
│   │   ├── user.model.js         # Queries SQL de usuários
│   │   └── order.model.js        # Queries SQL de pedidos
│   ├── routes/
│   │   ├── auth.routes.js        # Rotas de autenticação
│   │   └── order.routes.js       # Rotas de pedidos
│   └── db.js                     # Pool de conexão com o PostgreSQL
├── .env                          # Variáveis de ambiente
├── docker-compose.yml            # Imagem Docker do Projeto e do PostgreSQL
└── index.js                      # Arquivo principal da aplicação
```

## Mapping dos campos

A API recebe os dados e faz o mapping necessário para salvar as informações no banco de dados, como no exemplo a baixo:

| Recebido | Salvo no banco |
|----------|----------------|
| `numeroPedido` | `orderId` |
| `valorTotal` | `value` |
| `dataCriacao` | `creationDate` |
| `idItem` | `productId` |
| `quantidadeItem` | `quantity` |
| `valorItem` | `price` |

## Autor

- [Guilherme Rocha](https://github.com/coderrocha)
