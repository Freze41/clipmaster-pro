import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number) {
  if (n >= 1_000_000) return (n/1_000_000).toFixed(n%1_000_000===0?0:1) + ' jt'
  if (n >= 1000) return (n/1000).toFixed(n%1000===0?0:1) + ' rb'
  return n.toString()
}

export function formatDuration(sec: number) {
  const h = Math.floor(sec/3600)
  const m = Math.floor((sec%3600)/60)
  const s = sec % 60
  if (h>0) return `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
  return `${m}:${s.toString().padStart(2,'0')}`
}

export function parseYouTubeId(input: string): string | null {
  if (!input) return null
  // plain ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input
  try {
    const url = new URL(input)
    if (url.hostname.includes('youtu.be')) return url.pathname.slice(1)
    if (url.searchParams.get('v')) return url.searchParams.get('v')
    const parts = url.pathname.split('/')
    const embedIdx = parts.indexOf('embed')
    if (embedIdx !== -1) return parts[embedIdx+1] || null
    const shortsIdx = parts.indexOf('shorts')
    if (shortsIdx !== -1) return parts[shortsIdx+1] || null
    return null
  } catch {
    return null
  }
}

export const platformMeta: Record<string,{label:string,color:string,aspect:string}> = {
  tiktok: { label: 'TikTok', color: '#000', aspect: '9:16' },
  reels: { label: 'Reels', color: '#E1306C', aspect: '9:16' },
  shorts: { label: 'Shorts', color: '#FF0000', aspect: '9:16' },
}
