"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const res = await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirect: false,
    })
    setLoading(false)
    if (res?.ok) {
      toast.success("Masuk berhasil!")
      router.push("/dashboard")
      router.refresh()
    } else {
      toast.error("Email / password salah")
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-12 bg-[#0f1117] text-white">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF3B5C] flex items-center justify-center font-bold">CM</div>
            <span className="text-lg font-semibold">ClipMaster Pro</span>
          </div>
          <h2 className="text-[34px] font-[700] tracking-tight mt-16 leading-tight">
            Satu dashboard<br/>untuk seluruh<br/>tim clipper kamu.
          </h2>
          <ul className="mt-8 space-y-3 text-zinc-300 text-sm">
            <li>• Auto clip 60 detik AI score</li>
            <li>• Pipeline DRAFT → POSTED</li>
            <li>• Export 9:16 TikTok / Reels / Shorts</li>
            <li>• Full CRUD, optimistic UI</li>
          </ul>
        </div>
        <div className="text-sm text-zinc-400">Made for Youtuber clipper Indonesia 🇮🇩</div>
      </div>

      <div className="flex items-center justify-center p-8">
        <form onSubmit={onSubmit} className="w-full max-w-sm card-soft p-7">
          <h1 className="text-2xl font-[700]">Masuk ke ClipMaster</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Full-stack demo — Prisma + NextAuth</p>

          <label className="text-sm font-medium">Email</label>
          <input name="email" type="email" defaultValue="demo@clipmaster.id" required
            className="w-full mt-1 mb-4 px-3 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-[#FF3B5C]/30" />

          <label className="text-sm font-medium">Password</label>
          <input name="password" type="password" defaultValue="demo123" required
            className="w-full mt-1 mb-2 px-3 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-[#FF3B5C]/30" />

          <button disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-[#FF3B5C] text-white font-medium disabled:opacity-60">
            {loading ? "Masuk..." : "Masuk"}
          </button>

          <div className="text-xs text-muted-foreground mt-4">
            Demo: <b>demo@clipmaster.id</b> / <b>demo123</b>
          </div>
          <div className="text-xs mt-3">
            Belum punya akun? <Link href="/register" className="text-[#FF3B5C]">Daftar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
