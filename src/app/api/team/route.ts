import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function getUserId(){
  const s = await getServerSession(authOptions)
  return (s?.user as any)?.id || "user_demo_rian"
}

// 3. MULTI-USER TEAM
export async function GET(){
  const userId = await getUserId()
  const memberships = await prisma.teamMember.findMany({
    where:{ userId },
    include:{ team:{ include:{ members:{ include:{ user:true } }, owner:true } } }
  })
  const owned = await prisma.team.findMany({
    where:{ ownerId: userId },
    include:{ members:{ include:{ user:true } } }
  })
  return NextResponse.json({ memberships, owned })
}

export async function POST(req:Request){
  const userId = await getUserId()
  const { name, inviteEmails } = await req.json()
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-') + '-' + Math.random().toString(36).slice(2,5)
  const team = await prisma.team.create({
    data:{
      name,
      slug,
      ownerId: userId,
      members:{ create:{ userId, role:"OWNER", acceptedAt: new Date() } }
    }
  })

  // invite by email (simple: if user exists, auto add as REVIEWER)
  if(Array.isArray(inviteEmails)){
    for(const email of inviteEmails){
      const u = await prisma.user.findUnique({ where:{ email: email.toLowerCase() }})
      if(u && u.id !== userId){
        await prisma.teamMember.create({
          data:{ teamId: team.id, userId: u.id, role: "EDITOR" }
        }).catch(()=>{})
      }
    }
  }

  return NextResponse.json(team, {status:201})
}
