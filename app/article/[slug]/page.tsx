import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { CalendarDays, Eye, ExternalLink, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdPlacement } from "@/components/ad-placement"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { AffiliateLinkProcessor } from "@/components/affiliate-link-processor"
import { StructuredData } from "@/components/seo/structured-data"
import { SocialShareButtons } from "@/components/seo/social-share-buttons"
import { formatDistanceToNow } from "date-fns"

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from("articles")
    .select(
      "title, excerpt, meta_title, meta_description, featured_image_url, keywords, published_at, categories(name)",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (!article) {
    return {
      title: "Article Not Found",
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-news-site.com"
  const articleUrl = `${siteUrl}/article/${slug}`
  const imageUrl = article.featured_image_url || `${siteUrl}/og-default.jpg`

  return {
    title: article.meta_title || article.title,
    description: article.meta_description || article.excerpt,
    keywords: article.keywords?.join(", "),
    authors: [{ name: "News Team" }],
    publisher: "Your News Site",
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url: articleUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      publishedTime: article.published_at,
      section: article.categories?.name,
      siteName: "Your News Site",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [imageUrl],
      creator: "@yournewssite",
      site: "@yournewssite",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch article with enhanced data
  const { data: article } = await supabase
    .from("articles")
    .select(`
      *,
      categories (name, slug)
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (!article) {
    notFound()
  }

  // Increment view count
  await supabase
    .from("articles")
    .update({ view_count: article.view_count + 1 })
    .eq("id", article.id)

  // Fetch related articles
  const { data: relatedArticles } = await supabase
    .from("articles")
    .select(`
      id, title, slug, excerpt, featured_image_url, published_at,
      categories (name, slug)
    `)
    .eq("category_id", article.category_id)
    .eq("is_published", true)
    .neq("id", article.id)
    .order("published_at", { ascending: false })
    .limit(3)

  const { data: affiliateLinks } = await supabase
    .from("affiliate_links")
    .select("id, original_url, affiliate_url")
    .eq("is_active", true)

  return (
    <div className="min-h-screen bg-background">
      <StructuredData article={article} />

      <AdPlacement position="header" />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to News
            </Link>
          </Button>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {article.categories && (
                <Badge variant="secondary">
                  <Link href={`/category/${article.categories.slug}`}>{article.categories.name}</Link>
                </Badge>
              )}
              {article.source_name && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <ExternalLink className="h-4 w-4" />
                  {article.source_name}
                </div>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">{article.title}</h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.view_count + 1} views
              </div>
            </div>

            {article.featured_image_url && (
              <div className="relative h-64 md:h-96 w-full mb-8 rounded-lg overflow-hidden">
                <Image
                  src={article.featured_image_url || "/placeholder.svg"}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Article Content */}
            <article className="lg:col-span-3">
              <div className="prose prose-lg max-w-none article-content">
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </div>

              <div className="mt-8 pt-6 border-t">
                <SocialShareButtons
                  url={`${process.env.NEXT_PUBLIC_SITE_URL}/article/${article.slug}`}
                  title={article.title}
                  description={article.excerpt}
                />
              </div>

              {/* Source Link */}
              {article.source_url && (
                <div className="mt-8 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Original source:</p>
                  <Link
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {article.source_name || "View Original Article"}
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              )}

              <AdPlacement position="in-article" />
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              <AdPlacement position="sidebar" />
              <NewsletterSignup />

              {/* Related Articles */}
              {relatedArticles && relatedArticles.length > 0 && (
                <div className="bg-card rounded-lg p-6 border">
                  <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedArticles.map((related) => (
                      <Link key={related.id} href={`/article/${related.slug}`} className="block group">
                        <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                          {related.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(related.published_at), { addSuffix: true })}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      <AffiliateLinkProcessor content={article.content} affiliateLinks={affiliateLinks || []} />

      <AdPlacement position="footer" />
    </div>
  )
}
