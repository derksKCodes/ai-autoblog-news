"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, Database, Table } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function ContentUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [sourceType, setSourceType] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)

      // Auto-detect file type
      const extension = selectedFile.name.split(".").pop()?.toLowerCase()
      if (extension === "json") {
        setSourceType("json")
      } else if (extension === "csv") {
        setSourceType("csv")
      } else if (extension === "xlsx" || extension === "xls") {
        setSourceType("excel")
      }
    }
  }

  const handleUpload = async () => {
    if (!file || !sourceType) {
      toast({
        title: "Error",
        description: "Please select a file and source type",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("sourceType", sourceType)

      const response = await fetch("/api/content/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: `Successfully processed ${result.count} items`,
        })
        setFile(null)
        setSourceType("")
        // Reset file input
        const fileInput = document.getElementById("file-upload") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload and process file",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Content Upload</CardTitle>
        <CardDescription>
          Upload scraped data from websites (BBC, CNN, etc.) in JSON, CSV, or Excel format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Format Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium">JSON Format</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Array of objects with fields: headline, link, published_time, source, content
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-5 w-5 text-green-500" />
              <h3 className="font-medium">CSV Format</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Comma-separated values with headers: headline, link, published_time, source, content
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Table className="h-5 w-5 text-purple-500" />
              <h3 className="font-medium">Excel Format</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Spreadsheet with columns: headline, link, published_time, source, content
            </p>
          </div>
        </div>

        {/* Upload Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Select File</Label>
            <Input id="file-upload" type="file" accept=".json,.csv,.xlsx,.xls" onChange={handleFileChange} />
          </div>

          <div>
            <Label htmlFor="source-type">File Type</Label>
            <Select value={sourceType} onValueChange={setSourceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select file type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleUpload} disabled={!file || !sourceType || isUploading} className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Processing..." : "Upload and Process"}
          </Button>
        </div>

        {/* Sample Data Format */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Expected Data Fields:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              <strong>headline/title:</strong> Article title
            </li>
            <li>
              <strong>link/url:</strong> Source URL
            </li>
            <li>
              <strong>published_time/date:</strong> Publication date
            </li>
            <li>
              <strong>source:</strong> Source name (e.g., "BBC", "CNN")
            </li>
            <li>
              <strong>content/body:</strong> Article content (optional)
            </li>
            <li>
              <strong>author:</strong> Author name (optional)
            </li>
            <li>
              <strong>category:</strong> Article category (optional)
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
