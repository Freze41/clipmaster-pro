import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const schema = z.object({
  youtubeId: z.string().min(5),
  title: z.string().min(2),
  channel: z.string().min(1),
  duration: z.number().int().positive().default(600),
  url: z.string().url().or(z.string().startsWith("http")),
  description: z.string().optional(),
  tags: z.string().optional(),
})

async function getUserId(){
  const session = await getServerSession(authOptions)
  return (session?.user as any)?.id || "user_demo_rian"
}

export async function GET(req: Request){
  const userId = await getUserId()
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || ""
  const videos = await prisma.video.findMany({
    where: { userId, ...(q ? { OR: [ { title: { contains: q }}, { channel: { contains: q }} ] } : {}) },
    orderBy: { createdAt: "desc" }
  })
  return NextResponse.json(videos)
}

export async function POST(req: Request){
  const userId = await getUserId()
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if(!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const data = parsed.data
  const video = await prisma.video.create({
    data: {
      ...data,
      userId,
      thumbnail: `https://i.ytimg.com/vi/${data.youtubeId}/hqdefault.jpg`,
      status: "READY",
      views: Math.floor(Math.random()*2_000_000)+50000,
    }
  })
  return NextResponse.json(video, { status: 201 })
}
