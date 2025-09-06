"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface AdPlacement {
  id: string
  name: string
  position: string
  ad_code: string
  is_active: boolean
  network: string
  created_at: string
}

export function AdPlacementManager() {
  const [adPlacements, setAdPlacements] = useState<AdPlacement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingAd, setEditingAd] = useState<AdPlacement | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: "",
    position: "",
    ad_code: "",
    network: "",
    is_active: true,
  })

  useEffect(() => {
    fetchAdPlacements()
  }, [])

  const fetchAdPlacements = async () => {
    try {
      const { data, error } = await supabase.from("ad_placements").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setAdPlacements(data || [])
    } catch (error) {
      console.error("Error fetching ad placements:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingAd) {
        const { error } = await supabase.from("ad_placements").update(formData).eq("id", editingAd.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("ad_placements").insert([formData])
        if (error) throw error
      }

      await fetchAdPlacements()
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving ad placement:", error)
      alert("Failed to save ad placement")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad placement?")) return

    try {
      const { error } = await supabase.from("ad_placements").delete().eq("id", id)
      if (error) throw error
      await fetchAdPlacements()
    } catch (error) {
      console.error("Error deleting ad placement:", error)
      alert("Failed to delete ad placement")
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("ad_placements").update({ is_active: !currentStatus }).eq("id", id)
      if (error) throw error
      await fetchAdPlacements()
    } catch (error) {
      console.error("Error updating ad placement:", error)
      alert("Failed to update ad placement")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      position: "",
      ad_code: "",
      network: "",
      is_active: true,
    })
    setEditingAd(null)
  }

  const startEdit = (ad: AdPlacement) => {
    setEditingAd(ad)
    setFormData({
      name: ad.name,
      position: ad.position,
      ad_code: ad.ad_code,
      network: ad.network,
      is_active: ad.is_active,
    })
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return <div>Loading ad placements...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ad Placements</h2>
          <p className="text-muted-foreground">Manage advertisement placements across your site</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Ad Placement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAd ? "Edit" : "Add"} Ad Placement</DialogTitle>
              <DialogDescription>Configure advertisement placement settings</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Header Banner Ad"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Header</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="in-article">In-Article</SelectItem>
                      <SelectItem value="footer">Footer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="network">Ad Network</Label>
                <Select
                  value={formData.network}
                  onValueChange={(value) => setFormData({ ...formData, network: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ad network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google-adsense">Google AdSense</SelectItem>
                    <SelectItem value="media-net">Media.net</SelectItem>
                    <SelectItem value="amazon-associates">Amazon Associates</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ad_code">Ad Code</Label>
                <Textarea
                  id="ad_code"
                  value={formData.ad_code}
                  onChange={(e) => setFormData({ ...formData, ad_code: e.target.value })}
                  placeholder="Paste your ad code here..."
                  rows={6}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingAd ? "Update" : "Create"} Ad Placement</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {adPlacements.map((ad) => (
          <Card key={ad.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{ad.name}</CardTitle>
                  <CardDescription>
                    Position: {ad.position} • Network: {ad.network}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={ad.is_active ? "default" : "secondary"}>{ad.is_active ? "Active" : "Inactive"}</Badge>
                  <Button variant="outline" size="sm" onClick={() => toggleActive(ad.id, ad.is_active)}>
                    {ad.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => startEdit(ad)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(ad.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono text-gray-600 max-h-32 overflow-y-auto">
                {ad.ad_code.substring(0, 200)}
                {ad.ad_code.length > 200 && "..."}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
