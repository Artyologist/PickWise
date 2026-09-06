# 🎬 PickWise

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.18.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0.3_(Mongoose)-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://vercel.com/)
[![Deployed on Railway](https://img.shields.io/badge/Backend-Railway-0B0D0E?logo=railway)](https://railway.app/)

> **The universal entertainment hub.** Discover, rate, and track every movie, TV show, anime, manga, novel, comic, video game, and documentary — all in one place.

PickWise is a full-stack MERN platform that aggregates content from four external APIs (TMDB, Jikan/MAL, RAWG, Google Books) into a unified catalog. Users can search across all media types simultaneously, write reviews, manage a personal watchlist, explore shared universes via a Cross-IP mapping system, and follow upcoming releases on a live timeline.

## 🌐 Live Application

| Layer | URL |
|-------|-----|
| **Frontend** | https://pickwise.vercel.app |
| **Backend API** | https://pickwise-server.up.railway.app |

---

## ✨ Key Features

- **Unified Global Search** — A single search bar queries TMDB (movies, TV, documentaries), Jikan (anime, manga), RAWG (video games), and Google Books (novels, comics) simultaneously. Local DB results are prioritized and scored by exact-title matching and popularity; external APIs fill the gaps intelligently.
- **Cross-IP Universe Mapping** — Content items store explicit `crossIp` relationships (prequel, sequel, adaptation, spin-off, same-universe, etc.) allowing users to navigate from a movie to its manga origin, anime adaptation, or companion novel from a single detail page.
- **Live Review Aggregation** — Each content detail page merges internally-written PickWise reviews with external reviews fetched on-demand from the source API (e.g. TMDB critic reviews), displayed in a unified feed with clear source attribution.
- **Personal Watchlist & Progress Tracking** — Authenticated users can add any content to their watchlist with a status label (Watching, Completed, On Hold, Dropped, Plan to Watch, Playing, Beaten, Reading) and a numeric progress field.
- **Upcoming Releases Timeline** — A curated feed of upcoming projects grouped by release window, each with a rich event timeline (trailer releases, casting announcements, platform confirmations, delays, etc.) and Cross-IP linking.
- **Role-Based Admin Dashboard** — Admins can view platform-wide content/user statistics broken down by category, browse and delete content with pagination, all behind a double-middleware guard (`auth` + `admin`).

---

## 🛠 Tech Stack

### Frontend (`/client`)

| Technology | Version | Purpose |
|---|---|---|
| React | 18.2.0 | UI component library |
| Vite | 5.2.0 | Build tool & dev server |
| React Router DOM | 6.12.1 | Client-side routing |
| TanStack React Query | 4.34.8 | Server state management & caching |
| Axios | 1.6.0 | HTTP client |
| Tailwind CSS | 3.4.10 | Utility-first styling |
| Headless UI | 1.7.13 | Accessible UI primitives |
| Heroicons | 2.0.18 | SVG icon set |

### Backend (`/server`)

| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18.x | JavaScript runtime |
| Express | 4.18.2 | HTTP server framework |
| Mongoose | 7.0.3 | MongoDB ODM |
| JSON Web Token | 9.0.0 | Stateless authentication |
| bcryptjs | 2.4.3 | Password hashing |
| express-rate-limit | 6.7.0 | API rate limiting (150 req/min) |
| Morgan | 1.10.0 | HTTP request logging |
| Slugify | 1.6.6 | URL-safe slug generation |
| dotenv | 16.0.3 | Environment variable management |

### External APIs

| API | Data Sourced |
|---|---|
| [TMDB](https://www.themoviedb.org/documentation/api) | Movies, TV shows, documentaries, cast, backdrops |
| [Jikan (MAL)](https://jikan.moe/) | Anime, manga, light novels |
| [RAWG](https://rawg.io/apidocs) | Video games, platform details, system requirements |
| [Google Books](https://developers.google.com/books) | Novels, comics, books |

### Infrastructure

| Service | Role |
|---|---|
| MongoDB Atlas | Cloud database (Cluster0) |
| Vercel | React SPA hosting |
| Railway (Nixpacks) | Express API hosting |

---

## 📁 Repository Structure

```
pickwise/
├── client/                        # React + Vite frontend
│   ├── public/                    # Static assets (posters, icons)
│   ├── src/
│   │   ├── api/                   # Axios API client instances
│   │   ├── components/            # Reusable UI components (Header, Cards, Modals…)
│   │   ├── config/                # App-wide constants (API base URLs)
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Hero + category carousels
│   │   │   ├── SearchResults.jsx  # Per-category search results page
│   │   │   ├── ContentDetail.jsx  # Main detail page (reviews, cross-IP, similar)
│   │   │   ├── Universe.jsx       # Franchise / universe browser
│   │   │   ├── Upcoming.jsx       # Upcoming releases grouped by month
│   │   │   ├── UpcomingDetail.jsx # Event timeline for a single upcoming project
│   │   │   ├── Profile.jsx        # User profile & review history
│   │   │   ├── Settings.jsx       # Account settings
│   │   │   ├── AdminDashboard.jsx # Admin stats & content management
│   │   │   └── Login.jsx          # Auth page (login + register)
│   │   ├── services/              # Business-logic helpers
│   │   ├── utils/                 # Utility functions
│   │   ├── App.jsx                # Root router
│   │   └── main.jsx               # React entry point
│   ├── vercel.json                # Vercel SPA rewrite rules
│   └── package.json
│
├── server/                        # Express + MongoDB backend
│   ├── src/
│   │   ├── config/                # DB connection config
│   │   ├── controllers/
│   │   │   ├── globalSearch.js    # Hybrid local+external search logic
│   │   │   ├── search.js          # Per-category search controller
│   │   │   └── universe.js        # Universe aggregation controller
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js # JWT verification middleware
│   │   │   ├── admin.js           # Role guard (admin only)
│   │   │   └── apiLimiter.js      # Per-route rate limiter
│   │   ├── models/
│   │   │   ├── ContentItem.js     # Master content schema
│   │   │   ├── User.js            # User account schema
│   │   │   ├── Review.js          # User review schema
│   │   │   ├── Watchlist.js       # Watchlist entry schema
│   │   │   ├── Comment.js         # Comment schema
│   │   │   ├── UpcomingProject.js # Upcoming release schema
│   │   │   └── LoginEvent.js      # Login audit schema
│   │   ├── routes/                # Express route definitions (11 route files)
│   │   ├── services/
│   │   │   ├── tmdb.service.js    # TMDB API integration
│   │   │   ├── jikan.service.js   # Jikan/MAL API integration
│   │   │   ├── rawg.service.js    # RAWG API integration
│   │   │   └── googleBooks.service.js # Google Books integration
│   │   ├── seeders/               # DB seed scripts
│   │   ├── scripts/               # Maintenance & data-migration scripts
│   │   └── index.js               # Express app entry point
│   ├── railway.json               # Railway deployment config
│   └── package.json
│
├── diagrams/                      # Architecture diagrams
└── README.md
```

---

## ⚙️ Core Engine & Architecture

### Hybrid Global Search

The global search controller (`src/controllers/globalSearch.js`) implements a two-phase strategy:

1. **Local-first phase** — queries MongoDB across all 8 categories in parallel using a regex title match. Results are scored: exact title match (+100), prefix match (+50), partial match (+10), then boosted by `popularityScore`. Top 5 per category are returned.
2. **External fallback phase** — if the total local result count is < 10, all four external APIs are queried via `Promise.allSettled()` (TMDB, Jikan anime + manga, RAWG, Google Books novels + comics). External results are deduped against local results by `externalId` or lowercase title before merging.

### Content Import & Deduplication

When a user selects an external search result, the client calls `POST /api/content/import`. The server checks for an existing document matching `{ source, externalId }` using a **unique sparse compound index** — returning the existing `_id` immediately on hit, or creating a new `ContentItem` document otherwise. This prevents duplicate entries across multiple users discovering the same content.

### Live Detail Enrichment

`GET /api/content/:id/details` first loads the local MongoDB document, then routes to the appropriate service (`tmdb.service`, `jikan.service`, `rawg.service`, `googleBooks.service`) based on `content.source` to fetch real-time enriched data (full cast, external reviews, trailers, etc.). Internal PickWise reviews are merged with external reviews before the response, internal reviews appearing first.

### Rating Recalculation

Every time a `Review` is posted to `POST /api/reviews/:contentId`, the server runs a MongoDB **aggregation pipeline** (`$group` → `$avg`) over all reviews for that content to recompute and persist `averageRating` and `ratingCount` on the `ContentItem` document atomically.

### Authentication Flow

```
Client → POST /api/auth/login
  → bcrypt.compare(password, hash)
  → jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' })
  → token returned to client (localStorage)

Protected Route → Authorization: Bearer <token>
  → auth.middleware: jwt.verify() → User.findById()
  → req.user attached → next()

Admin Route → auth.middleware → admin.middleware (role === 'admin' check)
```

---

## 🗄️ Database Schema

### `ContentItem` (Master Catalog)

| Field | Type | Description |
|---|---|---|
| `title` | String | Content title (indexed) |
| `slug` | String | URL-safe identifier |
| `category` | String | `movie` \| `tv` \| `anime` \| `manga` \| `novel` \| `comic` \| `videogame` \| `documentary` |
| `source` | String | Source API: `tmdb` \| `mal` \| `rawg` \| `google_books` |
| `externalId` | String | ID from source API (unique + source pair) |
| `universe` | String | Franchise label for grouping |
| `crossIp` | Array | Cross-media relationships (relationType, targetId ref, label) |
| `genres` | [String] | Genre tags |
| `casts` | Array | Cast list (name, role, photoUrl) |
| `ratings` | Array | External ratings (source, value, raw) |
| `averageRating` | Number | Computed PickWise average (1–10) |
| `ratingCount` | Number | Total PickWise review count |
| `platforms` | [String] | Streaming / gaming platforms |
| `popularityScore` | Number | Weighted popularity for ranking |
| `posterUrl` / `backdropUrl` | String | Media URLs |

### `User`

| Field | Type | Description |
|---|---|---|
| `email` | String | Unique, required |
| `username` | String | Unique display name |
| `password` | String | bcrypt hash (`select: false`) |
| `role` | String | `user` \| `admin` |
| `watchlist` / `favorites` / `reviewed` | [ObjectId] | Refs to ContentItem |
| `reviewCount` | Number | Incremented on each review |

### `Review`

| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | Ref to User |
| `content` | ObjectId | Ref to ContentItem |
| `rating` | Number | 1–10 scale |
| `text` | String | Review body |
| **Compound Index** | `{ user, content }` unique | One review per user per content |

### `Watchlist`

| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | Ref to User |
| `content` | ObjectId | Ref to ContentItem |
| `status` | String | `Plan to Watch` \| `Watching` \| `Completed` \| `Dropped` \| `On Hold` \| `Playing` \| `Beaten` \| `Reading` |
| `progress` | Number | Generic progress counter |
| `rating` | Number | Personal rating override |

### `UpcomingProject`

| Field | Type | Description |
|---|---|---|
| `title` / `slug` | String | Title & URL key |
| `category` | String | `movie` \| `tv` \| `anime` \| `videogame` \| `novel` |
| `releaseWindow` | String | e.g. `"September 2026"` |
| `timeline` | Array | Ordered events (announcement, trailer, delay, etc.) |
| `crossIp` | Array | Links to related existing content |
| `platforms` | [String] | Target platforms |

---

## 🔒 Security

| Mechanism | Implementation |
|---|---|
| **Password Hashing** | bcryptjs with salt rounds = 10, applied via Mongoose `pre('save')` hook |
| **JWT Authentication** | 7-day signed tokens; `password` field has `select: false` to prevent leakage |
| **Role-Based Access** | Admin routes use double middleware: `auth` (identity) → `admin` (role check) |
| **Rate Limiting** | Global limiter: 150 requests / 60 seconds per IP via `express-rate-limit` |
| **CORS Policy** | Allowlist-based: only `localhost:5173`, `localhost:5174`, and `FRONTEND_URL` env var |
| **Duplicate Review Guard** | Unique compound index `{ user, content }` on Review collection prevents re-submission |

---

## 🚀 Local Development Setup

### Prerequisites

- Node.js ≥ 18.x
- npm ≥ 9.x
- MongoDB Atlas account **or** a local MongoDB instance

### 1. Clone the Repository

```bash
git clone https://github.com/Artyologist/PickWise.git
cd PickWise
```

### 2. Backend Setup (`/server`)

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/pickwise

# Server
PORT=4000

# Auth
JWT_SECRET=your_super_secret_key_here

# Frontend (for CORS)
FRONTEND_URL=http://localhost:5173

# External APIs
TMDB_KEY=your_tmdb_api_key
RAWG_KEY=your_rawg_api_key
GOOGLE_BOOKS_KEY=your_google_books_api_key
```

Start the backend server:

```bash
npm run dev        # development (nodemon)
# or
npm start          # production
```

The API will be available at: `http://localhost:4000`

### 3. Frontend Setup (`/client`)

```bash
cd ../client
npm install
npm run dev
```

The app will be available at: `http://localhost:5173`

### 4. (Optional) Create an Admin User

```bash
cd server
node create-admin.js
```

### 5. (Optional) Seed the Database

```bash
cd server
npm run seed
```

---

## 📊 Project Stats

| Metric | Value |
|---|---|
| **API Route Groups** | 11 (`auth`, `content`, `search`, `global-search`, `reviews`, `comments`, `watchlist`, `users`, `universe`, `upcoming`, `admin`) |
| **Frontend Pages** | 13 (`Home`, `SearchResults`, `ContentDetail`, `Universe`, `Upcoming`, `UpcomingDetail`, `Profile`, `Settings`, `Login`, `About`, `AdminDashboard`) |
| **MongoDB Collections** | 7 (`ContentItem`, `User`, `Review`, `Watchlist`, `Comment`, `UpcomingProject`, `LoginEvent`) |
| **External API Integrations** | 4 (TMDB, Jikan, RAWG, Google Books) |
| **Content Categories** | 8 (`movie`, `tv`, `anime`, `manga`, `novel`, `comic`, `videogame`, `documentary`) |
| **Rate Limit** | 150 requests / minute / IP |
| **Frontend Deployment** | Vercel (SPA with rewrite rules) |
| **Backend Deployment** | Railway (Nixpacks builder) |

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with ❤️ using the MERN stack</p>
