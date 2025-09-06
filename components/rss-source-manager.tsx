"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, RefreshCw, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface RSSSource {
  id: string
  name: string
  url: string
  category_id: string
  is_active: boolean
  fetch_interval: number
  last_fetched: string | null
  categories?: { name: string }
}

interface Category {
  id: string
  name: string
}

export function RSSSourceManager() {
  const [sources, setSources] = useState<RSSSource[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newSource, setNewSource] = useState({
    name: "",
    url: "",
    category_id: "",
    fetch_interval: 3600,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [sourcesResponse, categoriesResponse] = await Promise.all([
        supabase
          .from("rss_sources")
          .select(`
          *,
          categories (name)
        `)
          .order("name"),
        supabase.from("categories").select("*").order("name"),
      ])

      if (sourcesResponse.error) throw sourcesResponse.error
      if (categoriesResponse.error) throw categoriesResponse.error

      setSources(sourcesResponse.data || [])
      setCategories(categoriesResponse.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch RSS sources",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addSource = async () => {
    if (!newSource.name || !newSource.url || !newSource.category_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsAdding(true)
    try {
      const { error } = await supabase.from("rss_sources").insert([newSource])

      if (error) throw error

      toast({
        title: "Success",
        description: "RSS source added successfully",
      })

      setNewSource({ name: "", url: "", category_id: "", fetch_interval: 3600 })
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add RSS source",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const toggleSource = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase.from("rss_sources").update({ is_active: isActive }).eq("id", id)

      if (error) throw error

      setSources(sources.map((source) => (source.id === id ? { ...source, is_active: isActive } : source)))

      toast({
        title: "Success",
        description: `RSS source ${isActive ? "activated" : "deactivated"}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update RSS source",
        variant: "destructive",
      })
    }
  }

  const deleteSource = async (id: string) => {
    try {
      const { error } = await supabase.from("rss_sources").delete().eq("id", id)

      if (error) throw error

      setSources(sources.filter((source) => source.id !== id))
      toast({
        title: "Success",
        description: "RSS source deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete RSS source",
        variant: "destructive",
      })
    }
  }

  const fetchSource = async (id: string) => {
    try {
      const response = await fetch("/api/rss/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: id }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "RSS source fetched successfully",
        })
        fetchData()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch RSS source",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading RSS sources...</div>
  }

  return (
    <div className="space-y-6">
      {/* Add New Source */}
      <Card>
        <CardHeader>
          <CardTitle>Add RSS Source</CardTitle>
          <CardDescription>Add a new RSS feed to automatically fetch articles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Source Name</Label>
              <Input
                id="name"
                placeholder="e.g., TechCrunch"
                value={newSource.name}
                onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="url">RSS URL</Label>
              <Input
                id="url"
                placeholder="https://example.com/feed.xml"
                value={newSource.url}
                onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={newSource.category_id}
                onValueChange={(value) => setNewSource({ ...newSource, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="interval">Fetch Interval (seconds)</Label>
              <Input
                id="interval"
                type="number"
                value={newSource.fetch_interval}
                onChange={(e) => setNewSource({ ...newSource, fetch_interval: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>
          <Button onClick={addSource} disabled={isAdding}>
            <Plus className="h-4 w-4 mr-2" />
            {isAdding ? "Adding..." : "Add Source"}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Sources */}
      <Card>
        <CardHeader>
          <CardTitle>RSS Sources ({sources.length})</CardTitle>
          <CardDescription>Manage your RSS feed sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sources.map((source) => (
              <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">{source.name}</h3>
                    <Badge variant={source.is_active ? "default" : "secondary"}>
                      {source.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {source.categories && <Badge variant="outline">{source.categories.name}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{source.url}</p>
                  <p className="text-xs text-muted-foreground">
                    Fetch interval: {source.fetch_interval}s | Last fetched:{" "}
                    {source.last_fetched ? new Date(source.last_fetched).toLocaleString() : "Never"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={source.is_active} onCheckedChange={(checked) => toggleSource(source.id, checked)} />
                  <Button size="sm" variant="outline" onClick={() => fetchSource(source.id)}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteSource(source.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {sources.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No RSS sources configured yet. Add one above to get started.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
