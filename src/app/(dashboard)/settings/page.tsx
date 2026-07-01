export default function SettingsPage(){
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-[26px] font-[750]">Pengaturan</h1>
      <div className="card-soft p-6 space-y-4">
        <div className="font-semibold">Profil Clipper</div>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><div className="text-xs text-muted-foreground">Nama</div><input defaultValue="Rian Clipper" className="w-full mt-1 px-3 py-2 rounded-xl border bg-background"/></div>
          <div><div className="text-xs text-muted-foreground">Email</div><input defaultValue="demo@clipmaster.id" className="w-full mt-1 px-3 py-2 rounded-xl border bg-background"/></div>
          <div><div className="text-xs text-muted-foreground">Role</div><input defaultValue="Youtuber Clipper • Pro" className="w-full mt-1 px-3 py-2 rounded-xl border bg-background"/></div>
          <div><div className="text-xs text-muted-foreground">Tim</div><input defaultValue="Solo — 1 seat" className="w-full mt-1 px-3 py-2 rounded-xl border bg-background"/></div>
        </div>
      </div>

      <div className="card-soft p-6 space-y-3">
        <div className="font-semibold">AI Clipper</div>
        <div className="text-sm grid sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked/> Auto hook text Indonesia</label>
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked/> Score virality 0-100</label>
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked/> Deteksi emosi</label>
          <label className="flex items-center gap-2"><input type="checkbox"/> Auto subtitle burn-in</label>
        </div>
      </div>

      <div className="card-soft p-6 space-y-3">
        <div className="font-semibold">Export Defaults</div>
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div><div className="text-xs text-muted-foreground">Aspect</div><select className="w-full mt-1 px-3 py-2 rounded-xl border bg-background"><option>9:16</option><option>1:1</option><option>16:9</option></select></div>
          <div><div className="text-xs text-muted-foreground">Resolusi</div><select className="w-full mt-1 px-3 py-2 rounded-xl border bg-background"><option>1080x1920</option><option>720x1280</option></select></div>
          <div><div className="text-xs text-muted-foreground">Durasi target</div><select className="w-full mt-1 px-3 py-2 rounded-xl border bg-background"><option>60 detik</option><option>45 detik</option><option>30 detik</option></select></div>
        </div>
        <button className="px-4 py-2 rounded-xl bg-[#FF3B5C] text-white text-sm">Simpan Pengaturan</button>
      </div>

      <div className="text-xs text-muted-foreground">ClipMaster Pro v1.0 • Prisma SQLite • NextAuth • Indonesia</div>
    </div>
  )
}
