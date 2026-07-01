# ClipMaster Pro v1.1 - Full Docker
FROM node:20-bullseye AS base
# Install ffmpeg + yt-dlp deps
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*
# yt-dlp optional
RUN pip3 install --break-system-packages yt-dlp

WORKDIR /app

# deps
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# copy source
COPY . .

# prisma
ENV DATABASE_URL="postgresql://clipmaster:clipmaster@postgres:5432/clipmaster"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV NEXTAUTH_SECRET="clipmaster-docker-secret-change-me"
ENV NODE_ENV=production

RUN npx prisma generate

# build next
RUN npm run build

EXPOSE 3000

# entrypoint: wait db, migrate, seed, start
COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
