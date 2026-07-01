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
  const exist = await prisma.clip.findFirst({ where: { id: params.id, userId }})
  if(!exist) return NextResponse.json({ error:"Not found"}, {status:404})
  const updated = await prisma.clip.update({
    where: { id: params.id },
    data: {
      title: body.title ?? exist.title,
      hookText: body.hookText ?? exist.hookText,
      platform: body.platform ?? exist.platform,
      status: body.status ?? exist.status,
      tags: body.tags ?? exist.tags,
      startSec: body.startSec ?? exist.startSec,
      endSec: body.endSec ?? exist.endSec,
      duration: body.endSec && body.startSec ? body.endSec - body.startSec : exist.duration,
      description: body.description ?? exist.description,
    },
    include: { video: true }
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: { id:string } }){
  const userId = await getUserId()
  await prisma.clip.deleteMany({ where: { id: params.id, userId }})
  return NextResponse.json({ ok:true })
}

export async function GET(_: Request, { params }: { params: { id:string } }){
  const userId = await getUserId()
  const clip = await prisma.clip.findFirst({ where: { id: params.id, userId }, include: { video: true }})
  if(!clip) return NextResponse.json({error:"Not found"}, {status:404})
  return NextResponse.json(clip)
}
