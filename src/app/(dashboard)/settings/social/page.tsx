"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function SocialConnectPage(){
  const [accounts,setAccounts]=useState<any[]>([])
  const load=()=>{ /* fake – would GET /api/social-accounts */ setAccounts([
    {provider:'tiktok', handle:'@clipmasterid', active:true},
    {provider:'youtube', handle:'ClipMaster Shorts', active:true},
    {provider:'instagram', handle:'@clipmaster.id', active:true},
  ])}
  useEffect(load,[])
  const connect=(p:string)=>{
    toast(`OAuth ${p} – redirecting…`)
    // real: window.location.href = `/api/oauth/${p}/start`
    setTimeout(()=>{ toast.success(`${p} connected (demo)`); load() },1200)
  }
  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="text-[26px] font-[750]">Social Accounts</h1><p className="text-sm text-muted-foreground">OAuth 1-klik – TikTok / YouTube / Instagram</p></div>
      {[
        {id:'tiktok', name:'TikTok', desc:'Content Posting API – video 60s', color:'#000'},
        {id:'youtube', name:'YouTube Shorts', desc:'Data API v3 – upload + publish', color:'#FF0000'},
        {id:'instagram', name:'Instagram Reels', desc:'Graph API – Reels publish', color:'#E1306C'},
      ].map(s=>{
        const connected = accounts.find(a=>a.provider===s.id)
        return (
          <div key={s.id} className="card-soft p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold" style={{background:s.color}}>{s.name[0]}</div>
              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.desc}</div>
                {connected && <div className="text-[11px] text-emerald-600 mt-1">✓ {connected.handle} connected</div>}
              </div>
            </div>
            <button onClick={()=>connect(s.id)} className={`px-4 py-2 rounded-xl text-sm font-medium ${connected ? 'border' : 'bg-[#FF3B5C] text-white'}`}>
              {connected ? 'Reconnect' : 'Connect OAuth'}
            </button>
          </div>
        )
      })}
      <div className="card-soft p-5 text-xs text-muted-foreground leading-relaxed">
        <b>OAuth flow real:</b><br/>
        • TikTok: <code>https://www.tiktok.com/v2/auth/authorize/</code> → <code>/api/oauth/tiktok/callback</code> simpan access_token ke SocialAccount<br/>
        • YouTube: Google OAuth consent → scope <code>https://www.googleapis.com/auth/youtube.upload</code><br/>
        • Instagram: Meta Login → <code>instagram_content_publish</code><br/>
        Token auto-refresh via <code>refresh_token</code> di <code>SocialAccount</code> table.<br/>
        File handler: <code>src/app/api/oauth/[provider]/route.ts</code> (stub ready – tinggal isi CLIENT_ID/SECRET di .env)
      </div>
    </div>
  )
}
