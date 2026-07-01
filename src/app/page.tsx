import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fff7f8] to-white dark:from-[#12070a] dark:to-[#0b0c10]">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#FF3B5C] flex items-center justify-center text-white font-bold">CM</div>
          <span className="font-semibold text-lg">ClipMaster Pro</span>
          <span className="pill bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">AI Clipper v1</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-[750] tracking-tight max-w-3xl leading-[1.05]">
          Auto-klip <span className="text-[#FF3B5C]">momen terbaik 60 detik</span> dari YouTube panjang.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
          Dibangun untuk tim clipper Youtuber Indonesia. Upload URL → AI deteksi hook → export TikTok / Reels / Shorts. Full-stack Next.js + Prisma.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/login" className="px-5 py-3 rounded-xl bg-[#FF3B5C] text-white font-medium shadow-sm hover:opacity-95">Coba Dashboard</Link>
          <a href="https://github.com" className="px-5 py-3 rounded-xl border bg-card">Lihat Kode</a>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-5 text-sm">
          {[
            {t:'12 clip siap', s:'Seed Indonesia: Windah, Deddy, Tanboy'},
            {t:'AI Score 85–97', s:'Hook, emosi, retention detection'},
            {t:'Full CRUD', s:'Videos • Clips • Projects • Exports'},
          ].map(x=>(
            <div key={x.t} className="card-soft p-5">
              <div className="font-semibold">{x.t}</div>
              <div className="text-muted-foreground mt-1">{x.s}</div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-sm text-muted-foreground">
          Demo login: <b>demo@clipmaster.id</b> / <b>demo123</b>
        </div>
      </div>
    </main>
  )
}
