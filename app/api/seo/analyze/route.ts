import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { articleId } = await request.json()

    if (!articleId) {
      return NextResponse.json({ error: "Article ID is required" }, { status: 400 })
    }

    // Fetch article
    const { data: article, error } = await supabase
      .from("articles")
      .select("title, content, meta_title, meta_description, keywords")
      .eq("id", articleId)
      .single()

    if (error || !article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    // Perform SEO analysis
    const analysis = {
      title: {
        length: article.title.length,
        optimal: article.title.length >= 30 && article.title.length <= 60,
        suggestions: [],
      },
      metaTitle: {
        exists: !!article.meta_title,
        length: article.meta_title?.length || 0,
        optimal: article.meta_title && article.meta_title.length >= 30 && article.meta_title.length <= 60,
        suggestions: [],
      },
      metaDescription: {
        exists: !!article.meta_description,
        length: article.meta_description?.length || 0,
        optimal:
          article.meta_description && article.meta_description.length >= 120 && article.meta_description.length <= 160,
        suggestions: [],
      },
      keywords: {
        count: article.keywords?.length || 0,
        optimal: article.keywords && article.keywords.length >= 3 && article.keywords.length <= 10,
        suggestions: [],
      },
      content: {
        wordCount: article.content.replace(/<[^>]*>/g, "").split(/\s+/).length,
        optimal: true,
        suggestions: [],
      },
    }

    // Add suggestions based on analysis
    if (!analysis.title.optimal) {
      if (analysis.title.length < 30) {
        analysis.title.suggestions.push("Title is too short. Aim for 30-60 characters.")
      } else {
        analysis.title.suggestions.push("Title is too long. Keep it under 60 characters.")
      }
    }

    if (!analysis.metaTitle.exists) {
      analysis.metaTitle.suggestions.push("Add a meta title for better SEO.")
    } else if (!analysis.metaTitle.optimal) {
      if (analysis.metaTitle.length < 30) {
        analysis.metaTitle.suggestions.push("Meta title is too short. Aim for 30-60 characters.")
      } else {
        analysis.metaTitle.suggestions.push("Meta title is too long. Keep it under 60 characters.")
      }
    }

    if (!analysis.metaDescription.exists) {
      analysis.metaDescription.suggestions.push("Add a meta description for better search snippets.")
    } else if (!analysis.metaDescription.optimal) {
      if (analysis.metaDescription.length < 120) {
        analysis.metaDescription.suggestions.push("Meta description is too short. Aim for 120-160 characters.")
      } else {
        analysis.metaDescription.suggestions.push("Meta description is too long. Keep it under 160 characters.")
      }
    }

    if (!analysis.keywords.optimal) {
      if (analysis.keywords.count === 0) {
        analysis.keywords.suggestions.push("Add SEO keywords to improve discoverability.")
      } else if (analysis.keywords.count < 3) {
        analysis.keywords.suggestions.push("Add more keywords (3-10 recommended).")
      } else {
        analysis.keywords.suggestions.push("Too many keywords. Focus on 3-10 most relevant ones.")
      }
    }

    if (analysis.content.wordCount < 300) {
      analysis.content.optimal = false
      analysis.content.suggestions.push("Content is too short. Aim for at least 300 words for better SEO.")
    }

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error("SEO analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze SEO" }, { status: 500 })
  }
}
