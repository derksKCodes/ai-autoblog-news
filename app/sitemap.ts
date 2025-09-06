import { createClient } from "@/lib/supabase/server"
import type { MetadataRoute } from "next"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-news-site.com"

  // Fetch published articles
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, updated_at")
    .eq("is_published", true)
    .order("updated_at", { ascending: false })

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("slug, updated_at")
    .order("updated_at", { ascending: false })

  const articleUrls = (articles || []).map((article) => ({
    url: `${siteUrl}/article/${article.slug}`,
    lastModified: new Date(article.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  const categoryUrls = (categories || []).map((category) => ({
    url: `${siteUrl}/category/${category.slug}`,
    lastModified: new Date(category.updated_at),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }))

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...articleUrls,
    ...categoryUrls,
  ]
}
