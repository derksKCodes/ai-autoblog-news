import { createClient } from "@/lib/supabase/server"
import { ArticleCard } from "@/components/article-card"
import { CategoryNav } from "@/components/category-nav"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { AdPlacement } from "@/components/ad-placement"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AutoNews - Latest Breaking News & Updates",
  description:
    "Stay informed with the latest breaking news, technology updates, business insights, and world events. Your trusted source for automated news coverage.",
  keywords: ["news", "breaking news", "technology", "business", "world news", "updates"],
  openGraph: {
    title: "AutoNews - Latest Breaking News & Updates",
    description: "Stay informed with the latest breaking news and updates from around the world.",
    type: "website",
  },
}

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch featured articles
  const { data: featuredArticles } = await supabase
    .from("articles")
    .select(`
      *,
      categories (name, slug)
    `)
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(6)

  // Fetch categories for navigation
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  return (
    <div className="min-h-screen bg-background">
      {/* Header Ad */}
      <AdPlacement position="header" />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">Breaking News & Updates</h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 text-pretty">
              Stay informed with AI-powered news aggregation from trusted sources worldwide
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="#latest-news">Read Latest News</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/categories">Browse Categories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <CategoryNav categories={categories || []} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <main className="lg:col-span-3">
            <section id="latest-news" className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Latest News</h2>
                <Button variant="outline" asChild>
                  <Link href="/articles">View All Articles</Link>
                </Button>
              </div>

              {featuredArticles && featuredArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No articles available yet. Check back soon!</p>
                </div>
              )}
            </section>

            {/* In-Article Ad */}
            <AdPlacement position="in-article" />
          </main>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Sidebar Ad */}
            <AdPlacement position="sidebar" />

            {/* Newsletter Signup */}
            <NewsletterSignup />

            {/* Popular Categories */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-xl font-semibold mb-4">Popular Categories</h3>
              <div className="space-y-2">
                {categories?.slice(0, 6).map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer Ad */}
      <AdPlacement position="footer" />
    </div>
  )
}
