interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  featured_image_url?: string
  published_at: string
  updated_at: string
  source_name?: string
  source_url?: string
  categories?: { name: string }
}

interface StructuredDataProps {
  article: Article
}

export function StructuredData({ article }: StructuredDataProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-news-site.com"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: article.featured_image_url ? [article.featured_image_url] : [],
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: {
      "@type": "Organization",
      name: "News Team",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Your News Site",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
        width: 200,
        height: 60,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/article/${article.id}`,
    },
    articleSection: article.categories?.name,
    inLanguage: "en-US",
    isAccessibleForFree: true,
    ...(article.source_url && {
      isBasedOn: {
        "@type": "CreativeWork",
        url: article.source_url,
        name: article.source_name,
      },
    }),
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
}
