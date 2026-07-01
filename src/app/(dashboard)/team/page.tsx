"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function TeamPage(){
  const [data,setData]=useState<any>(null)
  const [name,setName]=useState("Clipper Team ID")
  const [invite,setInvite]=useState("editor@clipmaster.id, reviewer@clipmaster.id")

  const load=async()=>{ const r=await fetch("/api/team"); setData(await r.json()) }
  useEffect(()=>{ load() },[])

  const create=async()=>{
    const inviteEmails = invite.split(",").map(s=>s.trim()).filter(Boolean)
    const r=await fetch("/api/team",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({name, inviteEmails})})
    if(r.ok){ toast.success("Team dibuat"); load() } else toast.error("Gagal")
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div><h1 className="text-[26px] font-[750]">Tim Clipper</h1><p className="text-sm text-muted-foreground">Multi-user • role OWNER / EDITOR / REVIEWER / CLIPPER • approval workflow</p></div>

      <div className="card-soft p-5">
        <div className="font-semibold mb-3">Buat Team baru</div>
        <div className="grid sm:grid-cols-3 gap-3">
          <input value={name} onChange={e=>setName(e.target.value)} className="px-3 py-2.5 rounded-xl border bg-background sm:col-span-1" placeholder="Nama team"/>
          <input value={invite} onChange={e=>setInvite(e.target.value)} className="px-3 py-2.5 rounded-xl border bg-background sm:col-span-2" placeholder="invite email, comma"/>
        </div>
        <button onClick={create} className="mt-3 px-4 py-2 rounded-xl bg-[#FF3B5C] text-white text-sm">Create Team</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {(data?.owned||[]).map((t:any)=>(
          <div key={t.id} className="card-soft p-5">
            <div className="font-semibold">{t.name}</div>
            <div className="text-xs text-muted-foreground">{t.slug} • {t.members?.length||1}/{t.seats} seats</div>
            <div className="mt-3 space-y-2 text-sm">
              {(t.members||[]).map((m:any)=>(
                <div key={m.id} className="flex justify-between"><span>{m.user?.email||m.userId}</span><span className="text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">{m.role}</span></div>
              ))}
              {!t.members?.length && <div className="text-xs text-muted-foreground">Owner: Rian Clipper (you)</div>}
            </div>
          </div>
        ))}
        {(!data?.owned || data.owned.length===0) && <div className="text-sm text-muted-foreground">Belum ada team. Buat di atas.</div>}
      </div>

      <div className="card-soft p-5">
        <div className="font-semibold mb-2">Approval workflow</div>
        <div className="text-sm text-muted-foreground leading-relaxed">
          CLIPPER → submit → <b>IN_REVIEW</b> → REVIEWER approve/reject + timecode note → <b>APPROVED</b> → Editor export → <b>EXPORTED</b> → Post → <b>POSTED</b>.<br/>
          Endpoint: <code>POST /api/approvals</code> {`{clipId, status:"APPROVED"|"REJECTED"|"CHANGES_REQUESTED", note, timecodes}`}
        </div>
      </div>
    </div>
  )
}
