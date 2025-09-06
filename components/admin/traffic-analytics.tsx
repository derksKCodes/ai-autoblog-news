"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, BarChart3 } from "lucide-react"

export function TrafficAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Google Analytics Integration</CardTitle>
          <CardDescription>Connect your Google Analytics for detailed traffic insights</CardDescription>
        </CardHeader>
        <CardContent>
          {gaId ? (
            <div className="space-y-4">
              <Alert>
                <BarChart3 className="h-4 w-4" />
                <AlertDescription>Google Analytics is configured with ID: {gaId}</AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground">
                Visit your Google Analytics dashboard to view detailed traffic reports, user behavior, and conversion
                metrics.
              </p>
              <a
                href="https://analytics.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-primary hover:underline"
              >
                <span>Open Google Analytics</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                Google Analytics is not configured. Add your GA_MEASUREMENT_ID to environment variables to enable
                tracking.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Console Integration</CardTitle>
          <CardDescription>Monitor your search performance and indexing status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Connect your website to Google Search Console to monitor:</p>
            <ul className="text-sm space-y-2 ml-4">
              <li>• Search performance and rankings</li>
              <li>• Indexing status and coverage</li>
              <li>• Core Web Vitals and page experience</li>
              <li>• Manual actions and security issues</li>
            </ul>
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-primary hover:underline"
            >
              <span>Open Search Console</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
