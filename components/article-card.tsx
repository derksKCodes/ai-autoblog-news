import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Eye, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image_url?: string
  published_at: string
  view_count: number
  source_name?: string
  categories?: { name: string; slug: string }
}

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/article/${article.slug}`}>
        {article.featured_image_url && (
          <div className="relative h-48 w-full">
            <Image
              src={article.featured_image_url || "/placeholder.svg"}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-2">
            {article.categories && (
              <Badge variant="secondary" className="text-xs">
                {article.categories.name}
              </Badge>
            )}
            {article.source_name && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ExternalLink className="h-3 w-3" />
                {article.source_name}
              </div>
            )}
          </div>

          <h3 className="text-lg font-semibold line-clamp-2 hover:text-primary transition-colors">{article.title}</h3>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{article.excerpt}</p>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.view_count}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
