# express-social-network-api

A small social network backend built with Node.js, Express and Sequelize: users,
posts, stories, comments and tags behind a JWT protected REST API, with a
separate authentication service and a plain HTML client to exercise it.

Register a user, get a token, then create posts, tag them, like them, comment on
them, or publish a story. Ownership and admin rights are enforced per route, and
every request body is validated before it reaches the database.

> Built as a university project for a scripting languages course.

## Features

| Feature | What it does |
| :--- | :--- |
| **Users** | Registration and login with bcrypt hashed passwords; profile bio, list, update and delete. |
| **Posts** | Create posts with an image and caption, list them globally or per user, like and unlike (one like per user). |
| **Stories** | Short lived text entries owned by a user, with full CRUD. |
| **Comments** | Comment on a post, list comments per post, edit or remove your own. |
| **Tags** | Many-to-many tagging of posts through a join table, plus lookup of all posts under a tag. |
| **Authorization** | Write routes require a bearer token that expires after an hour; a shared middleware loads the target row and lets only its owner or an admin through. |
| **Validation** | Every route validates its params and body with Joi before touching the database. |

Read routes (`GET`) are public; everything that writes requires a valid token.

## Architecture

The project runs as **two Express processes**:

| Process | Port | Responsibility |
| :--- | :--- | :--- |
| `app_auth.js` | 9000 | Authentication only: register, login, JWT issuing. |
| `app.js` | 8000 | The REST API under `/api`, plus the static HTML client. |

Splitting them keeps password handling and token signing out of the resource
API, which only ever verifies tokens it is handed.

The client calls `/api` relatively, so the REST API is always same origin and
needs no CORS. The auth service is on a different port, so it does: it accepts
the origins listed in `CLIENT_ORIGINS`.

## Tech stack

* **Node.js** and **Express 4** for both services
* **Sequelize 6** with **MySQL** (`mysql2` driver), models and migrations generated with `sequelize-cli`
* **jsonwebtoken** for stateless auth, **bcrypt** for password hashing
* **Joi** for request validation
* **dotenv** for secrets, **cors** so the client can reach the auth service on its own port
* Vanilla **HTML + Bootstrap 5.3 + fetch** for the demo client, no frontend framework and no build step

## Data model

```
User ──< Post ──< Comment
 │        ├──< Post_Tag >── Tag
 │        └──< Like
 ├──< Story
 ├──< Comment
 └──< Like
```

Users are keyed by `username`. Deleting a user cascades to their posts, stories,
comments and likes; deleting a post cascades to its comments, tag links and
likes.

`Like` is a join table keyed on `(postID, userID)`, so a user can like a post
only once. `Post.likeCount` is a denormalised mirror of that table, recomputed
on every like and unlike rather than blindly incremented.

## API

Base URL: `http://localhost:8000/api`

### Auth (`http://localhost:9000`)

| Method | Path | Description |
| :--- | :--- | :--- |
| `POST` | `/register` | Create an account, returns a JWT |
| `POST` | `/login` | Exchange credentials for a JWT |

Admin rights are never taken from the request body — the column defaults to
`false` and is granted directly in the database. Tokens expire after one hour.

### Users

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/users` | List all users |
| `GET` | `/users/:username` | Fetch one user |
| `PUT` | `/users/:username` | Update a user (self or admin) |
| `DELETE` | `/users/:username` | Delete a user (self or admin) |

### Posts

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/posts` | List all posts |
| `GET` | `/posts/:id` | Fetch one post |
| `GET` | `/posts/users/:username` | Posts by a given user |
| `POST` | `/posts` | Create a post |
| `PUT` | `/posts/:id` | Edit a post (owner or admin) |
| `POST` | `/posts/like/:id` | Like a post (`409` if already liked) |
| `POST` | `/posts/unlike/:id` | Remove a like (`409` if not liked) |
| `DELETE` | `/posts/:id` | Delete a post (owner or admin) |

### Stories

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/stories` | List all stories |
| `GET` | `/stories/:id` | Fetch one story |
| `GET` | `/stories/users/:userID` | Stories by a given user |
| `POST` | `/stories` | Create a story |
| `PUT` | `/stories/:id` | Edit a story (owner or admin) |
| `DELETE` | `/stories/:id` | Delete a story (owner or admin) |

### Comments

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/comments` | List all comments |
| `GET` | `/comments/:id` | Fetch one comment |
| `GET` | `/comments/posts/:postID` | Comments on a post |
| `POST` | `/comments` | Create a comment |
| `PUT` | `/comments/:id` | Edit a comment (owner or admin) |
| `DELETE` | `/comments/:id` | Delete a comment (owner or admin) |

