"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Film, Scissors, Library, BarChart3, Settings, Users, Sparkles, Download, Send } from "lucide-react"

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/videos", label: "Video Library", icon: Film },
  { href: "/clipper", label: "Auto Clipper", icon: Scissors, badge: "AI" },
  { href: "/clips", label: "Koleksi Clip", icon: Library },
  { href: "/exports", label: "Export FFmpeg", icon: Download, badge: "NEW" },
  { href: "/post", label: "Auto-Post", icon: Send },
  { href: "/team", label: "Team", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Pengaturan", icon: Settings },
]

export default function Sidebar(){
  const pathname = usePathname()
  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 flex-col border-r bg-white dark:bg-[#11131a] z-30">
      <div className="h-16 px-6 flex items-center gap-3 border-b">
        <div className="w-9 h-9 rounded-xl bg-[#FF3B5C] text-white flex items-center justify-center font-bold">CM</div>
        <div>
          <div className="font-[700] leading-tight">ClipMaster Pro</div>
          <div className="text-[11px] text-muted-foreground -mt-0.5">Youtuber Clipper</div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {nav.map(item=>{
          const active = pathname===item.href || pathname.startsWith(item.href+"/")
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition",
                active ? "bg-[#fff0f3] text-[#d81e45] dark:bg-[#FF3B5C]/10 dark:text-[#ff6a84] font-medium"
                       : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
              )}>
              <Icon size={18}/>
              <span className="flex-1">{item.label}</span>
              {item.badge && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FF3B5C] text-white font-semibold">{item.badge}</span>}
            </Link>
          )
        })}
        <div className="pt-4 mt-4 border-t text-[12px] text-muted-foreground px-3">PROJECTS</div>
        <div className="px-3 py-2 text-sm">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#FF3B5C]"></span> Windah Basudara</div>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-violet-500"></span> Deddy Podcast</div>
        </div>
      </nav>
      <div className="p-4 border-t">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-[#FF3B5C] to-[#ff7a59] text-white text-sm">
          <div className="flex items-center gap-2 font-semibold"><Sparkles size={16}/> Pro Plan</div>
          <div className="opacity-90 mt-1 text-[12px]">Unlimited AI clips • 3 seat</div>
          <div className="w-full bg-white/25 h-1.5 rounded mt-3"><div className="h-1.5 bg-white rounded w-[68%]"/></div>
          <div className="text-[11px] mt-1 opacity-90">342 / 500 export bulan ini</div>
        </div>
      </div>
    </aside>
  )
}
