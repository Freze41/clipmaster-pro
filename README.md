# ClipMaster Pro v1.1 — AI YouTube Clipper • FFmpeg • Auto-Post • Team

Full-stack Next.js 14 App Router • Prisma Postgres (Vercel) / SQLite local • NextAuth • Tailwind

Auto-klip momen terbaik 60 detik, export 9:16 FFmpeg real, auto-post TikTok / Shorts / Reels, team approval workflow — untuk Youtuber clipper Indonesia.

## Fitur v1.1

- 🔐 Auth NextAuth credentials + bcrypt, roles OWNER / EDITOR / REVIEWER / CLIPPER
- 🎬 Video Library CRUD penuh
- 🤖 Auto Clipper AI: 5 momen viral, score 85–97, hook text Indonesia
- ✂️ Clips CRUD + pipeline: DRAFT → IN_REVIEW → APPROVED → EXPORTED → POSTED
- 🎞️ **1. FFmpeg Export 9:16 real**
  - `POST /api/export` → crop IH*9/16, scale 1080x1920, subs burn, h264
  - UI: `/exports` live progress
- 📤 **2. Auto-Post Social**
  - TikTok Content Posting API, YouTube Shorts Data v3, Instagram Reels Graph
  - `POST /api/post` – schedule / immediate – UI `/post`
- 👥 **3. Team Multi-User + Approval**
  - Team, TeamMember, Approval (note + timecodes)
  - `POST /api/team`, `POST /api/approvals` – UI `/team`
- 🚀 **4. Vercel + Postgres**
  - `vercel.json` sin1, `DEPLOY.md` lengkap, Neon ready
- 📊 Analytics Recharts
- 🇮🇩 Seed: Windah, Deddy, Tanboy Kun, Arap, GadgetIn, Ferry — 12 clips

Demo login:
- Owner: `demo@clipmaster.id` / `demo123`
- Editor: `editor@clipmaster.id` / `demo123`
- Reviewer: `reviewer@clipmaster.id` / `demo123`

## Quick Start

```bash
cd clipper-app
cp .env.example .env
npm install
# Local SQLite cepat:
npx prisma db push --schema=prisma/schema.sqlite.prisma
# atau Postgres:
# npx prisma db push
npm run db:seed
npm run dev
```
http://localhost:3000

## API ringkas

- `POST /api/ai/detect` {youtubeUrl, targetSec}
- `GET|POST /api/videos` – `PUT|DELETE /api/videos/:id`
- `GET|POST /api/clips`
- `POST /api/export` – FFmpeg 9:16
- `POST /api/post` – tiktok|youtube|instagram
- `POST /api/team`
- `POST /api/approvals`

## Docker Compose — 1 perintah jalan

Sudah include: **Next.js + FFmpeg + Postgres 16 + Redis + MinIO S3**

```bash
cd clipper-app
docker compose up --build
# tunggu ~3 menit build pertama
# buka http://localhost:3000
# login: demo@clipmaster.id / demo123
```

Services:
- app → http://localhost:3000 (Next.js, ffmpeg built-in)
- postgres → localhost:5432  user:clipmaster / pass:clipmaster / db:clipmaster
- redis → localhost:6379 (BullMQ queue export)
- minio → http://localhost:9001  user:clipmaster / clipmaster123 (S3 render bucket)

Volume persistent:
- pgdata, redisdata, miniodata
- ./storage/renders  ← hasil MP4 9:16
- ./storage/uploads

Stop:
```bash
docker compose down
# hapus data:
docker compose down -v
```

Di dalam container ffmpeg sudah terinstall, jadi `/api/export` langsung render beneran.

---

## UI Clip Card baru

Di `/clips` sekarang setiap card ada:
- ⬇️ **Export 9:16** → POST /api/export → auto status EXPORTED → cek `/exports`
- 🚀 **Post** → prompt caption → POST /api/post → auto status POSTED
- Edit • status dropdown (DRAFT / IN_REVIEW / APPROVED / READY / EXPORTED / POSTED / REJECTED) • Hapus

Optimistic update semua.

---

Lihat `DEPLOY.md` untuk FFmpeg, Social keys, Team flow, Vercel Postgres.

MIT – komunitas clipper Indonesia.

