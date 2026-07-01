"use client"
import { useState } from "react"
import { toast } from "sonner"
import { formatDuration, parseYouTubeId } from "@/lib/utils"

type Moment = { id:string; startSec:number; endSec:number; label:string; score:number; emotion:string; reason:string|null }
type DetectRes = { video:any; moments:Moment[]; targetSec:number }

export default function ClipperPage(){
  const [url,setUrl]=useState("https://youtube.com/watch?v=kJQP7kiw5Fk")
  const [target,setTarget]=useState(60)
  const [loading,setLoading]=useState(false)
  const [res,setRes]=useState<DetectRes|null>(null)

  async function analyze(){
    const yid = parseYouTubeId(url)
    if(!yid){ toast.error("URL tidak valid"); return }
    setLoading(true)
    try{
      const r = await fetch("/api/ai/detect", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ youtubeUrl: url, targetSec: target })})
      const j = await r.json()
      if(!r.ok) throw new Error(j.error||"gagal")
      setRes(j)
      toast.success(`${j.moments.length} momen ditemukan`)
    }catch(e:any){ toast.error(e.message) }
    setLoading(false)
  }

  async function createClip(m:Moment){
    if(!res) return
    const r = await fetch("/api/clips", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        videoId: res.video.id,
        title: m.label+" — "+res.video.channel,
        startSec: m.startSec,
        endSec: m.endSec,
        platform: "tiktok",
        hookText: m.reason || m.label,
        score: m.score,
        tags: "ai,auto"
      })
    })
    if(r.ok){ toast.success("Clip 60s dibuat! Cek Koleksi Clip.") }
    else toast.error("Gagal buat clip")
  }

  const yidPreview = parseYouTubeId(url)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-[750]">Auto Clipper AI</h1>
        <p className="text-sm text-muted-foreground">Paste URL YouTube panjang → AI cari 5 momen terbaik ±60 detik • Hook score • Emosi</p>
      </div>

      <div className="card-soft p-5 grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          <label className="text-xs font-medium">YouTube URL</label>
          <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full px-3 py-3 rounded-xl border bg-background"/>
          <div className="flex gap-3 items-center">
            <div>
              <label className="text-xs font-medium">Durasi clip</label>
              <select value={target} onChange={e=>setTarget(parseInt(e.target.value))} className="ml-2 px-3 py-2 rounded-xl border bg-background text-sm">
                <option value={30}>30s</option>
                <option value={45}>45s</option>
                <option value={60}>60s</option>
                <option value={90}>90s</option>
              </select>
            </div>
            <button onClick={analyze} disabled={loading} className="ml-auto px-5 py-2.5 rounded-xl bg-[#FF3B5C] text-white text-sm font-medium disabled:opacity-60">
              {loading? "Menganalisis AI..." : "🔎 Analisis AI"}
            </button>
          </div>
          <div className="text-[11px] text-muted-foreground">ID: {yidPreview || "-"} • Model clipmaster-ai-id-v2 • confidence 92%</div>
        </div>
        <div className="rounded-2xl border bg-zinc-950 text-white p-4 min-h-[160px]">
          <div className="text-[11px] opacity-70">PREVIEW</div>
          {yidPreview ? (
            <div className="mt-2 aspect-video rounded-lg overflow-hidden bg-zinc-800">
              {/* iframe works when running locally */}
              <iframe
                src={`https://www.youtube.com/embed/${yidPreview}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : <div className="text-sm opacity-60 mt-6">Paste URL untuk preview</div>}
        </div>
      </div>

      {loading && (
        <div className="card-soft p-8 text-center">
          <div className="animate-pulse">🤖 AI sedang scan retention, emosi, audio spike…</div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-2 rounded mt-4 overflow-hidden">
            <div className="h-2 bg-[#FF3B5C] w-2/3 animate-pulse"/>
          </div>
        </div>
      )}

      {res && !loading && (
        <div className="space-y-4">
          <div className="card-soft p-5">
            <div className="font-semibold">{res.video.title}</div>
            <div className="text-xs text-muted-foreground">{res.video.channel} • {formatDuration(res.video.duration)} • {res.moments.length} kandidat</div>
            {/* timeline */}
            <div className="mt-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden">
              {res.moments.map(m=>{
                const left = (m.startSec / res.video.duration)*100
                const width = (target / res.video.duration)*100
                return <div key={m.id} title={m.label} className="absolute top-1 bottom-1 bg-[#FF3B5C]/80 rounded" style={{left: left+"%", width: Math.max(width,2.5)+"%"}}/>
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {res.moments.map((m,i)=>(
              <div key={m.id} className="card-soft p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] text-muted-foreground">#{i+1} • {m.emotion}</div>
                    <div className="font-[650]">{m.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{m.reason}</div>
                    <div className="text-[12px] mt-2">{formatDuration(m.startSec)} → {formatDuration(m.endSec)} • {target}s</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-muted-foreground">AI Score</div>
                    <div className="text-xl font-[750] text-emerald-600">{m.score}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={()=>createClip(m)} className="px-3 py-2 rounded-xl bg-[#FF3B5C] text-white text-xs font-medium">✂️ Clip {target}s</button>
                  <button className="px-3 py-2 rounded-xl border text-xs">Preview</button>
                  <button className="px-3 py-2 rounded-xl border text-xs">Edit timecode</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!res && !loading && (
        <div className="card-soft p-12 text-center text-muted-foreground">
          Masukkan URL YouTube lalu klik Analisis AI.<br/>Contoh seed: Windah, Deddy, Tanboy Kun sudah tersedia di Video Library.
        </div>
      )}
    </div>
  )
}
