import { type NextRequest, NextResponse } from "next/server"
import { aiService } from "@/lib/ai-service"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get pending content from queue
    const { data: queueItems, error: fetchError } = await supabase
      .from("content_queue")
      .select("*")
      .eq("status", "pending")
      .eq("ai_processed", false)
      .limit(5) // Process 5 items at a time

    if (fetchError) {
      return NextResponse.json({ error: "Failed to fetch queue items" }, { status: 500 })
    }

    const results = []

    for (const item of queueItems || []) {
      try {
        const aiContent = await aiService.rewriteArticle(item.original_content, item.original_title, item.source_url)

        // Generate image prompt
        const imagePrompt = await aiService.generateImagePrompt(aiContent.title, aiContent.content)

        // Update queue item with AI results
        const { error: updateError } = await supabase
          .from("content_queue")
          .update({
            ai_title: aiContent.title,
            ai_content: aiContent.content,
            ai_meta_description: aiContent.metaDescription,
            ai_keywords: aiContent.keywords,
            ai_category: aiContent.category,
            ai_summary: aiContent.summary,
            ai_image_prompt: imagePrompt,
            ai_processed: true,
            ai_processed_at: new Date().toISOString(),
            status: "ai_processed",
          })
          .eq("id", item.id)

        if (updateError) {
          console.error(`Failed to update item ${item.id}:`, updateError)
          results.push({ id: item.id, success: false, error: updateError.message })
        } else {
          results.push({ id: item.id, success: true })
        }
      } catch (error) {
        console.error(`AI processing failed for item ${item.id}:`, error)

        // Mark as failed
        await supabase
          .from("content_queue")
          .update({
            status: "ai_failed",
            error_message: error instanceof Error ? error.message : "AI processing failed",
          })
          .eq("id", item.id)

        results.push({ id: item.id, success: false, error: error instanceof Error ? error.message : "Unknown error" })
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error("Queue processing error:", error)
    return NextResponse.json({ error: "Failed to process queue" }, { status: 500 })
  }
}
