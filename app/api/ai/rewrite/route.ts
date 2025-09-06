import { type NextRequest, NextResponse } from "next/server"
import { aiService } from "@/lib/ai-service"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { originalContent, originalTitle, sourceUrl, contentId } = await request.json()

    if (!originalContent || !originalTitle) {
      return NextResponse.json({ error: "Original content and title are required" }, { status: 400 })
    }

    // Generate AI rewritten content
    const aiContent = await aiService.rewriteArticle(originalContent, originalTitle, sourceUrl)

    // Update content in database if contentId provided
    if (contentId) {
      const supabase = createServerClient()

      const { error } = await supabase
        .from("content_queue")
        .update({
          ai_title: aiContent.title,
          ai_content: aiContent.content,
          ai_meta_description: aiContent.metaDescription,
          ai_keywords: aiContent.keywords,
          ai_category: aiContent.category,
          ai_summary: aiContent.summary,
          ai_processed: true,
          ai_processed_at: new Date().toISOString(),
          status: "ai_processed",
        })
        .eq("id", contentId)

      if (error) {
        console.error("Database update failed:", error)
        return NextResponse.json({ error: "Failed to update content" }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      content: aiContent,
    })
  } catch (error) {
    console.error("AI rewrite error:", error)
    return NextResponse.json({ error: "Failed to rewrite content" }, { status: 500 })
  }
}