### Tags

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/tags/posts/:tagName` | All posts carrying a tag |

Protected requests carry the token in a header, never in a URL parameter:

```
Authorization: Bearer <token>
```

## Configuration

Both services read their settings from the environment. Copy the template and
fill it in — `.env` is gitignored, so each developer supplies their own:

```bash
cp .env.example .env
```

| Variable | Purpose |
| :--- | :--- |
| `ACCESS_TOKEN_SECRET` | JWT signing key. Required, no default. |
| `DB_HOST` `DB_PORT` `DB_USER` `DB_PASSWORD` `DB_NAME` | MySQL connection. Defaults to `root@127.0.0.1:3306/social_network`. |
| `ADMIN_USERNAME` `ADMIN_PASSWORD` | The admin account created by the seeders. Defaults to `admin` / `changeme123`. |
| `CLIENT_ORIGINS` | Comma separated origins allowed to call the auth service. Defaults to `http://localhost:8000,http://127.0.0.1:8000`. |

Generate a signing key with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

[`config/config.js`](config/config.js) turns those variables into the Sequelize
config for both the app and `sequelize-cli`, so there is no config file to keep
in sync.

## Running with Docker Compose

The quickest way to get everything up — MySQL, migrations and both services:

```bash
docker compose up --build
```

Compose starts MySQL, waits for it to pass a healthcheck, runs the migrations
and seeders in a one-shot `migrate` service, and only then brings up `auth` and
`api`.
Database contents survive restarts in a named volume; `docker compose down -v`
wipes them.

Only `ACCESS_TOKEN_SECRET` is required in `.env` — the database variables fall
back to values that match the bundled MySQL container.

Then open `http://localhost:8000/login`.

## Running locally without Docker

Requires Node.js 20+ and a reachable MySQL server holding the database named in
`DB_NAME`.

```bash
npm install
```

Create the schema, then start both processes in separate terminals:

```bash
npm run migrate
```

```bash
npm run seed
```

```bash
npm run start:auth
```

```bash
npm start
```

Then open `http://localhost:8000/login`.

## Seed data

`npm run seed` populates an empty database so there is something to log in with
and look at:

| Seeder | What it creates |
| :--- | :--- |
| `20260812120000-admin-user` | One admin account, from `ADMIN_USERNAME` / `ADMIN_PASSWORD`. |
| `20260812120100-sample-content` | Users `alice` and `bob` (password `password123`) with three posts, three tags, likes, comments and two stories. |

The admin seeder exists because registration deliberately cannot grant admin
rights — the column defaults to `false` and is never read from the request body,
so the first administrator has to be created out of band.

Both seeders check before they insert, so running them twice will not duplicate
anything, and `seederStorage` records which have already run. `npm run seed --
--undo-all` (or `npx sequelize-cli db:seed:undo:all`) removes the seeded rows.

> The sample passwords are for local demos only.

## Project structure

```
├── app.js              # Resource API (port 8000) + static client
├── app_auth.js         # Auth service (port 9000): register, login, JWT
├── config/config.js    # Environment driven Sequelize config
├── docker-compose.yml  # MySQL + migrations + both services
├── Dockerfile
├── models/             # Sequelize models and associations
│   ├── user.js  post.js  story.js  comment.js  tag.js  post_tag.js  like.js
│   └── index.js        # Loads models, reads config/config.js
├── middleware/
│   ├── api-router.js   # Router preconfigured with body parsing + auth
│   ├── auth.js         # Bearer token check shared by every /api router
│   ├── crud.js         # Joi param/body guards + generic update and delete
│   └── ownership.js    # Loads the target row, allows owner or admin only
├── migrations/         # sequelize-cli schema migrations
├── seeders/            # Admin account and sample content
├── routes/             # One router per resource, mounted under /api
│   ├── users.js  posts.js  stories.js  comments.js  tags.js
└── static/             # Demo client: HTML pages + fetch based scripts
    └── scripts/
        └── common.js   # API wrapper, cookie helpers, table + navbar rendering
```
