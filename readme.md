# Cine Finder - Backend

API para gerenciar comentários e ranking/votos de filmes pelo IMDb ID.

Stack: Express + MongoDB (Mongoose).

A ideia é ter endpoints básicos para listar, criar, editar e remover comentários, mantendo um controle leve por IP (hash) e filtrando palavrões.

## Execução

- Requisitos: Node 20+ e um MongoDB (Atlas recomendado).
- Crie o arquivo `.env` com pelo menos:
  - `DB_URL` (string de conexão do MongoDB)
  - `IP_HASH_SALT` (qualquer string aleatória pra gerar o hash do IP)

Depois disso, o fluxo é:

1. Instalar deps: `npm install`
2. Buildar: `npm run build`
3. Subir: `npm start`

Endpoints principais (base `/api`):

- Comentários `/comments`
  - `GET /comments/:imdbId` – lista comentários por filme (paginação via query `page`, `pageSize`)
  - `POST /comments` – cria comentário `{ imdbId, author, rating, comment }`
  - `PUT /comments/:id` – edita seu comentário (valida IP por hash, janela de 10 minutos)
  - `DELETE /comments/:id` – remove seu comentário (mesmas regras)

- Votos e Ranking `/votes`
  - `GET /votes/me` – lista meus votos (por IP)
  - `POST /votes` – cria/atualiza voto `{ imdbId, rating }` (um voto por IP por filme)
  - `GET /votes/by-id/:id` – ver detalhe de um voto meu (id = ObjectId 24 hex)
  - `PUT /votes/by-id/:id` – editar nota de um voto meu `{ rating }`
  - `DELETE /votes/by-id/:id` – remove meu voto
  - `GET /votes/ranking` – ranking geral (média e contagem por filme)
  - `GET /votes/ranking/:imdbId` – estatísticas de um filme