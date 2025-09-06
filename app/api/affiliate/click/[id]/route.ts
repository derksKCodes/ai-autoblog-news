import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const { id } = params

    // Get affiliate link
    const { data: affiliateLink, error } = await supabase
      .from("affiliate_links")
      .select("affiliate_url")
      .eq("id", id)
      .eq("is_active", true)
      .single()

    if (error || !affiliateLink) {
      return NextResponse.json({ error: "Affiliate link not found" }, { status: 404 })
    }

    // Track the click
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || ""
    const referrer = request.headers.get("referer") || ""

    await supabase.from("affiliate_clicks").insert({
      affiliate_link_id: id,
      ip_address: clientIP,
      user_agent: userAgent,
      referrer: referrer,
    })

    // Redirect to affiliate URL
    return NextResponse.redirect(affiliateLink.affiliate_url)
  } catch (error) {
    console.error("Affiliate click tracking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
