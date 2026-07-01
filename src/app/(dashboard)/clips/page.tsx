"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { formatNumber, platformMeta } from "@/lib/utils"

type Clip = {
  id:string; title:string; startSec:number; endSec:number; score:number|null;
  status:string; platform:string; views:number; likes:number; hookText:string|null; tags:string|null;
  videoId?: string;
  video: { channel:string; youtubeId:string; title:string }
}

export default function ClipsPage(){
  const [items,setItems]=useState<Clip[]>([])
  const [loading,setLoading]=useState(true)
  const [q,setQ]=useState("")
  const [status,setStatus]=useState("")
  const [platform,setPlatform]=useState("")
  const [editing,setEditing]=useState<Clip|null>(null)

  const load = async()=>{
    setLoading(true)
    const p = new URLSearchParams()
    if(q) p.set("q",q)
    if(status) p.set("status",status)
    if(platform) p.set("platform",platform)
    const r = await fetch("/api/clips?"+p.toString(), {cache:"no-store"})
    const j = await r.json()
    setItems(j)
    setLoading(false)
  }
  useEffect(()=>{ load() }, [q,status,platform])

  async function remove(id:string){
    const prev=items
    setItems(items.filter(c=>c.id!==id))
    const r = await fetch(`/api/clips/${id}`, {method:"DELETE"})
    if(!r.ok){ toast.error("Gagal"); setItems(prev)} else toast.success("Dihapus")
  }

  async function quickStatus(id:string, s:string){
    setItems(items.map(c=> c.id===id ? {...c, status:s}:c))
    await fetch(`/api/clips/${id}`, { method:"PUT", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({ status:s })})
    toast.success("Status: "+s)
  }

  // Export FFmpeg 9:16
  async function doExport(c: Clip){
    toast("Queue FFmpeg 9:16…")
    const r = await fetch("/api/export", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({
      clipId: c.id, platform: c.platform, resolution:"1080x1920", withSubs:true, withWatermark:false
    })})
    if(r.ok){ toast.success("Export rendering! Cek /exports"); quickStatus(c.id, "EXPORTED") }
    else toast.error("Export gagal")
  }

  // Auto-Post
  const [posting,setPosting]=useState<string|null>(null)
  async function doPost(c: Clip){
    const caption = prompt(`Caption ${c.platform}:\n`, `${c.hookText||c.title}\n#fyp #viral #clipmaster`)
    if(!caption) return
    setPosting(c.id)
    const r = await fetch("/api/post", { method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        clipId: c.id,
        provider: c.platform==="shorts" ? "youtube" : c.platform==="reels" ? "instagram" : "tiktok",
        caption,
        hashtags: "#fyp #viral #indonesia"
      })
    })
    setPosting(null)
    if(r.ok){ const j=await r.json(); toast.success("Posted! "+(j.externalUrl||j.status)); quickStatus(c.id,"POSTED") }
    else toast.error("Post gagal")
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-[750]">Koleksi Clip</h1>
          <p className="text-sm text-muted-foreground">Full CRUD • optimistic update • pipeline status</p>
        </div>
        <a href="/clipper" className="px-4 py-2.5 rounded-xl bg-[#FF3B5C] text-white text-sm font-medium">+ Clip Baru</a>
      </div>

      <div className="card-soft p-3 flex flex-wrap gap-2 items-center text-sm">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari clip / hook…" className="px-3 py-2 rounded-xl border bg-background flex-1 min-w-[220px]"/>
        <select value={status} onChange={e=>setStatus(e.target.value)} className="px-3 py-2 rounded-xl border bg-background">
          <option value="">Semua status</option>
          <option>DRAFT</option><option>READY</option><option>EXPORTED</option><option>POSTED</option>
        </select>
        <select value={platform} onChange={e=>setPlatform(e.target.value)} className="px-3 py-2 rounded-xl border bg-background">
          <option value="">Semua platform</option>
          <option value="tiktok">TikTok</option>
          <option value="reels">Reels</option>
          <option value="shorts">Shorts</option>
        </select>
        <div className="text-xs text-muted-foreground ml-auto">{items.length} clip</div>
      </div>

      {loading ? <div className="text-sm text-muted-foreground">Memuat…</div> : items.length===0 ? (
        <div className="card-soft p-12 text-center">
          <div className="text-xl">✂️</div>
          <div className="font-semibold mt-2">Tidak ada clip cocok</div>
          <p className="text-sm text-muted-foreground">Coba reset filter atau buat clip di Auto Clipper.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(c=>(
            <div key={c.id} className="card-soft p-4 flex flex-col">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="pill bg-zinc-100 dark:bg-zinc-900">{platformMeta[c.platform]?.label || c.platform}</span>
                <span className={`pill ${c.status==="READY"?"bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300": c.status==="POSTED"?"bg-sky-50 text-sky-700":"bg-zinc-100 dark:bg-zinc-800 text-zinc-600"}`}>{c.status}</span>
                {c.score && <span className="ml-auto font-[650] text-emerald-600">{c.score.toFixed(1)}</span>}
              </div>
              <div className="font-[600] mt-3 text-[14px] leading-snug line-clamp-2">{c.title}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{c.video.channel}</div>
              {c.hookText && <div className="text-xs mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10">“{c.hookText}”</div>}
              <div className="text-[11px] text-muted-foreground mt-3">{formatNumber(c.views)} views • {formatNumber(c.likes)} likes • 9:16 • 60s</div>
              <div className="flex gap-1.5 mt-3 flex-wrap text-[11px]">
                {(c.tags||"").split(",").filter(Boolean).slice(0,3).map(t=> <span key={t} className="px-2 py-1 rounded-full bg-zinc-50 dark:bg-zinc-900 border">#{t}</span>)}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <button onClick={()=>doExport(c)} className="px-3 py-2 rounded-xl bg-[#111827] text-white font-medium">⬇️ Export 9:16</button>
                <button onClick={()=>doPost(c)} disabled={posting===c.id} className="px-3 py-2 rounded-xl bg-[#FF3B5C] text-white font-medium disabled:opacity-60">
                  {posting===c.id ? "Posting…" : "🚀 Post"}
                </button>
              </div>
              <div className="flex gap-2 mt-2 text-[11px]">
                <button onClick={()=>setEditing(c)} className="px-3 py-1.5 rounded-lg border">Edit</button>
                <select onChange={e=>quickStatus(c.id,e.target.value)} value={c.status} className="px-2 py-1.5 rounded-lg border bg-background flex-1">
                  <option>DRAFT</option><option>IN_REVIEW</option><option>APPROVED</option><option>READY</option><option>EXPORTED</option><option>POSTED</option><option>REJECTED</option>
                </select>
                <button onClick={()=>remove(c.id)} className="px-3 py-1.5 rounded-lg border text-rose-600">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && <EditClip clip={editing} onClose={()=>setEditing(null)} onSaved={load} />}
    </div>
  )
}

function EditClip({clip,onClose,onSaved}:{clip:Clip; onClose:()=>void; onSaved:()=>void}){
  const [form,setForm]=useState({...clip})
  const [saving,setSaving]=useState(false)
  async function save(e:React.FormEvent){
    e.preventDefault(); setSaving(true)
    const r = await fetch(`/api/clips/${clip.id}`, {method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form)})
    setSaving(false)
    if(r.ok){ toast.success("Tersimpan"); onSaved(); onClose() } else toast.error("Gagal")
  }
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form onClick={e=>e.stopPropagation()} onSubmit={save} className="card-soft w-full max-w-xl p-6 space-y-3">
        <div className="text-lg font-[700]">Edit Clip</div>
        <input className="w-full px-3 py-2.5 rounded-xl border" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
        <input className="w-full px-3 py-2.5 rounded-xl border" placeholder="Hook text" value={form.hookText||""} onChange={e=>setForm({...form, hookText:e.target.value})}/>
        <div className="grid grid-cols-3 gap-3">
          <select className="px-3 py-2.5 rounded-xl border bg-background" value={form.platform} onChange={e=>setForm({...form, platform:e.target.value})}>
            <option value="tiktok">TikTok</option>
            <option value="reels">Reels</option>
            <option value="shorts">Shorts</option>
          </select>
          <select className="px-3 py-2.5 rounded-xl border bg-background" value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
            <option>DRAFT</option><option>READY</option><option>EXPORTED</option><option>POSTED</option>
          </select>
          <input className="px-3 py-2.5 rounded-xl border" placeholder="tags, comma" value={form.tags||""} onChange={e=>setForm({...form, tags:e.target.value})}/>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border">Batal</button>
          <button disabled={saving} className="px-4 py-2 rounded-xl bg-[#FF3B5C] text-white">{saving?"...":"Simpan"}</button>
        </div>
      </form>
    </div>
  )
}
