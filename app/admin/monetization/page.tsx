import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdPlacementManager } from "@/components/admin/ad-placement-manager"
import { AffiliateLinksManager } from "@/components/admin/affiliate-links-manager"
import { RevenueAnalytics } from "@/components/admin/revenue-analytics"
import { MonetizationSettings } from "@/components/admin/monetization-settings"
import { DollarSign, TrendingUp, Link } from "lucide-react"

export default async function MonetizationPage() {
  const supabase = await createClient()

  // Fetch monetization statistics
  const [{ count: activeAdsCount }, { count: affiliateLinksCount }, { data: revenueData }] = await Promise.all([
    supabase.from("ad_placements").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("affiliate_links").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase
      .from("revenue_tracking")
      .select("amount, created_at")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  const monthlyRevenue = revenueData?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Monetization</h1>
        <p className="text-gray-600">Manage ads, affiliate links, and track revenue</p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAdsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Ad placements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affiliate Links</CardTitle>
            <Link className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliateLinksCount || 0}</div>
            <p className="text-xs text-muted-foreground">Active links</p>
          </CardContent>
        </Card>
      </div>

      {/* Monetization Management Tabs */}
      <Tabs defaultValue="ads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ads">Ad Placements</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliate Links</TabsTrigger>
          <TabsTrigger value="analytics">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="ads">
          <AdPlacementManager />
        </TabsContent>

        <TabsContent value="affiliates">
          <AffiliateLinksManager />
        </TabsContent>

        <TabsContent value="analytics">
          <RevenueAnalytics />
        </TabsContent>

        <TabsContent value="settings">
          <MonetizationSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
