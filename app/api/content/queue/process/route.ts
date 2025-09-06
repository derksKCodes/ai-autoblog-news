import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await createClient()

    // Get pending items from content queue
    const { data: queueItems, error } = await supabase
      .from("content_queue")
      .select("*")
      .eq("processing_status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .order("created_at", { ascending: true })
      .limit(10)

    if (error) {
      throw error
    }

    const results = []

    for (const item of queueItems) {
      try {
        // Mark as processing
        await supabase.from("content_queue").update({ processing_status: "processing" }).eq("id", item.id)

        // Process the content based on source type
        let articleData: any

        if (item.source_type === "rss") {
          articleData = await processRSSContent(item.source_data)
        } else if (item.source_type === "manual") {
          articleData = await processManualContent(item.source_data)
        } else {
          throw new Error(`Unknown source type: ${item.source_type}`)
        }

        // Create the article
        const { data: article, error: articleError } = await supabase
          .from("articles")
          .insert(articleData)
          .select()
          .single()

        if (articleError) {
          throw articleError
        }

        // Mark as completed
        await supabase
          .from("content_queue")
          .update({
            processing_status: "completed",
            article_id: article.id,
            processed_at: new Date().toISOString(),
          })
          .eq("id", item.id)

        results.push({ queueId: item.id, articleId: article.id, status: "completed" })
      } catch (error) {
        console.error(`Error processing queue item ${item.id}:`, error)

        // Mark as failed
        await supabase
          .from("content_queue")
          .update({
            processing_status: "failed",
            error_message: error.message,
            processed_at: new Date().toISOString(),
          })
          .eq("id", item.id)

        results.push({ queueId: item.id, status: "failed", error: error.message })
      }
    }

    return NextResponse.json({ success: true, processed: results.length, results })
  } catch (error) {
    console.error("Error processing content queue:", error)
    return NextResponse.json({ error: "Failed to process content queue" }, { status: 500 })
  }
}

async function processRSSContent(sourceData: any): Promise<any> {
  const { processed_content } = sourceData

  return {
    title: processed_content.title,
    slug: processed_content.slug,
    content: processed_content.content,
    excerpt: processed_content.excerpt,
    source_url: processed_content.sourceUrl,
    source_name: processed_content.sourceName,
    published_at: processed_content.publishedAt,
    category_id: processed_content.categoryId,
    is_published: false, // Will be published after AI processing
    is_ai_generated: false,
  }
}

async function processManualContent(sourceData: any): Promise<any> {
  const { normalized_data } = sourceData

  return {
    title: normalized_data.title,
    slug: generateSlug(normalized_data.title),
    content: normalized_data.content || normalized_data.description,
    excerpt: generateExcerpt(normalized_data.description),
    source_url: normalized_data.link,
    source_name: "Manual Import",
    published_at: new Date(normalized_data.pubDate).toISOString(),
    is_published: false,
    is_ai_generated: false,
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 100)
}

function generateExcerpt(description: string, maxLength = 200): string {
  const cleaned = description
    .replace(/<[^>]*>/g, "")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  return cleaned.length > maxLength ? cleaned.substring(0, maxLength) + "..." : cleaned
}
