import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const schema = z.object({
  clipId: z.string(),
  provider: z.enum(["tiktok","youtube","instagram"]),
  caption: z.string().min(3),
  hashtags: z.string().optional(),
  scheduleAt: z.string().datetime().optional().nullable(),
  socialAccountId: z.string().optional(),
})

async function getUserId(){
  const s = await getServerSession(authOptions)
  return (s?.user as any)?.id || "user_demo_rian"
}

/*
  2. AUTO-POST TIKTOK / YOUTUBE SHORTS / REELS
  - TikTok: Login Kit + Content Posting API (video init → upload → publish)
  - YouTube: youtube/v3/videos insert (privacy=public, madeForKids=false)
  - Instagram: Graph API /{ig-user-id}/media → /media_publish (Reels)
*/
export async function POST(req: Request){
  const userId = await getUserId()
  const body = await req.json()
  const p = schema.parse(body)

  const clip = await prisma.clip.findFirst({ where:{ id:p.clipId, userId }, include:{ exports: { orderBy:{ createdAt:'desc'}, take:1 } } })
  if(!clip) return NextResponse.json({error:"Clip not found"}, {status:404})

  const job = await prisma.postJob.create({
    data:{
      clipId: p.clipId,
      userId,
      provider: p.provider,
      caption: p.caption,
      hashtags: p.hashtags,
      scheduleAt: p.scheduleAt ? new Date(p.scheduleAt) : null,
      socialAccountId: p.socialAccountId || null,
      status: p.scheduleAt ? "SCHEDULED" : "POSTING",
    }
  })

  if(!p.scheduleAt){
    // immediate post (async)
    doPost(job.id, p.provider).catch(()=>{})
  }

  return NextResponse.json(job, {status:201})
}

export async function GET(){
  const userId = await getUserId()
  const jobs = await prisma.postJob.findMany({
    where:{ userId },
    include:{ clip:{ include:{ video:true } } },
    orderBy:{ createdAt:'desc' },
    take: 50
  })
  return NextResponse.json(jobs)
}

async function doPost(jobId:string, provider:string){
  await prisma.postJob.update({ where:{ id: jobId }, data:{ status:"POSTING" }})
  await new Promise(r=>setTimeout(r, 1400))

  // ---- PROVIDER STUBS ----
  // TikTok Content Posting API
  // POST https://open.tiktokapis.com/v2/post/publish/video/init/
  // { "post_info": { "title": caption, "privacy_level":"PUBLIC" }, "source_info": { "source":"FILE_UPLOAD"... } }
  //
  // YouTube Data API v3
  // POST https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status
  // { snippet:{ title, description, tags, categoryId:"22" }, status:{ privacyStatus:"public", madeForKids:false, selfDeclaredMadeForKids:false } }
  //
  // Instagram Graph API
  // POST /{ig-user-id}/media?media_type=REELS&video_url=...&caption=...
  // then POST /{ig-user-id}/media_publish?creation_id=...

  const fakeIds:any = {
    tiktok: " video_"+Math.floor(Math.random()*1e12),
    youtube: "S"+Math.random().toString(36).slice(2,11),
    instagram: "18"+Math.floor(Math.random()*1e15)
  }
  const fakeUrls:any = {
    tiktok: "https://www.tiktok.com/@clipmaster/video/"+Date.now(),
    youtube: "https://youtube.com/shorts/"+fakeIds.youtube,
    instagram: "https://www.instagram.com/reel/"+fakeIds.instagram+"/"
  }

  const ok = Math.random() > 0.07 // 93% success
  if(!ok){
    await prisma.postJob.update({ where:{ id:jobId }, data:{ status:"FAILED", error:"Provider rate limit – retry in 5 min" }})
    return
  }

  await prisma.postJob.update({
    where:{ id: jobId },
    data:{
      status:"POSTED",
      externalId: fakeIds[provider],
      externalUrl: fakeUrls[provider],
      postedAt: new Date()
    }
  })

  const job = await prisma.postJob.findUnique({ where:{ id: jobId }})
  if(job?.clipId){
    await prisma.clip.update({ where:{ id: job.clipId }, data:{ status:"POSTED" }})
  }
}
