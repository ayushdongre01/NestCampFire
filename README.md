# NestCampFire

NestCampFire is a full-stack web application for discovering, sharing, and reviewing campgrounds. Users can browse an interactive map of listings, inspect details with photos and descriptions, leave star ratings and written reviews, and manage their own campgrounds after signing up. The project follows a classic **MVC-style** layout on **Node.js** and **Express**, with server-rendered pages using **EJS** and **MongoDB** for persistence.

---

## Table of contents

- [Demo](#demo)
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Getting started](#getting-started)
- [Running in production](#running-in-production)
- [Project structure](#project-structure)
- [Security notes](#security-notes)

---

## Demo

| Environment | Link |
|-------------|------|
| **Live deployment (Render)** | [ https://nestcampfire.onrender.com/]( https://nestcampfire.onrender.com/) |

> **Note:** Free-tier hosts may spin down after idle time; the first request after sleep can take longer to load.

---

## Screenshots

Add your own captures under `docs/screenshots/` (create the folder if it does not exist) and keep the filenames below, **or** update the paths in this section to match where you store images.

| Area | Preview |
|------|---------|
| **Home** | ![Home page](https://github.com/ayushdongre01/NestCampFire/blob/main/images/1.png) |
| **Campgrounds & map** | ![Campgrounds index with cluster map](docs/screenshots/campgrounds-map.png) |
| **Campground detail** | ![Single campground with map and reviews](docs/screenshots/campground-show.png) |
| **Auth** | ![register](https://github.com/ayushdongre01/NestCampFire/blob/main/images/2.png) |
| **Auth** | ![Login](https://github.com/ayushdongre01/NestCampFire/blob/main/images/3.png) |

*If images are missing locally, GitHub will not render previews until you commit the PNG files.*

---

## Features

- **Campgrounds CRUD** — Create, read, update, and delete campground listings (create/edit/delete restricted to the author when logged in).
- **Image uploads** — Multiple photos per campground via **Cloudinary** (Multer + `multer-storage-cloudinary`).
- **Maps** — **MapTiler** for geocoding and interactive maps on the index (cluster map) and show page.
- **Reviews** — 1–5 star ratings and text reviews; authors can remove their own reviews.
- **Authentication** — **Passport.js** with **passport-local** and **passport-local-mongoose** (username + password; email stored on user).
- **Sessions** — **express-session** with **connect-mongo** so sessions persist in MongoDB.
- **UX** — Flash messages for success/error feedback; **Bootstrap**-style UI (via CDN) and custom CSS.
- **Validation** — **Joi** schemas with HTML stripped via **sanitize-html** on text fields.
- **Hardening** — **Helmet** (including CSP tuned for MapTiler, Cloudinary, CDNs), **express-mongo-sanitize**.
- **SEO** — `/sitemap.xml` for static routes (hostname configured for the Render deployment).

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Runtime | [Node.js](https://nodejs.org/) 20.x (see `package.json` `engines`) |
| Server | [Express](https://expressjs.com/) |
| Views | [EJS](https://ejs.co/) + [ejs-mate](https://github.com/jfahrenkrug/ejs-mate) layouts |
| Database | [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) |
| Auth | [Passport](http://www.passportjs.org/) (local strategy) |
| Maps | [@maptiler/client](https://github.com/maptiler/maptiler-js) + MapTiler maps API |
| Media | [Cloudinary](https://cloudinary.com/) |
| Validation | [Joi](https://joi.dev/) |

---

## Prerequisites

- **Node.js** 20.x (recommended: match `engines.node` in `package.json`).
- A running **MongoDB** instance (local `mongodb://127.0.0.1:27017` or [MongoDB Atlas](https://www.mongodb.com/atlas)).
- **Cloudinary** account (for image uploads in production and full local testing of uploads).
- **MapTiler** API key (for maps and forward geocoding).

---

## Environment variables

Create a `.env` file in the project root for local development. The app loads it automatically when `NODE_ENV` is not `production`.

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_URL` | Recommended | MongoDB connection string (defaults to `mongodb://127.0.0.1:27017/yelp_camp` if unset). |
| `secret` | Recommended | Secret for signing sessions (a strong random string in production). |
| `MAPTILER_API_KEY` | Yes (maps) | MapTiler API key for maps and geocoding. |
| `CLOUDINARY_CLOUD_NAME` | Yes (uploads) | Cloudinary cloud name. |
| `CLOUDINARY_KEY` | Yes (uploads) | Cloudinary API key. |
| `CLOUDINARY_SECRET` | Yes (uploads) | Cloudinary API secret. |
| `PORT` | Optional | HTTP port (defaults to `3000`). |
| `NODE_ENV` | Optional | Set to `production` on hosted deployments; `.env` is not loaded when this is `production`. |

Never commit `.env`; it is listed in `.gitignore`.

---

## Getting started

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd NestCampFire-git
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**  
   Copy the variables above into `.env` and fill in real values.

4. **Start MongoDB** (if using a local database).

5. **Run the application**

   ```bash
   npm start
   ```

   Open [http://localhost:3000](http://localhost:3000).

6. **Register a user** via `/register`, then add campgrounds from `/campgrounds/new`.

### Optional: seed data

The `seeds/` directory contains scripts intended to populate sample campgrounds. They assume a local Mongo URL and may need updates to match the current campground schema (e.g. `images` vs legacy `image` fields and a valid `author` user id). Run only after reviewing `seeds/index.js`:

```bash
node seeds/index.js
```

---

## Running in production

- Set `NODE_ENV=production` and provide all secrets via the host’s environment (not `.env` files on disk unless your platform supports them securely).
- Use a production MongoDB URI (`DB_URL`).
- Enable HTTPS on your host and consider setting `cookie.secure` on the session cookie in `app.js` when serving only over HTTPS.
- **Content Security Policy:** `app.js` whitelists a specific Cloudinary host in `imgSrc`. If your Cloudinary cloud name differs, update the CSP `imgSrc` entry to match your asset URLs.
- **Sitemap hostname:** The sitemap is generated with hostname `https://nestcampfire.onrender.com`. Change it in `app.js` if you deploy under a different domain.

---

## Project structure

```text
├── app.js                 # Express app, session, security middleware, routes mount
├── middleware.js          # Auth, authorization, Joi validation wrappers
├── schemas.js             # Joi campground & review schemas (with HTML escaping)
├── controllers/           # Route handlers (campgrounds, reviews, users)
├── models/                # Mongoose models (User, Campground, Review)
├── routes/                # Express routers
├── views/                 # EJS templates (layouts, partials, pages)
├── public/                # Static assets (CSS, client JS for maps & forms)
├── cloudinary/            # Cloudinary + Multer storage configuration
├── seeds/                 # Database seed helpers and data
├── utils/                 # Helpers (e.g. ExpressError, catchAsync)
└── package.json
```

---

## Security notes

- Keep `secret` and Cloudinary credentials private.
- Review **Helmet** CSP directives whenever you add new CDNs or image hosts.
- User-submitted HTML is stripped in validation; prefer keeping `allowedTags` restrictive.
