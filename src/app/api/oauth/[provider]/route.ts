import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/oauth/tiktok/start  -> redirect to provider
// GET /api/oauth/tiktok/callback?code=...
export async function GET(req: Request, { params }: { params: { provider: string } }) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id || "user_demo_rian"

  if (!code) {
    // Step 1: redirect to OAuth authorize
    const providers: any = {
      tiktok: `https://www.tiktok.com/v2/auth/authorize/?client_key=${process.env.TIKTOK_CLIENT_KEY}&response_type=code&scope=user.info.basic,video.publish&redirect_uri=${encodeURIComponent(process.env.NEXTAUTH_URL + "/api/oauth/tiktok")}&state=clipmaster`,
      youtube: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.YOUTUBE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXTAUTH_URL + "/api/oauth/youtube")}&response_type=code&scope=https://www.googleapis.com/auth/youtube.upload&access_type=offline`,
      instagram: `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.IG_APP_ID}&redirect_uri=${encodeURIComponent(process.env.NEXTAUTH_URL + "/api/oauth/instagram")}&scope=instagram_basic,instagram_content_publish,pages_show_list`
    }
    const url = providers[params.provider]
    if (url && url.includes("undefined")) {
      // demo mode – no keys set
      return NextResponse.redirect(new URL("/settings/social?demo=1", process.env.NEXTAUTH_URL || "http://localhost:3000"))
    }
    if (url) return NextResponse.redirect(url)
    return NextResponse.json({ error: "Unknown provider" }, { status: 400 })
  }

  // Step 2: callback – exchange code → tokens (stub)
  // real: POST to provider token endpoint
  await prisma.socialAccount.upsert({
    where: { userId_provider_handle: { userId, provider: params.provider, handle: params.provider === "youtube" ? "ClipMaster Shorts" : params.provider === "tiktok" ? "@clipmasterid" : "@clipmaster.id" } },
    update: { accessToken: "demo_access_" + code.slice(0, 8), active: true },
    create: {
      userId,
      provider: params.provider,
      handle: params.provider === "youtube" ? "ClipMaster Shorts" : params.provider === "tiktok" ? "@clipmasterid" : "@clipmaster.id",
      accessToken: "demo_access_" + code.slice(0, 8),
      refreshToken: "demo_refresh",
      active: true
    }
  })

  return NextResponse.redirect(new URL("/settings/social?connected=" + params.provider, process.env.NEXTAUTH_URL || "http://localhost:3000"))
}
