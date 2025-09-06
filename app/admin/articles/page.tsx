import { createClient } from "@/lib/supabase/server"
import { ArticlesTable } from "@/components/admin/articles-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default async function ArticlesPage() {
  const supabase = await createClient()

  const { data: articles, error } = await supabase
    .from("articles")
    .select(`
      id,
      title,
      slug,
      is_published,
      created_at,
      updated_at,
      view_count,
      categories (name)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching articles:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600">Manage your published and draft articles</p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Article
          </Link>
        </Button>
      </div>

      <ArticlesTable articles={articles || []} />
    </div>
  )
}
