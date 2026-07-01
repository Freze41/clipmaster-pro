#!/bin/sh
set -e
echo "⏳ Waiting for Postgres..."
# simple wait loop
for i in $(seq 1 30); do
  node -e "require('net').createConnection(5432,'postgres').on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))" && break
  echo "  postgres not ready $i/30"
  sleep 2
done

echo "📦 Prisma db push..."
npx prisma db push --accept-data-loss || true

echo "🌱 Seed if empty..."
node -e "
const {PrismaClient}=require('@prisma/client');
const p=new PrismaClient();
p.user.count().then(c=>{ if(c===0){ console.log('seeding...'); require('child_process').execSync('npx tsx prisma/seed.ts',{stdio:'inherit'}) } ; process.exit(0) }).catch(()=>process.exit(0))
" || true

echo "🚀 Starting Next.js"
exec npm run start
