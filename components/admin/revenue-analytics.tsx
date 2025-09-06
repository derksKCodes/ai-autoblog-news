"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { DollarSign, TrendingUp, MousePointer, Eye } from "lucide-react"

export function RevenueAnalytics() {
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [affiliateStats, setAffiliateStats] = useState<any[]>([])
  const [adStats, setAdStats] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState("30")
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const daysAgo = new Date(Date.now() - Number.parseInt(timeRange) * 24 * 60 * 60 * 1000)

      // Fetch revenue data
      const { data: revenue } = await supabase
        .from("revenue_tracking")
        .select("amount, source_type, transaction_date")
        .gte("transaction_date", daysAgo.toISOString())
        .order("transaction_date", { ascending: true })

      // Fetch affiliate performance
      const { data: affiliatePerf } = await supabase
        .from("affiliate_links")
        .select(`
          name,
          click_count,
          commission_rate,
          affiliate_clicks!inner(clicked_at)
        `)
        .gte("affiliate_clicks.clicked_at", daysAgo.toISOString())

      // Fetch ad performance
      const { data: adPerf } = await supabase
        .from("ad_performance")
        .select("*")
        .gte("date", daysAgo.toISOString().split("T")[0])

      setRevenueData(revenue || [])
      setAffiliateStats(affiliatePerf || [])
      setAdStats(adPerf || [])
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Process revenue data for chart
  const processedRevenueData = revenueData.reduce((acc: any[], item) => {
    const date = new Date(item.transaction_date).toLocaleDateString()
    const existing = acc.find((d) => d.date === date)

    if (existing) {
      existing.amount += item.amount
      existing[item.source_type] = (existing[item.source_type] || 0) + item.amount
    } else {
      acc.push({
        date,
        amount: item.amount,
        [item.source_type]: item.amount,
      })
    }

    return acc
  }, [])

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0)
  const totalClicks = affiliateStats.reduce((sum, item) => sum + item.click_count, 0)
  const totalImpressions = adStats.reduce((sum, item) => sum + item.impressions, 0)
  const totalAdClicks = adStats.reduce((sum, item) => sum + item.clicks, 0)

  if (isLoading) {
    return <div>Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Revenue Analytics</h2>
          <p className="text-muted-foreground">Track your monetization performance</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affiliate Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
            <p className="text-xs text-muted-foreground">Total clicks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ad Impressions</CardTitle>
            <Eye className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpressions}</div>
            <p className="text-xs text-muted-foreground">Total impressions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ad CTR</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalImpressions > 0 ? ((totalAdClicks / totalImpressions) * 100).toFixed(2) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Click-through rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
          <CardDescription>Daily revenue breakdown by source</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={processedRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performing Affiliate Links */}
      <Card>
        <CardHeader>
          <CardTitle>Top Affiliate Links</CardTitle>
          <CardDescription>Best performing affiliate links by clicks</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={affiliateStats.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="click_count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
