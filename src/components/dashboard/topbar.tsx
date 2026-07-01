"use client"
import { useSession, signOut } from "next-auth/react"
import { Bell, Search } from "lucide-react"

export default function Topbar(){
  const { data } = useSession()
  return (
    <div className="h-16 border-b bg-white/80 dark:bg-[#11131a]/80 backdrop-blur sticky top-0 z-20">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center gap-4">
        <div className="flex-1 max-w-xl relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16}/>
          <input placeholder="Cari clip, video, hook..." className="w-full pl-9 pr-3 py-2 rounded-xl border bg-[#f7f7f9] dark:bg-zinc-900 text-sm outline-none focus:ring-2 focus:ring-[#FF3B5C]/25"/>
        </div>
        <div className="flex-1 sm:hidden font-semibold">ClipMaster</div>
        <button className="relative p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900">
          <Bell size={18}/>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF3B5C] rounded-full"/>
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium leading-tight">{data?.user?.name || "Rian Clipper"}</div>
            <div className="text-[11px] text-muted-foreground">Pro • {data?.user?.email || "demo@clipmaster.id"}</div>
          </div>
          <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data?.user?.name||'RC')}`} className="w-9 h-9 rounded-xl border bg-white" alt=""/>
          <button onClick={()=>signOut({callbackUrl:'/login'})} className="text-xs text-muted-foreground hover:text-foreground">Keluar</button>
        </div>
      </div>
    </div>
  )
}
