"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function PostPage(){
  const [clips,setClips]=useState<any[]>([])
  const [jobs,setJobs]=useState<any[]>([])
  const [form,setForm]=useState({clipId:"", provider:"tiktok", caption:"", hashtags:"#fyp #viral #indonesia", scheduleAt:""})
  useEffect(()=>{ fetch("/api/clips?status=READY").then(r=>r.json()).then(setClips); loadJobs() },[])
  const loadJobs=()=> fetch("/api/post").then(r=>r.json()).then(setJobs)
  const submit=async(e:any)=>{
    e.preventDefault()
    const r=await fetch("/api/post",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...form, scheduleAt: form.scheduleAt || null})})
    if(r.ok){ toast.success("Post job dibuat"); loadJobs() } else toast.error("Gagal")
  }
  return (
    <div className="space-y-6 max-w-4xl">
      <div><h1 className="text-[26px] font-[750]">Auto-Post Social</h1><p className="text-sm text-muted-foreground">TikTok • YouTube Shorts • Instagram Reels — API ready</p></div>
      <form onSubmit={submit} className="card-soft p-5 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="text-xs">Clip READY</label>
            <select required value={form.clipId} onChange={e=>setForm({...form,clipId:e.target.value})} className="w-full mt-1 px-3 py-2.5 rounded-xl border bg-background">
              <option value="">— pilih clip —</option>
              {clips.map((c:any)=><option key={c.id} value={c.id}>{c.title.slice(0,60)}</option>)}
            </select>
          </div>
          <div><label className="text-xs">Provider</label>
            <select value={form.provider} onChange={e=>setForm({...form,provider:e.target.value})} className="w-full mt-1 px-3 py-2.5 rounded-xl border bg-background">
              <option value="tiktok">TikTok Content Posting API</option>
              <option value="youtube">YouTube Shorts API</option>
              <option value="instagram">Instagram Reels Graph API</option>
            </select>
          </div>
        </div>
        <div><label className="text-xs">Caption</label>
          <textarea value={form.caption} onChange={e=>setForm({...form,caption:e.target.value})} required rows={3} className="w-full mt-1 px-3 py-2.5 rounded-xl border bg-background" placeholder="Hook + CTA Indonesia..."/>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={form.hashtags} onChange={e=>setForm({...form,hashtags:e.target.value})} className="px-3 py-2.5 rounded-xl border bg-background" placeholder="#fyp #viral"/>
          <input type="datetime-local" value={form.scheduleAt} onChange={e=>setForm({...form,scheduleAt:e.target.value})} className="px-3 py-2.5 rounded-xl border bg-background"/>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-[#FF3B5C] text-white text-sm">🚀 Post / Schedule</button>
        <div className="text-[11px] text-muted-foreground">Kosongkan schedule = post langsung. Integrate akun di Settings → Social Accounts.</div>
      </form>

      <div className="card-soft p-5">
        <div className="font-semibold mb-3">Post Jobs</div>
        <div className="space-y-2 text-sm max-h-[420px] overflow-auto">
          {jobs.map((j:any)=>(
            <div key={j.id} className="flex items-center justify-between border-b py-2">
              <div><b>{j.provider}</b> • {j.clip?.title?.slice(0,45)}<div className="text-xs text-muted-foreground">{j.caption?.slice(0,80)}</div></div>
              <div className="text-right text-xs">
                <div className="pill">{j.status}</div>
                {j.externalUrl && <a href={j.externalUrl} target="_blank" className="text-[#FF3B5C]">buka →</a>}
              </div>
            </div>
          ))}
          {jobs.length===0 && <div className="text-muted-foreground">Belum ada job.</div>}
        </div>
      </div>
    </div>
  )
}
