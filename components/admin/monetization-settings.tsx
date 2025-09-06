"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Save } from "lucide-react"

interface MonetizationSetting {
  setting_key: string
  setting_value: string
  description: string
}

export function MonetizationSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from("monetization_settings").select("*")

      if (error) throw error

      const settingsMap = (data || []).reduce((acc: Record<string, string>, setting: MonetizationSetting) => {
        acc[setting.setting_key] = setting.setting_value
        return acc
      }, {})

      setSettings(settingsMap)
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
      }))

      for (const update of updates) {
        const { error } = await supabase.from("monetization_settings").upsert(update, { onConflict: "setting_key" })

        if (error) throw error
      }

      alert("Settings saved successfully!")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div>Loading settings...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monetization Settings</h2>
          <p className="text-muted-foreground">Configure your monetization preferences</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Ad Network Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Ad Network Configuration</CardTitle>
            <CardDescription>Configure your advertising network settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="google_adsense_publisher_id">Google AdSense Publisher ID</Label>
              <Input
                id="google_adsense_publisher_id"
                value={settings.google_adsense_publisher_id || ""}
                onChange={(e) => updateSetting("google_adsense_publisher_id", e.target.value)}
                placeholder="pub-1234567890123456"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amazon_associate_tag">Amazon Associates Tag</Label>
              <Input
                id="amazon_associate_tag"
                value={settings.amazon_associate_tag || ""}
                onChange={(e) => updateSetting("amazon_associate_tag", e.target.value)}
                placeholder="yourtag-20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Auto-insertion Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Automatic Ad Insertion</CardTitle>
            <CardDescription>Configure how ads are automatically inserted into articles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto_insert_ads"
                checked={settings.auto_insert_ads === "true"}
                onCheckedChange={(checked) => updateSetting("auto_insert_ads", checked.toString())}
              />
              <Label htmlFor="auto_insert_ads">Automatically insert ads in articles</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ads_per_article">Maximum ads per article</Label>
              <Input
                id="ads_per_article"
                type="number"
                value={settings.ads_per_article || "3"}
                onChange={(e) => updateSetting("ads_per_article", e.target.value)}
                min="0"
                max="10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Affiliate Disclosure */}
        <Card>
          <CardHeader>
            <CardTitle>Affiliate Disclosure</CardTitle>
            <CardDescription>Legal disclosure text for affiliate links</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="affiliate_disclosure">Disclosure Text</Label>
              <Textarea
                id="affiliate_disclosure"
                value={settings.affiliate_disclosure || ""}
                onChange={(e) => updateSetting("affiliate_disclosure", e.target.value)}
                placeholder="This post contains affiliate links..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
