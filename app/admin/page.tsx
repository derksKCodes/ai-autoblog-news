import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Rss, Users, Clock } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch dashboard statistics
  const [
    { count: articlesCount },
    { count: publishedCount },
    { count: queueCount },
    { count: rssSourcesCount },
    { count: subscribersCount },
  ] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("content_queue").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("rss_sources").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("newsletter_subscriptions").select("*", { count: "exact", head: true }).eq("is_active", true),
  ])

  // Fetch recent articles
  const { data: recentArticles } = await supabase
    .from("articles")
    .select("title, created_at, is_published, view_count")
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch pending queue items
  const { data: pendingQueue } = await supabase
    .from("content_queue")
    .select("original_title, source_name, created_at, status")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5)

  const stats = [
    {
      title: "Total Articles",
      value: articlesCount || 0,
      description: `${publishedCount || 0} published`,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Content Queue",
      value: queueCount || 0,
      description: "Pending processing",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "RSS Sources",
      value: rssSourcesCount || 0,
      description: "Active feeds",
      icon: Rss,
      color: "text-green-600",
    },
    {
      title: "Subscribers",
      value: subscribersCount || 0,
      description: "Newsletter subscribers",
      icon: Users,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your automated news website</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Articles</CardTitle>
            <CardDescription>Latest published and draft articles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentArticles?.map((article, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{article.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(article.created_at).toLocaleDateString()} •{" "}
                      {article.is_published ? "Published" : "Draft"} • {article.view_count || 0} views
                    </p>
                  </div>
                  <div
                    className={`px-2 py-1 text-xs rounded-full ${
                      article.is_published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {article.is_published ? "Live" : "Draft"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Content Queue</CardTitle>
            <CardDescription>Items waiting for AI processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingQueue?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.original_title}</p>
                    <p className="text-xs text-gray-500">
                      {item.source_name} • {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">{item.status}</div>
                </div>
              ))}
              {(!pendingQueue || pendingQueue.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">No items in queue</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
