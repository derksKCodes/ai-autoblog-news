"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Trash2, ExternalLink, Copy } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface AffiliateLink {
  id: string
  name: string
  original_url: string
  affiliate_url: string
  commission_rate: number
  network: string
  is_active: boolean
  click_count: number
  created_at: string
}

export function AffiliateLinksManager() {
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingLink, setEditingLink] = useState<AffiliateLink | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: "",
    original_url: "",
    affiliate_url: "",
    commission_rate: 0,
    network: "",
    is_active: true,
  })

  useEffect(() => {
    fetchAffiliateLinks()
  }, [])

  const fetchAffiliateLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("affiliate_links")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setAffiliateLinks(data || [])
    } catch (error) {
      console.error("Error fetching affiliate links:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingLink) {
        const { error } = await supabase.from("affiliate_links").update(formData).eq("id", editingLink.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("affiliate_links").insert([formData])
        if (error) throw error
      }

      await fetchAffiliateLinks()
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving affiliate link:", error)
      alert("Failed to save affiliate link")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this affiliate link?")) return

    try {
      const { error } = await supabase.from("affiliate_links").delete().eq("id", id)
      if (error) throw error
      await fetchAffiliateLinks()
    } catch (error) {
      console.error("Error deleting affiliate link:", error)
      alert("Failed to delete affiliate link")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const resetForm = () => {
    setFormData({
      name: "",
      original_url: "",
      affiliate_url: "",
      commission_rate: 0,
      network: "",
      is_active: true,
    })
    setEditingLink(null)
  }

  const startEdit = (link: AffiliateLink) => {
    setEditingLink(link)
    setFormData({
      name: link.name,
      original_url: link.original_url,
      affiliate_url: link.affiliate_url,
      commission_rate: link.commission_rate,
      network: link.network,
      is_active: link.is_active,
    })
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return <div>Loading affiliate links...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Affiliate Links</h2>
          <p className="text-muted-foreground">Manage affiliate marketing links and track performance</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Affiliate Link
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingLink ? "Edit" : "Add"} Affiliate Link</DialogTitle>
              <DialogDescription>Configure affiliate marketing link settings</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Link Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Amazon Product Link"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="original_url">Original URL</Label>
                <Input
                  id="original_url"
                  value={formData.original_url}
                  onChange={(e) => setFormData({ ...formData, original_url: e.target.value })}
                  placeholder="https://example.com/product"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="affiliate_url">Affiliate URL</Label>
                <Input
                  id="affiliate_url"
                  value={formData.affiliate_url}
                  onChange={(e) => setFormData({ ...formData, affiliate_url: e.target.value })}
                  placeholder="https://affiliate.example.com/product?ref=yourcode"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    step="0.01"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({ ...formData, commission_rate: Number.parseFloat(e.target.value) })}
                    placeholder="5.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="network">Affiliate Network</Label>
                  <Input
                    id="network"
                    value={formData.network}
                    onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                    placeholder="Amazon Associates"
                  />
                </div>
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
                <Button type="submit">{editingLink ? "Update" : "Create"} Affiliate Link</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {affiliateLinks.map((link) => (
          <Card key={link.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{link.name}</CardTitle>
                  <CardDescription>
                    {link.network} • {link.commission_rate}% commission • {link.click_count} clicks
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={link.is_active ? "default" : "secondary"}>
                    {link.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => startEdit(link)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(link.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Original:</span>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">{link.original_url}</code>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(link.original_url)}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Affiliate:</span>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">{link.affiliate_url}</code>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(link.affiliate_url)}>
                  <Copy className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(link.affiliate_url, "_blank")}>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
