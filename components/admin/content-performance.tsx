"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Calendar } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface Article {
  title: string
  slug: string
  view_count: number
  published_at: string
}

interface ContentPerformanceProps {
  articles: Article[]
}

export function ContentPerformance({ articles }: ContentPerformanceProps) {
  const getPerformanceBadge = (views: number) => {
    if (views > 1000) return { variant: "default" as const, label: "High" }
    if (views > 500) return { variant: "secondary" as const, label: "Medium" }
    return { variant: "outline" as const, label: "Low" }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Articles</CardTitle>
          <CardDescription>Articles ranked by total views</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {articles.map((article, index) => {
              const performance = getPerformanceBadge(article.view_count)
              return (
                <div key={article.slug} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                      <Badge variant={performance.variant}>{performance.label}</Badge>
                    </div>
                    <Link
                      href={`/article/${article.slug}`}
                      className="font-medium hover:text-primary transition-colors line-clamp-2"
                    >
                      {article.title}
                    </Link>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{article.view_count.toLocaleString()} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{article.view_count}</div>
                    <div className="text-xs text-muted-foreground">views</div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
