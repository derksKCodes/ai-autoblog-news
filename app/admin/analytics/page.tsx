import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SEOAnalytics } from "@/components/admin/seo-analytics"
import { TrafficAnalytics } from "@/components/admin/traffic-analytics"
import { ContentPerformance } from "@/components/admin/content-performance"
import { TrendingUp, Users, Eye, Search } from "lucide-react"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // Fetch analytics data
  const [{ data: topArticles }, { data: categoryStats }, { count: totalArticles }, { data: recentViews }] =
    await Promise.all([
      supabase
        .from("articles")
        .select("title, slug, view_count, published_at")
        .eq("is_published", true)
        .order("view_count", { ascending: false })
        .limit(10),
      supabase.from("articles").select("categories(name), view_count").eq("is_published", true),
      supabase.from("articles").select("*", { count: "exact", head: true }).eq("is_published", true),
      supabase
        .from("articles")
        .select("view_count, published_at")
        .eq("is_published", true)
        .gte("published_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ])

  const totalViews = topArticles?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0
  const weeklyViews = recentViews?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & SEO</h1>
        <p className="text-gray-600">Monitor your website performance and SEO metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalArticles || 0}</div>
            <p className="text-xs text-muted-foreground">Published articles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Views</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Views/Article</CardTitle>
            <Search className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalArticles ? Math.round(totalViews / totalArticles) : 0}</div>
            <p className="text-xs text-muted-foreground">Average performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="seo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="seo">SEO Performance</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Analytics</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="seo">
          <SEOAnalytics />
        </TabsContent>

        <TabsContent value="traffic">
          <TrafficAnalytics />
        </TabsContent>

        <TabsContent value="content">
          <ContentPerformance articles={topArticles || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
