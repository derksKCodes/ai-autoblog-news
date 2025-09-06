import { type NextRequest, NextResponse } from "next/server"
import { ContentProcessor } from "@/lib/content-processor"
import * as XLSX from "xlsx"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const sourceType = formData.get("sourceType") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let data: any[] = []

    // Parse different file formats
    switch (sourceType) {
      case "json":
        const jsonText = buffer.toString("utf-8")
        data = JSON.parse(jsonText)
        break

      case "csv":
        // Simple CSV parsing (you might want to use a proper CSV library)
        const csvText = buffer.toString("utf-8")
        const lines = csvText.split("\n")
        const headers = lines[0].split(",").map((h) => h.trim())

        data = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim())
          const obj: any = {}
          headers.forEach((header, index) => {
            obj[header] = values[index] || ""
          })
          return obj
        })
        break

      case "excel":
        const workbook = XLSX.read(buffer, { type: "buffer" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        data = XLSX.utils.sheet_to_json(worksheet)
        break

      default:
        return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "No valid data found in file" }, { status: 400 })
    }

    // Process the data
    const processor = new ContentProcessor()
    await processor.processManualData(data, sourceType as "json" | "csv" | "excel")

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${data.length} items`,
      count: data.length,
    })
  } catch (error) {
    console.error("Error processing uploaded file:", error)
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 })
  }
}
