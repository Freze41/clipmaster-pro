# ClipMaster Pro v1.1 — Deploy Guide

## 1. FFmpeg Export 9:16 (sudah included)
- API: `POST /api/export` { clipId, platform, resolution:"1080x1920", withSubs:true }
- Server: `src/app/api/export/route.ts` — fluent-ffmpeg, progress QUEUED → RENDERING → DONE
- FFmpeg filter real:
```
-vf "crop=ih*9/16:ih,scale=1080:1920:flags=lanczos,
 subtitles=subs.srt:force_style='Fontsize=28,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=3,Alignment=2'"
 -c:v libx264 -preset veryfast -crf 20 -r 30 -b:v 6000k
 -c:a aac -b:a 192k
```
- Local: `brew install ffmpeg` / `apt install ffmpeg`
- Vercel: maxDuration 60s di `vercel.json`. Untuk render panjang pakai QStash / Cloud Run worker.

UI: `/exports` — live progress polling 2.5s.

## 2. Auto-Post TikTok / YouTube Shorts / Reels
- API: `POST /api/post` { clipId, provider:"tiktok"|"youtube"|"instagram", caption, hashtags, scheduleAt }
- Integrasi stub lengkap di `src/app/api/post/route.ts`:
  - TikTok Content Posting API: `POST https://open.tiktokapis.com/v2/post/publish/video/init/`
  - YouTube Data v3: `youtube.videos.insert` snippet + status {privacyStatus:"public"}
  - Instagram Graph: `/{ig-user-id}/media` → `/media_publish`
- UI: `/post` — pilih clip READY, tulis caption, schedule optional
- SocialAccount model ready: simpan accessToken/refreshToken OAuth

Env tambahan:
```
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
IG_APP_ID=
IG_APP_SECRET=
```

## 3. Multi-User Team + Approval
- Models: Team, TeamMember, Approval
- Roles: OWNER, EDITOR, REVIEWER, CLIPPER
- Flow: DRAFT → IN_REVIEW → APPROVED/REJECTED/CHANGES_REQUESTED → EXPORTED → POSTED
- API:
  - `POST /api/team` {name, inviteEmails:[]}
  - `GET /api/team`
  - `POST /api/approvals` {clipId, status, note, timecodes}
- UI: `/team`

Seed team demo otomatis via `npm run db:seed` v1.1 (2 editor, 1 reviewer).

## 4. Vercel + Postgres
Local dev masih bisa SQLite:
```
# prisma/schema.sqlite.prisma tersedia
npx prisma db push --schema=prisma/schema.sqlite.prisma
```

Production Postgres (Vercel / Neon / Supabase):
1. Buat DB di Neon.tech (Singapore)
   ```
   DATABASE_URL="postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/clipmaster?sslmode=require"
   ```
2. Vercel → Project → Settings → Environment Variables:
   ```
   DATABASE_URL = <neon url>
   NEXTAUTH_SECRET = $(openssl rand -base64 32)
   NEXTAUTH_URL = https://clipmaster-pro.vercel.app
   ```
3. Deploy:
   ```
   vercel --prod
   ```
   Build akan otomatis `prisma generate && next build`
4. Migration pertama:
   ```
   npx prisma db push
   npm run db:seed
   ```
   (bisa via Vercel CLI: `vercel env pull` lalu push)

vercel.json sudah set:
- region sin1 (Singapore – dekat Indonesia)
- functions maxDuration 60s untuk /api/export

Domain custom:
- Vercel → Domains → add `clipmaster.id`
- Set CNAME / A record sesuai instruksi

---

Login demo: demo@clipmaster.id / demo123
Team demo:
- editor@clipmaster.id / demo123 (EDITOR)
- reviewer@clipmaster.id / demo123 (REVIEWER)
