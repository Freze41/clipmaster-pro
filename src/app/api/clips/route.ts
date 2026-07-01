import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

async function getUserId(){
  const session = await getServerSession(authOptions)
  return (session?.user as any)?.id || "user_demo_rian"
}

const schema = z.object({
  videoId: z.string(),
  title: z.string().min(2),
  startSec: z.number().int().min(0),
  endSec: z.number().int().positive(),
  platform: z.string().default("tiktok"),
  hookText: z.string().optional(),
  tags: z.string().optional(),
  score: z.number().optional(),
})

export async function GET(req: Request){
  const userId = await getUserId()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const platform = searchParams.get("platform")
  const q = searchParams.get("q") || ""
  const clips = await prisma.clip.findMany({
    where: {
      userId,
      ...(status ? { status } : {}),
      ...(platform ? { platform } : {}),
      ...(q ? { title: { contains: q }} : {}),
    },
    include: { video: true },
    orderBy: { createdAt: "desc" }
  })
  return NextResponse.json(clips)
}

export async function POST(req: Request){
  const userId = await getUserId()
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if(!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const d = parsed.data
  const duration = Math.max(1, d.endSec - d.startSec)
  const clip = await prisma.clip.create({
    data: {
      videoId: d.videoId,
      userId,
      title: d.title,
      startSec: d.startSec,
      endSec: d.endSec,
      duration,
      platform: d.platform,
      hookText: d.hookText,
      tags: d.tags,
      score: d.score ?? Math.round((85+Math.random()*12)*10)/10,
      status: "DRAFT",
    },
    include: { video: true }
  })
  return NextResponse.json(clip, { status: 201 })
}
