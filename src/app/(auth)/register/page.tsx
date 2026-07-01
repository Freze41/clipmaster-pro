"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

export default function RegisterPage(){
  const [loading,setLoading]=useState(false)
  const router=useRouter()
  async function onSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()
    setLoading(true)
    const fd=new FormData(e.currentTarget)
    const res = await fetch("/api/auth/register",{method:"POST", headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      name: fd.get("name"), email: fd.get("email"), password: fd.get("password")
    })})
    setLoading(false)
    if(res.ok){ toast.success("Akun dibuat, silakan login"); router.push("/login") }
    else { const j=await res.json().catch(()=>({})); toast.error(j.error||"Gagal") }
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-[#fff6f7] to-white dark:from-[#13090b] dark:to-[#0b0c10]">
      <form onSubmit={onSubmit} className="w-full max-w-sm card-soft p-7">
        <h1 className="text-2xl font-[700]">Buat akun clipper</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-5">Gratis 14 hari Pro</p>
        <input name="name" placeholder="Nama kamu" required className="w-full mb-3 px-3 py-2.5 rounded-xl border bg-background"/>
        <input name="email" type="email" placeholder="email@domain.id" required className="w-full mb-3 px-3 py-2.5 rounded-xl border bg-background"/>
        <input name="password" type="password" placeholder="password min 6" required className="w-full mb-4 px-3 py-2.5 rounded-xl border bg-background"/>
        <button disabled={loading} className="w-full py-3 rounded-xl bg-[#FF3B5C] text-white font-medium">{loading?"...":"Daftar"}</button>
        <div className="text-xs mt-4">Sudah punya akun? <Link className="text-[#FF3B5C]" href="/login">Masuk</Link></div>
      </form>
    </div>
  )
}
