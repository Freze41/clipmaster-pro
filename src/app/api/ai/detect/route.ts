import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { parseYouTubeId } from "@/lib/utils"

async function getUserId(){
  const session = await getServerSession(authOptions)
  return (session?.user as any)?.id || "user_demo_rian"
}

// Simulasi AI detection 60s moments
export async function POST(req: Request){
  const userId = await getUserId()
  const { youtubeUrl, targetSec = 60 } = await req.json()
  const youtubeId = parseYouTubeId(youtubeUrl)
  if(!youtubeId) return NextResponse.json({ error: "YouTube URL tidak valid" }, { status: 400 })

  // cari / buat video
  let video = await prisma.video.findFirst({ where: { youtubeId, userId }})
  if(!video){
    video = await prisma.video.create({
      data: {
        youtubeId,
        title: `Analyzed Video ${youtubeId}`,
        channel: "Imported Channel",
        duration: 2400,
        views: Math.floor(Math.random()*3_000_000),
        url: youtubeUrl.startsWith("http") ? youtubeUrl : `https://youtube.com/watch?v=${youtubeId}`,
        thumbnail: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
        userId,
        status: "READY",
        tags: "ai,import"
      }
    })
  }

  // hapus moments lama biar fresh
  await prisma.moment.deleteMany({ where: { videoId: video.id } })

  const duration = video.duration
  // AI heuristic seeds - ambil 5 slot dengan distribusi retention-friendly
  const slots = [
    { p: 0.08, label: "Hook Pembuka Kuat", emotion: "HIGH", reason: "Cold open retention spike" },
    { p: 0.22, label: "Jokes Spontan Viral", emotion: "FUNNY", reason: "Audio laugh peak" },
    { p: 0.44, label: "Reveal / Plot Twist", emotion: "SHOCK", reason: "Comment spike & rewatch" },
    { p: 0.67, label: "Quote Emas 60s", emotion: "HIGH", reason: "Text overlay potential" },
    { p: 0.81, label: "Closing Callout", emotion: "FUNNY", reason: "Strong CTA energy" },
  ]

  const moments = []
  for (const s of slots){
    const center = Math.floor(duration * s.p)
    const startSec = Math.max(5, Math.min(center, duration - targetSec - 5))
    const score = Math.round((88 + Math.random()*9 + (s.p===0.44?2:0)) *10)/10
    const m = await prisma.moment.create({
      data: {
        videoId: video.id,
        startSec,
        endSec: startSec + targetSec,
        label: s.label,
        score,
        emotion: s.emotion,
        reason: s.reason,
        keywords: "hook,viral,retention"
      }
    })
    moments.push(m)
  }

  // simulate processing delay 900ms
  await new Promise(r=>setTimeout(r, 900))

  return NextResponse.json({
    video,
    targetSec,
    moments: moments.sort((a,b)=>b.score-a.score),
    meta: {
      model: "clipmaster-ai-id-v2",
      analyzedAt: new Date().toISOString(),
      confidence: 0.92
    }
  })
}
