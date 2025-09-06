import { createClient } from "@/lib/supabase/server"
import { RSSParser, type RSSItem } from "@/lib/rss-parser"

export interface ProcessedContent {
  title: string
  content: string
  excerpt: string
  slug: string
  sourceUrl: string
  sourceName: string
  publishedAt: string
  categoryId?: string
}

export class ContentProcessor {
  private rssParser: RSSParser

  constructor() {
    this.rssParser = new RSSParser()
  }

  async processRSSSource(sourceId: string): Promise<void> {
    const supabase = await createClient()

    try {
      // Get RSS source details
      const { data: source, error: sourceError } = await supabase
        .from("rss_sources")
        .select("*")
        .eq("id", sourceId)
        .eq("is_active", true)
        .single()

      if (sourceError || !source) {
        throw new Error(`RSS source not found: ${sourceId}`)
      }

      console.log(`[v0] Processing RSS source: ${source.name}`)

      // Fetch and parse RSS feed
      const feed = await this.rssParser.fetchAndParse(source.url)

      // Process each item
      for (const item of feed.items) {
        await this.processRSSItem(item, source)
      }

      // Update last fetched timestamp
      await supabase.from("rss_sources").update({ last_fetched: new Date().toISOString() }).eq("id", sourceId)

      console.log(`[v0] Successfully processed ${feed.items.length} items from ${source.name}`)
    } catch (error) {
      console.error(`[v0] Error processing RSS source ${sourceId}:`, error)
      throw error
    }
  }

  private async processRSSItem(item: RSSItem, source: any): Promise<void> {
    const supabase = await createClient()

    try {
      // Check if article already exists
      const { data: existingArticle } = await supabase
        .from("articles")
        .select("id")
        .eq("source_url", item.link)
        .single()

      if (existingArticle) {
        console.log(`[v0] Article already exists: ${item.title}`)
        return
      }

      // Generate slug from title
      const slug = this.generateSlug(item.title)

      // Check if slug already exists
      const { data: existingSlug } = await supabase.from("articles").select("id").eq("slug", slug).single()

      if (existingSlug) {
        console.log(`[v0] Slug already exists: ${slug}`)
        return
      }

      // Create processed content
      const processedContent: ProcessedContent = {
        title: item.title,
        content: this.cleanContent(item.content || item.description),
        excerpt: this.generateExcerpt(item.description),
        slug,
        sourceUrl: item.link,
        sourceName: source.name,
        publishedAt: new Date(item.pubDate).toISOString(),
        categoryId: source.category_id,
      }

      // Add to content queue for AI processing
      await supabase.from("content_queue").insert({
        source_type: "rss",
        source_data: {
          rss_source_id: source.id,
          original_item: item,
          processed_content: processedContent,
        },
        processing_status: "pending",
      })

      console.log(`[v0] Added to content queue: ${item.title}`)
    } catch (error) {
      console.error(`[v0] Error processing RSS item:`, error)
    }
  }

  async processManualData(data: any[], sourceType: "json" | "csv" | "excel"): Promise<void> {
    const supabase = await createClient()

    for (const item of data) {
      try {
        // Normalize manual data to standard format
        const normalizedItem = this.normalizeManualData(item)

        // Generate slug
        const slug = this.generateSlug(normalizedItem.title)

        // Check if article already exists
        const { data: existingArticle } = await supabase
          .from("articles")
          .select("id")
          .or(`source_url.eq.${normalizedItem.link},slug.eq.${slug}`)
          .single()

        if (existingArticle) {
          console.log(`[v0] Manual article already exists: ${normalizedItem.title}`)
          continue
        }

        // Add to content queue
        await supabase.from("content_queue").insert({
          source_type: "manual",
          source_data: {
            source_type: sourceType,
            original_data: item,
            normalized_data: normalizedItem,
          },
          processing_status: "pending",
        })

        console.log(`[v0] Added manual data to queue: ${normalizedItem.title}`)
      } catch (error) {
        console.error(`[v0] Error processing manual data item:`, error)
      }
    }
  }

  private normalizeManualData(item: any): RSSItem {
    return {
      title: item.headline || item.title || "",
      description: item.description || item.summary || "",
      link: item.link || item.url || "",
      pubDate: item.published_time || item.pubDate || item.date || new Date().toISOString(),
      author: item.author || "",
      category: item.category || "",
      content: item.content || item.body || "",
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
      .substring(0, 100)
  }

  private cleanContent(content: string): string {
    // Remove HTML tags and clean up content
    return content
      .replace(/<[^>]*>/g, "")
      .replace(/&[^;]+;/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  }

  private generateExcerpt(description: string, maxLength = 200): string {
    const cleaned = this.cleanContent(description)
    return cleaned.length > maxLength ? cleaned.substring(0, maxLength) + "..." : cleaned
  }
}
