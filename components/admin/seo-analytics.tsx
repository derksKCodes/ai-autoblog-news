"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, XCircle } from "lucide-react"

interface SEOIssue {
  type: "error" | "warning" | "success"
  message: string
  count: number
}

export function SEOAnalytics() {
  const [seoIssues, setSeoIssues] = useState<SEOIssue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    analyzeSEO()
  }, [])

  const analyzeSEO = async () => {
    try {
      const { data: articles } = await supabase
        .from("articles")
        .select("title, meta_title, meta_description, excerpt, keywords, featured_image_url")
        .eq("is_published", true)

      if (!articles) return

      const issues: SEOIssue[] = []

      // Analyze meta titles
      const missingMetaTitles = articles.filter((a) => !a.meta_title).length
      const longMetaTitles = articles.filter((a) => a.meta_title && a.meta_title.length > 60).length
      const shortMetaTitles = articles.filter((a) => a.meta_title && a.meta_title.length < 30).length

      if (missingMetaTitles > 0) {
        issues.push({
          type: "error",
          message: "Articles missing meta titles",
          count: missingMetaTitles,
        })
      }

      if (longMetaTitles > 0) {
        issues.push({
          type: "warning",
          message: "Meta titles too long (>60 chars)",
          count: longMetaTitles,
        })
      }

      if (shortMetaTitles > 0) {
        issues.push({
          type: "warning",
          message: "Meta titles too short (<30 chars)",
          count: shortMetaTitles,
        })
      }

      // Analyze meta descriptions
      const missingMetaDesc = articles.filter((a) => !a.meta_description).length
      const longMetaDesc = articles.filter((a) => a.meta_description && a.meta_description.length > 160).length
      const shortMetaDesc = articles.filter((a) => a.meta_description && a.meta_description.length < 120).length

      if (missingMetaDesc > 0) {
        issues.push({
          type: "error",
          message: "Articles missing meta descriptions",
          count: missingMetaDesc,
        })
      }

      if (longMetaDesc > 0) {
        issues.push({
          type: "warning",
          message: "Meta descriptions too long (>160 chars)",
          count: longMetaDesc,
        })
      }

      if (shortMetaDesc > 0) {
        issues.push({
          type: "warning",
          message: "Meta descriptions too short (<120 chars)",
          count: shortMetaDesc,
        })
      }

      // Analyze images
      const missingImages = articles.filter((a) => !a.featured_image_url).length
      if (missingImages > 0) {
        issues.push({
          type: "warning",
          message: "Articles missing featured images",
          count: missingImages,
        })
      }

      // Analyze keywords
      const missingKeywords = articles.filter((a) => !a.keywords || a.keywords.length === 0).length
      if (missingKeywords > 0) {
        issues.push({
          type: "warning",
          message: "Articles missing SEO keywords",
          count: missingKeywords,
        })
      }

      // Success metrics
      const wellOptimized = articles.filter(
        (a) =>
          a.meta_title &&
          a.meta_description &&
          a.featured_image_url &&
          a.keywords &&
          a.keywords.length > 0 &&
          a.meta_title.length >= 30 &&
          a.meta_title.length <= 60 &&
          a.meta_description.length >= 120 &&
          a.meta_description.length <= 160,
      ).length

      if (wellOptimized > 0) {
        issues.push({
          type: "success",
          message: "Well-optimized articles",
          count: wellOptimized,
        })
      }

      setSeoIssues(issues)
    } catch (error) {
      console.error("Error analyzing SEO:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "error":
        return "destructive"
      case "warning":
        return "secondary"
      case "success":
        return "default"
      default:
        return "secondary"
    }
  }

  if (isLoading) {
    return <div>Analyzing SEO...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SEO Health Check</CardTitle>
          <CardDescription>Automated analysis of your content's SEO optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {seoIssues.map((issue, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getIcon(issue.type)}
                  <span className="font-medium">{issue.message}</span>
                </div>
                <Badge variant={getBadgeVariant(issue.type) as any}>{issue.count}</Badge>
              </div>
            ))}
            {seoIssues.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No SEO issues found. Great job!</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO Recommendations</CardTitle>
          <CardDescription>Best practices to improve your search rankings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Ensure all articles have unique meta titles (30-60 characters)</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Write compelling meta descriptions (120-160 characters)</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Add featured images to all articles for better social sharing</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Include relevant keywords for each article</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Use proper heading structure (H1, H2, H3) in content</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
