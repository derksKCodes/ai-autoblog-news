import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ContentProcessor } from "@/lib/content-processor"

export async function POST(request: NextRequest) {
  try {
    const { sourceId } = await request.json()

    if (!sourceId) {
      return NextResponse.json({ error: "Source ID is required" }, { status: 400 })
    }

    const processor = new ContentProcessor()
    await processor.processRSSSource(sourceId)

    return NextResponse.json({ success: true, message: "RSS source processed successfully" })
  } catch (error) {
    console.error("Error processing RSS source:", error)
    return NextResponse.json({ error: "Failed to process RSS source" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const processor = new ContentProcessor()

    // Get all active RSS sources
    const { data: sources, error } = await supabase
      .from("rss_sources")
      .select("*")
      .eq("is_active", true)
      .order("last_fetched", { ascending: true, nullsFirst: true })

    if (error) {
      throw error
    }

    const results = []

    for (const source of sources) {
      try {
        // Check if enough time has passed since last fetch
        const now = new Date()
        const lastFetched = source.last_fetched ? new Date(source.last_fetched) : new Date(0)
        const timeDiff = (now.getTime() - lastFetched.getTime()) / 1000

        if (timeDiff >= source.fetch_interval) {
          await processor.processRSSSource(source.id)
          results.push({ sourceId: source.id, status: "processed" })
        } else {
          results.push({ sourceId: source.id, status: "skipped", reason: "too_recent" })
        }
      } catch (error) {
        console.error(`Error processing source ${source.id}:`, error)
        results.push({ sourceId: source.id, status: "error", error: error.message })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error("Error in RSS fetch cron:", error)
    return NextResponse.json({ error: "Failed to process RSS sources" }, { status: 500 })
  }
}
