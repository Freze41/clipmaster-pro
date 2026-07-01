"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { formatDuration, formatNumber, parseYouTubeId } from "@/lib/utils"

type Video = {
  id: string; youtubeId:string; title:string; channel:string; duration:number; views:number; url:string; createdAt:string;
}

export default function VideosPage(){
  const [items,setItems]=useState<Video[]>([])
  const [loading,setLoading]=useState(true)
  const [open,setOpen]=useState(false)
  const [editing,setEditing]=useState<Video|null>(null)
  const [q,setQ]=useState("")

  const load = async()=>{
    setLoading(true)
    const r = await fetch("/api/videos?q="+encodeURIComponent(q), {cache:"no-store"})
    const j = await r.json()
    setItems(j)
    setLoading(false)
  }
  useEffect(()=>{ load() }, [q])

  async function remove(id:string){
    if(!confirm("Hapus video ini? Clips terkait ikut terhapus.")) return
    const prev=[...items]
    setItems(items.filter(v=>v.id!==id)) // optimistic
    const res = await fetch(`/api/videos/${id}`, {method:"DELETE"})
    if(!res.ok){ toast.error("Gagal hapus"); setItems(prev)} else toast.success("Terhapus")
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-[750]">Video Library</h1>
          <p className="text-sm text-muted-foreground">CRUD source YouTube. Auto extract ID & metadata.</p>
        </div>
        <button onClick={()=>{setEditing(null);setOpen(true)}} className="px-4 py-2.5 rounded-xl bg-[#FF3B5C] text-white text-sm font-medium">+ Tambah Video</button>
      </div>

      <div className="card-soft p-4 flex gap-3 items-center">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari judul / channel…" className="flex-1 px-3 py-2 rounded-xl border bg-background text-sm outline-none"/>
        <div className="text-xs text-muted-foreground">{items.length} video</div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i)=><div key={i} className="card-soft p-4 h-56 animate-pulse bg-zinc-100 dark:bg-zinc-900"/>)}
        </div>
      ) : items.length===0 ? (
        <div className="card-soft p-12 text-center">
          <div className="text-2xl">🎬</div>
          <div className="font-semibold mt-2">Belum ada video</div>
          <div className="text-sm text-muted-foreground mt-1">Tambah URL YouTube pertama kamu</div>
          <button onClick={()=>setOpen(true)} className="mt-4 px-4 py-2 rounded-xl bg-[#FF3B5C] text-white text-sm">Tambah Video</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(v=>(
            <div key={v.id} className="card-soft overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-zinc-800 to-zinc-600 relative">
                <img src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`} alt="" className="w-full h-full object-cover opacity-90" />
                <div className="absolute bottom-2 right-2 text-[11px] px-2 py-1 rounded bg-black/70 text-white">{formatDuration(v.duration)}</div>
              </div>
              <div className="p-4">
                <div className="font-[600] text-[14px] line-clamp-2">{v.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{v.channel} • {formatNumber(v.views)} views</div>
                <div className="flex gap-2 mt-3 text-xs">
                  <a href={v.url} target="_blank" className="px-3 py-1.5 rounded-lg border">Buka</a>
                  <button onClick={()=>{setEditing(v);setOpen(true)}} className="px-3 py-1.5 rounded-lg border">Edit</button>
                  <button onClick={()=>remove(v.id)} className="px-3 py-1.5 rounded-lg border text-rose-600 ml-auto">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && <VideoModal initial={editing} onClose={()=>setOpen(false)} onSaved={()=>{setOpen(false); load()}} />}
    </div>
  )
}

function VideoModal({ initial, onClose, onSaved }:{ initial: Video|null; onClose:()=>void; onSaved:()=>void }){
  const [saving,setSaving]=useState(false)
  const [url,setUrl]=useState(initial?.url || "")
  const [title,setTitle]=useState(initial?.title || "")
  const [channel,setChannel]=useState(initial?.channel || "")
  const [duration,setDuration]=useState(initial?.duration || 900)

  async function submit(e:React.FormEvent){
    e.preventDefault()
    setSaving(true)
    const youtubeId = parseYouTubeId(url)
    if(!youtubeId){ toast.error("URL YouTube tidak valid"); setSaving(false); return }
    const body = { youtubeId, url, title: title || "Untitled Video", channel: channel || "Unknown", duration }
    const res = await fetch(initial ? `/api/videos/${initial.id}` : "/api/videos", {
      method: initial ? "PUT" : "POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(body)
    })
    setSaving(false)
    if(res.ok){ toast.success(initial?"Tersimpan":"Video ditambahkan"); onSaved() }
    else toast.error("Gagal simpan")
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form onClick={e=>e.stopPropagation()} onSubmit={submit} className="card-soft w-full max-w-lg p-6 space-y-4 animate-in">
        <div className="text-lg font-[700]">{initial ? "Edit Video" : "Tambah Video YouTube"}</div>
        <div>
          <label className="text-xs font-medium">YouTube URL / ID</label>
          <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full mt-1 px-3 py-2.5 rounded-xl border bg-background" required/>
          <div className="text-[11px] text-muted-foreground mt-1">Auto parse ID: {parseYouTubeId(url) || "-"}</div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium">Judul</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border bg-background"/>
          </div>
          <div>
            <label className="text-xs font-medium">Channel</label>
            <input value={channel} onChange={e=>setChannel(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border bg-background"/>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium">Durasi (detik)</label>
          <input type="number" value={duration} onChange={e=>setDuration(parseInt(e.target.value)||0)} className="w-full mt-1 px-3 py-2.5 rounded-xl border bg-background"/>
          <div className="text-[11px] text-muted-foreground mt-1">{formatDuration(duration)}</div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border">Batal</button>
          <button disabled={saving} className="px-4 py-2 rounded-xl bg-[#FF3B5C] text-white">{saving?"Menyimpan...": initial?"Simpan":"Tambah"}</button>
        </div>
      </form>
    </div>
  )
}
