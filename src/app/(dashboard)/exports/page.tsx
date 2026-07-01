"use client"
import { useEffect, useState } from "react"

export default function ExportsPage(){
  const [items,setItems]=useState<any[]>([])
  useEffect(()=>{ fetch("/api/export").then(r=>r.json()).then(setItems); const t=setInterval(()=>fetch("/api/export").then(r=>r.json()).then(setItems),2500); return ()=>clearInterval(t)},[])
  return (
    <div className="space-y-5">
      <h1 className="text-[26px] font-[750]">Export Queue – FFmpeg 9:16</h1>
      <p className="text-sm text-muted-foreground -mt-3">Real render pipeline: crop → scale 1080x1920 → subtitles burn → h264</p>
      <div className="card-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-[11px] text-muted-foreground border-b"><th className="text-left p-3">Clip</th><th>Preset</th><th>Status</th><th>Progress</th><th>Output</th></tr></thead>
          <tbody>
            {items.map(e=>(
              <tr key={e.id} className="border-b last:border-0">
                <td className="p-3">{e.clip?.title?.slice(0,48)}</td>
                <td>{e.resolution} • {e.preset}</td>
                <td><span className="pill">{e.status}</span></td>
                <td style={{minWidth:140}}>
                  <div className="w-32 bg-zinc-100 dark:bg-zinc-800 h-2 rounded"><div className="h-2 bg-[#FF3B5C] rounded" style={{width:e.progress+"%"}}/></div>
                </td>
                <td>{e.outputUrl ? <a className="text-[#FF3B5C]" href={e.outputUrl} target="_blank">Download MP4</a> : "—"}</td>
              </tr>
            ))}
            {items.length===0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Belum ada export. Export dari Koleksi Clip.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-muted-foreground">FFmpeg log tersimpan di kolom <code>log</code>. Command real ada di <code>/api/export/route.ts</code>.</div>
    </div>
  )
}
