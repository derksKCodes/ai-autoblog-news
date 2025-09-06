import { type NextRequest, NextResponse } from "next/server"
import { aiService } from "@/lib/ai-service"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { content, title, metaDescription, targetLanguage, articleId } = await request.json()

    if (!content || !title || !targetLanguage) {
      return NextResponse.json({ error: "Content, title, and target language are required" }, { status: 400 })
    }

    // Translate content
    const translation = await aiService.translateContent(content, title, metaDescription, targetLanguage)

    // Save translation if articleId provided
    if (articleId) {
      const supabase = createServerClient()

      const { error } = await supabase.from("article_translations").insert({
        article_id: articleId,
        language: targetLanguage,
        title: translation.title,
        content: translation.content,
        meta_description: translation.metaDescription,
      })

      if (error) {
        console.error("Translation save failed:", error)
        return NextResponse.json({ error: "Failed to save translation" }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      translation,
    })
  } catch (error) {
    console.error("Translation error:", error)
    return NextResponse.json({ error: "Failed to translate content" }, { status: 500 })
  }
}
