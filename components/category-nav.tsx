"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface Category {
  id: string
  name: string
  slug: string
}

interface CategoryNavProps {
  categories: Category[]
}

export function CategoryNav({ categories }: CategoryNavProps) {
  const pathname = usePathname()

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex items-center space-x-1 py-4">
            <Button variant={pathname === "/" ? "default" : "ghost"} size="sm" asChild>
              <Link href="/">All News</Link>
            </Button>

            {categories.map((category) => (
              <Button
                key={category.id}
                variant={pathname === `/category/${category.slug}` ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link href={`/category/${category.slug}`}>{category.name}</Link>
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  )
}
