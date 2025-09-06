"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Play, Clock, CheckCircle, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface QueueItem {
  id: string
  source_type: string
  processing_status: string
  scheduled_for: string
  processed_at: string | null
  error_message: string | null
  created_at: string
  source_data: any
}

export function ContentQueueMonitor() {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchQueueItems()

    // Set up real-time subscription
    const subscription = supabase
      .channel("content_queue_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "content_queue" }, () => fetchQueueItems())
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchQueueItems = async () => {
    try {
      const { data, error } = await supabase
        .from("content_queue")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error

      setQueueItems(data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch queue items",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const processQueue = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/content/queue/process", {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: `Processed ${result.processed} items from queue`,
        })
        fetchQueueItems()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process queue",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "processing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary" as const,
      processing: "default" as const,
      completed: "default" as const,
      failed: "destructive" as const,
    }
    return variants[status as keyof typeof variants] || "secondary"
  }

  if (isLoading) {
    return <div>Loading content queue...</div>
  }

  const pendingCount = queueItems.filter((item) => item.processing_status === "pending").length
  const processingCount = queueItems.filter((item) => item.processing_status === "processing").length
  const completedCount = queueItems.filter((item) => item.processing_status === "completed").length
  const failedCount = queueItems.filter((item) => item.processing_status === "failed").length

  return (
    <div className="space-y-6">
      {/* Queue Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{processingCount}</p>
                <p className="text-sm text-muted-foreground">Processing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{failedCount}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Content Processing Queue</CardTitle>
          <CardDescription>Monitor and manage content processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={processQueue} disabled={isProcessing}>
              <Play className="h-4 w-4 mr-2" />
              {isProcessing ? "Processing..." : "Process Queue"}
            </Button>
            <Button variant="outline" onClick={fetchQueueItems}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Queue Items */}
          <div className="space-y-2">
            {queueItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(item.processing_status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.source_type}</Badge>
                      <Badge variant={getStatusBadge(item.processing_status)}>{item.processing_status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Created: {new Date(item.created_at).toLocaleString()}
                    </p>
                    {item.error_message && <p className="text-sm text-red-500 mt-1">{item.error_message}</p>}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {item.processed_at && <p>Processed: {new Date(item.processed_at).toLocaleString()}</p>}
                </div>
              </div>
            ))}
            {queueItems.length === 0 && <p className="text-center text-muted-foreground py-8">No items in queue</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
