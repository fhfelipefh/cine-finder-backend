# Cine Finder - Backend

API para gerenciar filmes, comentarios, votos e favoritos utilizando Express + MongoDB (Mongoose).
Agora todo usuario autenticado possui CRUD completo sobre o proprio perfil, enquanto ações destrutivas globais permanecem restritas aos administradores.

## Principais recursos

- **Autenticacao e autorizacao** com JWT: registro, login, atualizacao de perfil, troca de senha e delecao da propria conta. 
O primeiro usuario registrado vira `admin` automaticamente e os demais sao `user`.
- **Dominio normalizado**:
  - `users`: credenciais, papel (admin/user).
  - `movies`: catalogo.
  - `comments` e `votes`: relacionamentos User <-> Movie, garantindo historico e ranking.
  - `favorites`: lista pessoal de filmes marcados por cada usuario.
- **Politicas de seguranca**:
  - Todas as rotas (exceto `/auth`) exigem `Authorization: Bearer <token>`.
  - Administradores seguem exclusivos para remover filmes/votos globais, mas comentarios podem ser apagados pelo autor ou por um admin.
  - Usuarios so manipulam dados pessoais (perfil, senha, favoritos) e seus proprios comentarios/votos.
- **Ferramentas administrativas**:
  - Listagem paginada dos comentarios mais recentes para moderacao rapida.
  - Exclusao de usuarios (com limpeza de comentarios/votos/favoritos) diretamente pela API.
  - Atualizacao da lista *Top da Comunidade*, mantendo um destaque curado de filmes.

## Configuracao

### Requisitos
- Node.js 20+
- MongoDB

### Variaveis de ambiente
Crie um `.env` baseado em `.env.example`:

```
DB_URL=mongodb://localhost:27017/cine-finder
PORT=3000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=change-me
JWT_EXPIRES_IN=2h
BCRYPT_SALT_ROUNDS=10
```

### Scripts
```bash
npm install        # instala dependencias
npm run dev        # executar em modo desenvolvimento
npm run build      # Compilar
npm start          # executa codigo compilado
```

## Endpoints

### Autenticacao (`/auth`)
- `POST /register` -> `{ name, email, password }`
- `POST /login` -> `{ email, password }`

Resposta: `{ user, token }`

### Usuario (`/users`)
- `GET /me`
- `PUT /me` -> `{ name?, email? }`
- `PUT /me/password` -> `{ currentPassword, newPassword }`
- `DELETE /me` -> remove completamente a conta e apaga comentarios, votos e favoritos associados
- `DELETE /:id` *(apenas admin)* -> remove qualquer usuario e limpa seus comentarios/votos/favoritos

### Filmes (`/movies`)
- `GET /` -> suporta `page`, `pageSize`
- `POST /` -> `{ imdbId, title, posterUrl?, year?, synopsis? }`
- `GET /imdb/:imdbId`
- `PUT /:id`
- `DELETE /:id` *(apenas admin)*

### Comentarios (`/comments`)
- `GET /admin/recent` *(apenas admin)* -> `page`, `pageSize`
- `GET /:imdbId` -> `page`, `pageSize`
- `POST /` -> `{ imdbId, rating, comment }`
- `PUT /:id` -> `{ rating?, comment? }` (autor ou admin)
- `DELETE /:id` -> autor do comentario ou admin

### Votos (`/votes`)
- `GET /me`
- `POST /` -> `{ imdbId, rating }` (um voto por usuario/filme)
- `GET /by-id/:id`
- `PUT /by-id/:id` -> `{ rating }`
- `DELETE /by-id/:id` *(apenas admin)*
- `GET /ranking`
- `GET /ranking/:imdbId`

### Favoritos (`/favorites`)
- `GET /` -> lista os favoritos do usuario autenticado (`page`, `pageSize`)
- `POST /` -> `{ imdbId, notes? }` para marcar um filme como favorito
- `PUT /:imdbId` -> `{ notes? }` atualiza a anotacao do favorito
- `DELETE /:imdbId` -> desmarca o filme como favorito

### Top da Comunidade (`/community-top`)
- `GET /` -> retorna a lista atual de destaques da comunidade; administradores recebem tambem `votes` por filme com o nome/email/role de cada usuario e a nota atribuida
- `PUT /` *(apenas admin)* -> `{ items: [{ imdbId, notes? }] }` substitui toda a lista apos validar/garantir os filmes referenciados

Todas as rotas acima (exceto `/auth`) exigem enviar o JWT no header `Authorization: Bearer <token>`.
