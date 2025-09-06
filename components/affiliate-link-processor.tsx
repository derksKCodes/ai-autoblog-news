"use client"

import { useEffect } from "react"

interface AffiliateLinkProcessorProps {
  content: string
  affiliateLinks: Array<{
    id: string
    original_url: string
    affiliate_url: string
  }>
}

export function AffiliateLinkProcessor({ content, affiliateLinks }: AffiliateLinkProcessorProps) {
  useEffect(() => {
    // Process affiliate links in article content
    const processAffiliateLinks = () => {
      const contentElement = document.querySelector(".article-content")
      if (!contentElement) return

      affiliateLinks.forEach((link) => {
        const links = contentElement.querySelectorAll(`a[href="${link.original_url}"]`)
        links.forEach((linkElement) => {
          // Replace with tracked affiliate link
          linkElement.setAttribute("href", `/api/affiliate/click/${link.id}`)
          linkElement.setAttribute("target", "_blank")
          linkElement.setAttribute("rel", "noopener noreferrer sponsored")

          // Add affiliate disclosure if not present
          if (!linkElement.querySelector(".affiliate-disclosure")) {
            const disclosure = document.createElement("span")
            disclosure.className = "affiliate-disclosure text-xs text-muted-foreground ml-1"
            disclosure.textContent = "(affiliate link)"
            linkElement.appendChild(disclosure)
          }
        })
      })
    }

    processAffiliateLinks()
  }, [content, affiliateLinks])

  return null // This component doesn't render anything visible
}
