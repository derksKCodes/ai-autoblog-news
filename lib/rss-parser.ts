import { XMLParser } from "fast-xml-parser"

export interface RSSItem {
  title: string
  description: string
  link: string
  pubDate: string
  author?: string
  category?: string
  guid?: string
  content?: string
}

export interface RSSFeed {
  title: string
  description: string
  link: string
  items: RSSItem[]
}

export class RSSParser {
  private parser: XMLParser

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      parseAttributeValue: true,
    })
  }

  async fetchAndParse(url: string): Promise<RSSFeed> {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "AutoNews RSS Aggregator 1.0",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const xmlText = await response.text()
      const parsed = this.parser.parse(xmlText)

      // Handle different RSS formats (RSS 2.0, Atom, etc.)
      const feed = parsed.rss?.channel || parsed.feed
      if (!feed) {
        throw new Error("Invalid RSS format")
      }

      const items = this.normalizeItems(feed.item || feed.entry || [])

      return {
        title: feed.title?.["#text"] || feed.title || "Unknown Feed",
        description: feed.description?.["#text"] || feed.description || feed.subtitle || "",
        link: feed.link?.["@_href"] || feed.link || "",
        items,
      }
    } catch (error) {
      console.error(`Error parsing RSS feed ${url}:`, error)
      throw error
    }
  }

  private normalizeItems(items: any[]): RSSItem[] {
    if (!Array.isArray(items)) {
      items = [items]
    }

    return items.map((item) => ({
      title: this.extractText(item.title),
      description: this.extractText(item.description || item.summary || item.content),
      link: item.link?.["@_href"] || item.link || item.id || "",
      pubDate: item.pubDate || item.published || item.updated || new Date().toISOString(),
      author: this.extractText(item.author?.name || item.author || item["dc:creator"]),
      category: this.extractText(item.category?.["#text"] || item.category),
      guid: item.guid?.["#text"] || item.guid || item.id,
      content: this.extractText(item["content:encoded"] || item.content?.["#text"] || item.content),
    }))
  }

  private extractText(value: any): string {
    if (!value) return ""
    if (typeof value === "string") return value
    if (value["#text"]) return value["#text"]
    if (value._ || value.__cdata) return value._ || value.__cdata
    return String(value)
  }
}
