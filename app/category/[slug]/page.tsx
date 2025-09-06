import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArticleCard } from "@/components/article-card"
import { CategoryNav } from "@/components/category-nav"
import { AdPlacement } from "@/components/ad-placement"
import { NewsletterSignup } from "@/components/newsletter-signup"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase.from("categories").select("name, description").eq("slug", slug).single()

  if (!category) {
    return {
      title: "Category Not Found",
    }
  }

  return {
    title: `${category.name} News - AutoNews`,
    description: category.description || `Latest ${category.name.toLowerCase()} news and updates`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch category
  const { data: category } = await supabase.from("categories").select("*").eq("slug", slug).single()

  if (!category) {
    notFound()
  }

  // Fetch articles in this category
  const { data: articles } = await supabase
    .from("articles")
    .select(`
      *,
      categories (name, slug)
    `)
    .eq("category_id", category.id)
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(20)

  // Fetch all categories for navigation
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  return (
    <div className="min-h-screen bg-background">
      <AdPlacement position="header" />
      <CategoryNav categories={categories || []} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Category Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{category.name}</h1>
            {category.description && <p className="text-lg text-muted-foreground">{category.description}</p>}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Articles Grid */}
            <main className="lg:col-span-3">
              {articles && articles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No articles found in this category yet. Check back soon!</p>
                </div>
              )}
            </main>

            {/* Sidebar */}
            <aside className="space-y-6">
              <AdPlacement position="sidebar" />
              <NewsletterSignup />
            </aside>
          </div>
        </div>
      </div>

      <AdPlacement position="footer" />
    </div>
  )
}
