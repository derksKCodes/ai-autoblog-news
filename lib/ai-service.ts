import { generateText, generateObject } from "ai"
import { groq } from "@ai-sdk/groq"

export interface AIGeneratedContent {
  title: string
  content: string
  metaDescription: string
  keywords: string[]
  category: string
  summary: string
}

export interface TranslationResult {
  title: string
  content: string
  metaDescription: string
  language: string
}

export class AIContentService {
  private model = groq("llama-3.1-70b-versatile")

  async rewriteArticle(
    originalContent: string,
    originalTitle: string,
    sourceUrl?: string,
  ): Promise<AIGeneratedContent> {
    try {
      const { object } = await generateObject({
        model: this.model,
        schema: {
          type: "object",
          properties: {
            title: { type: "string", description: "SEO-optimized, engaging title" },
            content: {
              type: "string",
              description: "Completely rewritten article content, unique and plagiarism-free",
            },
            metaDescription: { type: "string", description: "SEO meta description (150-160 characters)" },
            keywords: { type: "array", items: { type: "string" }, description: "Relevant SEO keywords" },
            category: { type: "string", description: "Most appropriate category for this article" },
            summary: { type: "string", description: "Brief article summary (2-3 sentences)" },
          },
          required: ["title", "content", "metaDescription", "keywords", "category", "summary"],
        },
        prompt: `
          Rewrite this news article to be completely unique and plagiarism-free while maintaining the core facts and information.
          
          Original Title: ${originalTitle}
          Original Content: ${originalContent}
          ${sourceUrl ? `Source URL: ${sourceUrl}` : ""}
          
          Requirements:
          - Create a completely new, unique article that covers the same topic
          - Use different sentence structures, vocabulary, and phrasing
          - Maintain factual accuracy and key information
          - Make it engaging and SEO-friendly
          - Ensure the content is professional and news-appropriate
          - Generate an attention-grabbing title
          - Create relevant keywords for SEO
          - Categorize appropriately (Technology, Politics, Sports, Business, Health, Entertainment, etc.)
        `,
      })

      return object as AIGeneratedContent
    } catch (error) {
      console.error("AI rewrite failed:", error)
      throw new Error("Failed to rewrite article with AI")
    }
  }

  async generateFromSummary(summary: string, category: string): Promise<AIGeneratedContent> {
    try {
      const { object } = await generateObject({
        model: this.model,
        schema: {
          type: "object",
          properties: {
            title: { type: "string", description: "SEO-optimized, engaging title" },
            content: { type: "string", description: "Full article content based on summary" },
            metaDescription: { type: "string", description: "SEO meta description (150-160 characters)" },
            keywords: { type: "array", items: { type: "string" }, description: "Relevant SEO keywords" },
            category: { type: "string", description: "Article category" },
            summary: { type: "string", description: "Brief article summary" },
          },
          required: ["title", "content", "metaDescription", "keywords", "category", "summary"],
        },
        prompt: `
          Generate a complete news article based on this summary and category.
          
          Summary: ${summary}
          Category: ${category}
          
          Requirements:
          - Create a full, detailed news article (500-800 words)
          - Use professional journalism style
          - Include relevant details and context
          - Make it engaging and informative
          - Ensure SEO optimization
          - Generate compelling title and meta description
        `,
      })

      return object as AIGeneratedContent
    } catch (error) {
      console.error("AI generation failed:", error)
      throw new Error("Failed to generate article with AI")
    }
  }

  async translateContent(
    content: string,
    title: string,
    metaDescription: string,
    targetLanguage: string,
  ): Promise<TranslationResult> {
    try {
      const { object } = await generateObject({
        model: this.model,
        schema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Translated title" },
            content: { type: "string", description: "Translated content" },
            metaDescription: { type: "string", description: "Translated meta description" },
            language: { type: "string", description: "Target language code" },
          },
          required: ["title", "content", "metaDescription", "language"],
        },
        prompt: `
          Translate the following content to ${targetLanguage}. Maintain the meaning, tone, and professional style.
          
          Title: ${title}
          Content: ${content}
          Meta Description: ${metaDescription}
          
          Requirements:
          - Accurate translation maintaining original meaning
          - Professional news writing style in target language
          - Cultural appropriateness for target audience
          - SEO-friendly translated keywords and phrases
        `,
      })

      return object as TranslationResult
    } catch (error) {
      console.error("AI translation failed:", error)
      throw new Error("Failed to translate content with AI")
    }
  }

  async generateImagePrompt(title: string, content: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: this.model,
        prompt: `
          Based on this news article, generate a detailed image prompt for creating a relevant, professional news image.
          
          Title: ${title}
          Content: ${content.substring(0, 500)}...
          
          Create a prompt for a professional, news-appropriate image that would complement this article.
          The prompt should be detailed but concise (1-2 sentences).
          Focus on visual elements that represent the story without being too literal.
        `,
      })

      return text
    } catch (error) {
      console.error("Image prompt generation failed:", error)
      return "Professional news article illustration"
    }
  }

  async categorizeContent(title: string, content: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: this.model,
        prompt: `
          Categorize this news article into one of these categories:
          Technology, Politics, Sports, Business, Health, Entertainment, Science, World News, Local News, Opinion
          
          Title: ${title}
          Content: ${content.substring(0, 300)}...
          
          Return only the category name, nothing else.
        `,
      })

      return text.trim()
    } catch (error) {
      console.error("Categorization failed:", error)
      return "General"
    }
  }
}

export const aiService = new AIContentService()
