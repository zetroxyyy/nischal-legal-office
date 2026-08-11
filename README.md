# Nischal Legal Office

[https://nischal-legal-office.vercel.app](https://nischal-legal-office.vercel.app)

> Production Next.js 16 bilingual legal office website with a custom serverless Postgres CMS.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-green?logo=postgresql)](https://neon.tech/)

## Overview

This application is a production-grade bilingual web presence built for Nischal Legal Office (निस्चल लीगल अफिस), paired with a custom-built, purpose-built Content Management System (CMS). Unlike generic website templates or heavy third-party monoliths like WordPress, this system was engineered specifically so non-technical legal office personnel can manage every section of their digital presence—including hero banners, practice areas, court procedures, gallery photos, contact details, and bilingual interface labels—directly from an intuitive administration interface without developer assistance.

The platform is powered by Next.js 16 App Router, React 19, and Neon serverless Postgres. Content edits made inside the custom `/admin` control panel perform atomic JSONB database mutations and trigger immediate Next.js on-demand cache tag revalidations (`updateTag("content")`). Media uploads (hero images, gallery photos, service graphics) stream directly to Vercel Blob storage, automatically purging replaced files to maintain a lean storage footprint.

Built for a Nepalese legal practice, complete internationalization is baked into the application's core architecture. The platform supports seamless real-time switching between Devanagari Nepali (`ne`) and English (`en`), incorporating Devanagari digit formatting (`nd()`) and structured bilingual data pairs across every content field.

## Screenshots

![Homepage desktop hero view at 1440px viewport width](docs/screenshots/home-desktop.png)
*Homepage desktop hero view showcasing practice areas and bilingual layout.*

![Services catalog and practice details page](docs/screenshots/services.png)
*Legal services and practice areas catalog page.*

![Custom administrative CMS dashboard](docs/screenshots/admin-dashboard.png)
*Administrative CMS dashboard overview for office staff.*

![Bilingual hero banner content editor screen](docs/screenshots/admin-hero-editor.png)
*Content editor interface for real-time section updates.*

## Features

- **Custom JSONB Content Engine**: Single-row Postgres content model (`site_content` table, `id=1`) enabling schema-less, real-time section updates and automated historical backup rotation.
- **Native Dual i18n (Nepali & English)**: Complete site-wide i18n supporting Devanagari Nepali (`ne`) as default and English (`en`), featuring automated Devanagari digit translation (`nd()`) and cookie-based persistence (`/api/lang`).
- **Secure Custom Authentication**: Lightweight session management using `jose` JWT cookies (`admin_session` with 7-day expiration), bcrypt password hashing, and brute-force account lockout protections in Neon Postgres (`admin_users`).
- **Vercel Blob Asset Management**: Direct image uploads via Server Actions (`src/app/admin/actions.ts`) to Vercel Blob storage (`@vercel/blob`) with automatic deletion of legacy blobs.
- **Client Inquiry System**: Integrated public contact form submitting inquiries into Neon Postgres (`messages` table) with unread status tracking and administrative review capabilities (`/admin/messages`).
- **Safety Seed Guard**: Database seed script (`db:seed`) guarded against accidental overwriting of client-edited live content, with automatic timestamped backup creation on forced re-seeds.

## Tech Stack

| Layer | Technology | Why |
| --- | --- | --- |
| **Framework** | Next.js 16.3.0 | React 19 App Router with `"use cache"`, Server Actions, and on-demand cache tag invalidation via `updateTag`. |
| **Database** | Neon Serverless Postgres (`^1.1.0`) | Serverless HTTP SQL client (`@neondatabase/serverless`) providing fast queries in serverless runtimes without connection pool limits. |
| **Storage** | Vercel Blob (`^2.7.0`) | High-performance object storage for media assets uploaded through the CMS. |
| **Authentication** | `jose` (`^6.2.8`) & `bcryptjs` (`^3.0.3`) | Custom stateless JWT signing (`HS256`) and salted password hashing without external identity vendor lock-in. |
| **Styling** | Tailwind CSS v4 | Native PostCSS integration via `@tailwindcss/postcss` for custom styling. |
| **Language & Runtime** | TypeScript 5 & Node.js 20 | Complete type safety across content models, server actions, and database queries. |

## Architecture

```
[ Visitor / Client ]                 [ Legal Office Staff ]
         │                                      │
         ▼                                      ▼
  Public Routes                             Admin Pages
 (/, /services, /contact)            (15 routes under /admin/*)
         │                                      │
         │ (getContent - "use cache")           │ (Server Actions in actions.ts)
         ▼                                      ▼
┌───────────────────────────────────────────────────────────┐
│                      Neon Postgres                        │
├───────────────────┬───────────────────┬───────────────────┤
│   site_content    │     messages      │    admin_users    │
│  (id=1, JSONB)    │  (Contact Form)   │   (Auth & Lock)   │
└─────────▲─────────┴───────────────────┴─────────▲─────────┘
          │                                       │
          │ (site_content_backups)                │ (jose JWT cookie)
          └───────────────────────────────────────┘
                               │
                               ▼
                       [ Vercel Blob ]
                    (Uploaded Image Store)
```

### Content Update Lifecycle

1. **Admin Form Submission**: An administrator edits content or uploads media on one of the 15 administrative pages under `/admin`.
2. **Authentication & Validation**: Server Actions (`src/app/admin/actions.ts`) authenticate the request using `requireAdmin()`, verifying the `jose` JWT session cookie (`admin_session`) against the `admin_users` database record.
3. **Media Upload**: If a file is attached, `uploadToBlob()` streams the asset to Vercel Blob using `BLOB_READ_WRITE_TOKEN`, returning the public asset URL and deleting any replaced blob via `del()`.
4. **Backup & Mutation**: The action retrieves the active JSONB tree from `site_content id=1`, creates a timestamped snapshot in `site_content_backups` (retaining the 20 most recent backups), and executes an atomic `UPDATE site_content SET data = ... WHERE id = 1`.
5. **Cache Invalidation**: Next.js cache tags are invalidated via `updateTag("content")` and `revalidatePath("/", "layout")`.
6. **Public Request Delivery**: When visitors access `/`, `/services`, or `/contact`, `getContent()` in `src/lib/content.ts` fetches `site_content id=1` from Neon Postgres (cached for 300s using `"use cache"` and tagged with `cacheTag("content")`), delivering updated content immediately.

## Content Model

It is critical to distinguish between initial repository content and live production content:

- **`content/seed.json`**: The **INITIAL** static content tree. It serves as the baseline template when initializing a fresh database and acts as a fallback if the database connection is unavailable.
- **Neon Postgres (`site_content` table, `id=1`)**: The **LIVE** content storage. Once seeded, all edits made by office staff in `/admin` mutate the database row `id=1`. Live client edits are saved strictly in Postgres and never overwrite `content/seed.json`.

### Public & Administrative Routes

- **Public Routes**:
  - `/` — Homepage (Hero, Firm Overview, Practice Areas, Procedure, Contact Info)
  - `/services` — Legal Services & Practice Areas Catalog
  - `/contact` — Contact Form & Office Location Information

- **API Routes**:
  - `/api/health` — Database & system health status check
  - `/api/lang` — Cookie-based language toggle route (`en` / `ne`)

- **Admin Routes (15 routes under `src/app/admin/`)**:
  - `/admin` — Admin Dashboard Overview
  - `/admin/about` — Firm History & Attorney Profiles Editor
  - `/admin/advanced` — Database Query & Raw JSON Operations
  - `/admin/docs` — Documentation & Guide Viewer
  - `/admin/gallery` — Office & Staff Photo Gallery Manager
  - `/admin/guide` — Staff CMS User Guide
  - `/admin/hero` — Homepage Hero Banner & Tagline Editor
  - `/admin/labels` — Site-wide UI Labels & Navigation Terms Editor
  - `/admin/login` — Administrative Login Screen
  - `/admin/messages` — Contact Form Submission Inbox
  - `/admin/password` — Admin Password Change Screen
  - `/admin/procedure` — Legal Consultation & Court Procedure Step Editor
  - `/admin/services` — Practice Areas Overview Editor
  - `/admin/services/[index]` — Individual Service Detail Editor
  - `/admin/settings` — SEO, Contact NAP Data & Business Hours Settings

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Neon Postgres database instance ([neon.tech](https://neon.tech))
- Vercel Blob store token ([vercel.com](https://vercel.com))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/zetroxyyy/nischal-legal-office.git
   cd nischal-legal-office
   ```

2. **Install dependencies**:
   ```bash
   npm ci
   ```

3. **Configure environment variables**:
   Create a `.env.local` file from `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Neon database URL, authentication secret, and Vercel Blob token:
   ```env
   DATABASE_URL=postgresql://user:password@ep-example.neon.tech/neondb?sslmode=require
   AUTH_SECRET=your-32-byte-base64-auth-secret
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_token
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Initialize database schema**:
   Creates the required database tables (`site_content`, `messages`, `admin_users`, `site_content_backups`) and initializes default admin credentials (`admin` / `nischal2026`):
   ```bash
   npm run db:setup
   ```

5. **Seed initial content**:
   Populates `site_content id=1` in Postgres using `content/seed.json`:
   ```bash
   npm run db:seed
   ```

   > [!IMPORTANT]
   > **Seed Guard Protection**: `scripts/db-seed.ts` contains a built-in safety guard. If `site_content id=1` already contains data in Postgres, `db:seed` will **abort immediately** to prevent overwriting live client edits.
   > 
   > To intentionally force a seed overwrite (e.g. resetting a local development database), pass the `--force` flag:
   > ```bash
   > npm run db:seed -- --force
   > ```
   > When `--force` is passed, `db:seed` automatically creates a timestamped snapshot of existing data in `site_content_backups` before overwriting `site_content id=1`.

6. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser. Access the CMS at [http://localhost:3000/admin](http://localhost:3000/admin).

## Environment Variables

Derived from `.env.example`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | **Yes** | Connection string for Neon serverless Postgres database. |
| `POSTGRES_URL` | No | Fallback alias for `DATABASE_URL` supported by Vercel integration. |
| `AUTH_SECRET` | **Yes** | 32-byte secret key used by `jose` to sign and verify `admin_session` JWT tokens. Generate using `openssl rand -base64 32`. |
| `BLOB_READ_WRITE_TOKEN` | **Yes** | Read/write API access token for Vercel Blob media storage. |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Public site origin without trailing slash (e.g. `https://example.com`), used for canonical headers and sitemap generation. |

> Values are redacted. Never commit `.env` or `.env.local` to version control.

## Project Structure

```
nischal-legal-office/
├── .github/              # CI workflow (ci.yml) and Dependabot setup (dependabot.yml)
├── content/              # Initial content template tree (seed.json)
├── docs/                 # Documentation assets and screenshots directory
│   └── screenshots/      # Pending UI screenshots
├── public/               # Public images and static assets
├── scripts/              # Database scripts (db:setup, db:seed, db:merge, db:migrate)
├── src/                  # Next.js 16 application source code
│   ├── app/              # App Router pages, admin CMS routes (15 pages), and API routes
│   └── lib/              # Core auth (jose), content caching, Neon DB, and i18n logic
├── .env.example          # Environment variable template
├── AGENTS.md             # Next.js framework-generated rule file (auto-created by next dev)
├── CLAUDE.md             # Repository boundaries and AI safety guidelines
├── LICENSE               # Portfolio display license
└── package.json          # Package manifest and script runner
```

> Note: `AGENTS.md` is framework-generated by Next.js (`next dev`) and managed automatically.

## Deployment

This application is configured for seamless deployment on Vercel:

1. Import the repository into your Vercel account.
2. In Project Settings -> Environment Variables, configure:
   - `DATABASE_URL` (from Neon Postgres)
   - `AUTH_SECRET` (generated via `openssl rand -base64 32`)
   - `BLOB_READ_WRITE_TOKEN` (from Vercel Storage -> Blob)
   - `NEXT_PUBLIC_SITE_URL` (your production domain)
3. Deploy the project.
4. Run `npm run db:setup` and `npm run db:seed` against your production database once prior to launch.

## License

Copyright (c) 2026 zetroxy. All rights reserved.

This source code is made publicly visible for portfolio and review purposes only.
No permission is granted to copy, modify, distribute, or use this code, in whole or
in part, for any commercial or non-commercial purpose without prior written consent.
