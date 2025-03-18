# StockProject

# StockProject API

API para gestão de lojas, estoque, produtos, usuários e auditoria.  
**Documentação Oficial** · [Repositório](https://github.com/DenisEdSilva/StockProject)

---

## Índice
- [🛠 Tecnologias](#tecnologias)
- [🌟 Funcionalidades Principais](#funcionalidades-principais)
- [📦 Instalação](#instalação)
- [🔧 Variáveis de Ambiente](#variaveis-de-ambiente)
- [🔑 Autenticação](#autenticacao)
- [📚 Documentação das Rotas](#documentacao-das-rotas)
  - [Usuários](#usuarios)
  - [Lojas](#lojas)
  - [Roles](#roles)
  - [StoreUsers (Funcionários)](#funcionarios-storeusers)
  - [Categorias](#categorias)
  - [Produtos](#produtos)
  - [Estoque](#estoque)
  - [Auditoria](#auditoria)
- [🚨 Tratamento de Erros](#tratamento-de-erros)

---

## 🛠 Tecnologias
- **Node.js** & **Express**  
- **Prisma** (PostgreSQL)  
- **JWT** (Autenticação)  
- **Redis** (Cache de sessões)  
- **Bcrypt** (Criptografia de senhas)

---

## 🌟 Funcionalidades Principais
- Gestão de múltiplas lojas com donos (owners) e funcionários (storeUsers).  
- Controle de permissões baseado em roles.  
- Auditoria detalhada de todas as ações críticas.  
- Soft delete e recuperação de recursos.  
- Movimentações de estoque com reversão.  

---

## 📦 Instalação
```bash
# Clone o repositório
git clone https://github.com/DenisEdSilva/StockProject.git

# Instale as dependências
npm install

# Execute as migrações e seeds do Prisma (cria estrutura + permissões padrão)
npx prisma migrate dev
npx prisma db seed

# Inicie o servidor
npm run dev

```
---

## 🔧 Variáveis de Ambiente
```bash
Crie um arquivo .env na raiz do projeto:
DATABASE_URL="postgresql://postgres:admin@localhost:5432/StockProject?schema=public"

#secret JWT hash generation
JWT_SECRET = 076ee6c3d7dd190d9a45bad13d036c5a

#tempo para deleção dos dados
SOFT_DELETE_RETENTION_MINUTES = 30

#tempo para marcar como inativo
INACTIVITY_THRESHOLD_MINUTES = 30

#tempo para a deleção de usuario
USER_DELETION_PERIOD = 30

#periodo de graça para a deleção de usuario
DELETION_GRACE_PERIOD = 30

```

## 🔑 Autenticação
- **Header**: Authorization: Bearer <JWT_TOKEN>
- **Middleware**: authorized para permissões

## 📚 Documentação das Rotas
## Usuários

| Método	|   Endpoint  | Descrição                         |   Permissão   |
|---------|-------------|-----------------------------------|---------------|
| POST	  | /stores	    | Cria loja                         |    Nenhuma    |
| POST    | /sessions   | Autentica um usuário              |    Nenhuma    |
| GET     | /me         | Retorna os dados do usuario Owner |    GET:USER   |
| PUT     | /me/:userId | Atualiza usuário                  |    PUT:USER   |
| DELETE  | /me/:userId | Soft delete do usuario            |  DELETE:USER  |

## Lojas

|  Método 	| Endpoint | Descrição | Permissão |
|-----------|----------|-----------|-----------|
|   POST	  | /stores	 | Cria loja | POST:STORE |
|    GET    | /stores | Lista as lojas do owner | GET:STORE |
|    PUT    | /stores/:storeId | Atualiza a loja | PUT:STORE |
|  DELETE   | /stores/:storeId | Soft delete da loja | DELETE:STORE |
|    PUT    | /stores/:storeId/revert | Reverte a deleção da loja | PUT:STORE_DELETE |

## Roles

|  Método 	| Endpoint | Descrição | Permissão |
|-----------|----------|-----------|-----------|
| POST	  | /stores/storeId/roles	 | Cria uma role |
| GET | /stores/:storeId/roles | Lista das roles | GET:ROLE |
| PUT | /stores/:storeId/roles/:roleId | Atualiza a role | PUT:ROLE |
| DELETE | /stores/:storeId/roles/:roleId | Delete a role | DELETE:ROLE |

## StoreUsers(funcionários)

|  Método 	| Endpoint | Descrição | Permissão |
|-----------|----------|-----------|-----------|
| POST	  | /stores/:storeId/users | Cria funcionário | POST:STORE_USER |
| POST | /stores/:storeId/sessions | Autentica funcionário | Nenhuma |
| GET | /stores/:storeId/users | Lista funcionários | GET:STORE_USER |
| PUT | /stores/:storeId/users/:storeUserId | Atualiza funcionário | PUT:STORE_USER |
| DELETE | /stores/:storeId/users/:storeUserId | Exclui funcionário	| DELETE:STORE_USER |

## Categorias

|  Método 	| Endpoint | Descrição | Permissão |
|-----------|----------|-----------|-----------|
| POST	  | /stores/:storeId/categories	 | Cria categoria | POST:CATEGORY |
| GET | /stores/:storeId/categories | Lista categorias | GET:CATEGORY |
| PUT | /stores/:storeId/categories/:categoryId	| Atualiza categoria | PUT:CATEGORY |
| DELETE | /stores/:storeId/categories/:categoryId | Exclui categoria	| DELETE:CATEGORY |

## Produtos

|  Método 	| Endpoint | Descrição | Permissão |
|-----------|----------|-----------|-----------|
| POST	  | /stores/:storeId/categories/:categoryId/products	 | Cria produto | PUT:PRODUCT |
| GET | /stores/:storeId/categories/:categoryId/products | Lista produtos	| GET:PRODUCT |
| PUT | /stores/:storeId/categories/:categoryId/products/:productId	| Atualiza produto | PUT:PRODUCT |
| DELETE | /stores/:storeId/categories/:categoryId/products/:productId | DELETE:PRODUCT |

## Estoque

|  Método 	| Endpoint | Descrição | Permissão |
|-----------|----------|-----------|-----------|
| POST | /stores/:storeId/products/:productId/stocks/movements | Cria movimentação | POST:STOCK |
|GET | /stores/:storeId/products/:productId/stocks/movements | Lista movimentações | GET:STOCK |
| POST | /stores/:storeId/products/:productId/stocks/movements/:movementId/revert | Reverte movimentação | POST:STOCK |

## Auditoria

|  Método 	| Endpoint | Descrição | Permissão |
|-----------|----------|-----------|-----------|
| GET |	/audit-logs | Lista logs de auditoria | GET:AUDIT_LOG |

## 🚨 Tratamento de Erros
```bash
{
  "error": "Tipo do erro",
  "message": "Descrição detalhada"
}
```