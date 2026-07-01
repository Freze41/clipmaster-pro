import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { formatNumber } from "@/lib/utils"
import Link from "next/link"
import { Scissors, Eye, Clock, UploadCloud } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage(){
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id ?? ""
  // fallback to demo user when session missing in build
  const effectiveUserId = userId || "user_demo_rian"

  const [clipCount, totalViews, videos, recentClips] = await Promise.all([
    prisma.clip.count({ where: { userId: effectiveUserId }}),
    prisma.clip.aggregate({ _sum: { views: true }, where: { userId: effectiveUserId }}),
    prisma.video.count({ where: { userId: effectiveUserId }}),
    prisma.clip.findMany({ where: { userId: effectiveUserId }, include: { video: true }, orderBy: { createdAt: "desc" }, take: 6 })
  ])

  const stats = [
    { label: "Total Clip", value: clipCount.toString(), sub: "+4 minggu ini", icon: Scissors },
    { label: "Views Clip", value: formatNumber(totalViews._sum.views||0), sub: "3.2% CTR", icon: Eye },
    { label: "Video Source", value: videos.toString(), sub: "2 project aktif", icon: UploadCloud },
    { label: "Watch Time", value: "42.1 jam", sub: "AI retention", icon: Clock },
  ]

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-[750] tracking-tight">Halo, Rian 👋</h1>
          <p className="text-muted-foreground">Auto-klip momen terbaik ~60 detik. Siap viral hari ini?</p>
        </div>
        <div className="flex gap-2">
          <Link href="/clipper" className="px-4 py-2.5 rounded-xl bg-[#FF3B5C] text-white text-sm font-medium">+ Auto Clip Baru</Link>
          <Link href="/videos" className="px-4 py-2.5 rounded-xl border bg-card text-sm">Tambah Video</Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s=>{
          const Icon = s.icon
          return (
            <div key={s.label} className="card-soft p-5">
              <div className="flex items-center justify-between text-muted-foreground"><span className="text-xs">{s.label}</span><Icon size={16}/></div>
              <div className="text-[28px] font-[750] mt-2">{s.value}</div>
              <div className="text-xs text-emerald-600 mt-1">{s.sub}</div>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card-soft p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold">Clip Terbaru</div>
            <Link href="/clips" className="text-xs text-[#FF3B5C]">Lihat semua</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {recentClips.map(c=>(
              <div key={c.id} className="rounded-2xl border p-3 bg-[#fcfcfd] dark:bg-zinc-950">
                <div className="aspect-[9/13] rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 relative overflow-hidden">
                  <div className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full bg-black/60 text-white">00:{String(c.startSec%60).padStart(2,'0')} • 60s</div>
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium">{c.hookText}</div>
                  <div className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-full bg-[#FF3B5C] text-white">{c.score?.toFixed(1)}</div>
                </div>
                <div className="pt-3">
                  <div className="font-medium text-[13px] line-clamp-2 leading-snug">{c.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{c.video.channel} • {formatNumber(c.views)} views</div>
                </div>
              </div>
            ))}
            {recentClips.length===0 && <div className="text-sm text-muted-foreground">Belum ada clip.</div>}
          </div>
        </div>

        <div className="card-soft p-5">
          <div className="font-semibold mb-3">AI Suggestion Hari Ini</div>
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20">
              <div className="font-medium">Hook kuat terdeteksi</div>
              <div className="text-xs text-muted-foreground mt-1">Windah “jangan lah bang” score 94.7 – cocok Reels sore.</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20">
              <div className="font-medium">Mixue bisnis clip</div>
              <div className="text-xs text-muted-foreground mt-1">CTR prediksi 4.1% di TikTok. Publish jam 19:30.</div>
            </div>
            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200/60 dark:border-sky-500/20">
              <div className="font-medium">3 draft nganggur</div>
              <div className="text-xs text-muted-foreground mt-1">Selesaikan caption & export sebelum jam 8 malam.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
