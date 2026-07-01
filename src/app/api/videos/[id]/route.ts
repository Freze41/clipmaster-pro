import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function getUserId(){
  const session = await getServerSession(authOptions)
  return (session?.user as any)?.id || "user_demo_rian"
}

export async function PUT(req: Request, { params }: { params: { id:string } }){
  const userId = await getUserId()
  const body = await req.json()
  const existing = await prisma.video.findFirst({ where: { id: params.id, userId }})
  if(!existing) return NextResponse.json({error:"Not found"}, {status:404})
  const updated = await prisma.video.update({
    where: { id: params.id },
    data: {
      title: body.title ?? existing.title,
      channel: body.channel ?? existing.channel,
      duration: body.duration ?? existing.duration,
      url: body.url ?? existing.url,
      youtubeId: body.youtubeId ?? existing.youtubeId,
      tags: body.tags ?? existing.tags,
      description: body.description ?? existing.description,
    }
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: { id:string } }){
  const userId = await getUserId()
  await prisma.clip.deleteMany({ where: { videoId: params.id, userId }})
  await prisma.video.deleteMany({ where: { id: params.id, userId }})
  return NextResponse.json({ ok: true })
}

export async function GET(_: Request, { params }: { params: { id:string } }){
  const userId = await getUserId()
  const video = await prisma.video.findFirst({ where: { id: params.id, userId }, include: { clips: true, moments: true }})
  if(!video) return NextResponse.json({error:"Not found"}, {status:404})
  return NextResponse.json(video)
}
