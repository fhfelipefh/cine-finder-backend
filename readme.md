# Cine Finder - Backend

API para gerenciar comentários de filmes pelo IMDb ID.

Usei Express, Prisma (PostgreSQL).

A ideia é ter endpoints básicos para listar, criar, editar e remover comentários, mantendo um controle leve por IP (hash) e filtrando palavrões.

## Execução

- Requisitos: Node 20+ e um banco Postgres.
- Crie o arquivo `.env` com pelo menos:
  - `DATABASE_URL` (string de conexão do Postgres)
  - `IP_HASH_SALT` (qualquer string aleatória pra gerar o hash do IP)

Depois disso, o fluxo é:

1. Instalar deps: `npm install`
2. Rodar migrações e gerar o Prisma Client (dev): `npx prisma migrate dev`
3. Buildar: `npm run build`
4. Subir: `npm start`

Na rota base `/api` tem os endpoints de comentários (`/comments`). Ex.: `GET /api/comments/tt1234567` para listar por IMDb ID.

TODO: Rankings de filmes, usuário pode votar em filmes e a lista é compartilhada com outros usuários que também podem votar.