import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const schema = z.object({
  clipId: z.string(),
  status: z.enum(["APPROVED","REJECTED","CHANGES_REQUESTED"]),
  note: z.string().optional(),
  timecodes: z.string().optional(),
})

async function getUserId(){
  const s = await getServerSession(authOptions)
  return (s?.user as any)?.id || "user_demo_rian"
}

// 3. APPROVAL WORKFLOW
export async function POST(req:Request){
  const userId = await getUserId()
  const body = await req.json()
  const p = schema.parse(body)

  const approval = await prisma.approval.create({
    data:{
      clipId: p.clipId,
      reviewerId: userId,
      status: p.status,
      note: p.note,
      timecodes: p.timecodes
    }
  })

  // update clip status pipeline
  const nextStatus = p.status==="APPROVED" ? "APPROVED" : p.status==="REJECTED" ? "REJECTED" : "IN_REVIEW"
  await prisma.clip.update({ where:{ id: p.clipId }, data:{ status: nextStatus }})

  return NextResponse.json(approval, {status:201})
}

export async function GET(req:Request){
  const { searchParams } = new URL(req.url)
  const clipId = searchParams.get("clipId")
  const where = clipId ? { clipId } : {}
  const list = await prisma.approval.findMany({
    where,
    include:{ reviewer:true, clip:true },
    orderBy:{ createdAt:"desc" }
  })
  return NextResponse.json(list)
}
