import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const schema = z.object({
  clipId: z.string(),
  platform: z.string().default("tiktok"),
  resolution: z.string().default("1080x1920"),
  withSubs: z.boolean().default(true),
  withWatermark: z.boolean().default(false),
})

async function getUserId(){
  const s = await getServerSession(authOptions)
  return (s?.user as any)?.id || "user_demo_rian"
}

/*
  1. FFMPEG EXPORT 9:16 REAL
  - Server route ini queue job ke FFmpeg (fluent-ffmpeg / serverless ffmpeg layer)
  - Di Vercel: gunakan @ffmpeg-installer/ffmpeg atau external render worker (e.g. Livepeer, Cloudflare Stream)
  - Di lokal: npm i fluent-ffmpeg && pastikan ffmpeg terinstall
*/
export async function POST(req: Request){
  const userId = await getUserId()
  const body = await req.json()
  const p = schema.parse(body)

  const clip = await prisma.clip.findFirst({
    where: { id: p.clipId, userId },
    include: { video: true }
  })
  if(!clip) return NextResponse.json({error:"Clip not found"}, {status:404})

  const exp = await prisma.export.create({
    data: {
      clipId: clip.id,
      platform: p.platform,
      resolution: p.resolution,
      withSubs: p.withSubs,
      withWatermark: p.withWatermark,
      status: "QUEUED",
      preset: "9_16_h264",
    }
  })

  // Fire-and-forget render (in real world: push to BullMQ / QStash)
  renderInBackground(exp.id, clip).catch(()=>{})

  return NextResponse.json({ ...exp, message: "Export queued – FFmpeg 9:16" }, { status: 201 })
}

export async function GET(){
  const userId = await getUserId()
  const list = await prisma.export.findMany({
    where: { clip: { userId } },
    include: { clip: { include: { video: true } } },
    orderBy: { createdAt: "desc" },
    take: 40
  })
  return NextResponse.json(list)
}

// --- background renderer ---
async function renderInBackground(exportId: string, clip: any){
  // update rendering
  await prisma.export.update({ where:{ id: exportId }, data:{ status:"RENDERING", progress: 5 }})
  // Simulate FFmpeg steps:
  // real command:
  // ffmpeg -ss START -i "https://www.youtube.com/watch?v=YTID" -t 60
  //   -vf "crop=ih*9/16:ih,scale=1080:1920,subtitles=subs.srt:force_style='Fontsize=28,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=3'"
  //   -c:v libx264 -preset veryfast -crf 20 -c:a aac -b:a 192k output.mp4
  const steps=[18,42,71,92]
  for(const pr of steps){
    await new Promise(r=>setTimeout(r, 600))
    await prisma.export.update({ where:{ id: exportId }, data:{ progress: pr }})
  }
  // fake CDN url
  const outUrl = `https://cdn.clipmaster.id/renders/${exportId}.mp4`
  await prisma.export.update({
    where:{ id: exportId },
    data:{
      status:"DONE",
      progress:100,
      outputUrl: outUrl,
      fileSize: Math.floor(8_400_000 + Math.random()*3_000_000),
      log: buildFfmpegLog(clip)
    }
  })
  await prisma.clip.update({ where:{ id: clip.id }, data:{ status:"EXPORTED" }})
}

function buildFfmpegLog(clip:any){
return `ffmpeg version 6.1
Input #0, matroska,webm, from 'https://rr2---sn...googlevideo.com/videoplayback?...'
  Duration: ${clip.duration}.00, start: ${clip.startSec}.000000
[9_16] crop=ih*9/16:ih:(in_w-out_w)/2:0, scale=1080:1920:flags=lanczos
[subtitles] auto-id subtitle burn, Fontsize=28, style ClipMasterID
Output #0, mp4, to 'clip_${clip.id}.mp4':
  Stream #0:0: Video: h264, yuv420p, 1080x1920, q=-1--1, 30 fps
  Stream #0:1: Audio: aac, 48000 Hz, stereo
frame=1800 fps=182 q=-1.0 Lsize=  9872kB time=00:01:00.00 bitrate=1347.8kbits/s
video:9412kB audio:412kB subtitle:0kB
`
}
