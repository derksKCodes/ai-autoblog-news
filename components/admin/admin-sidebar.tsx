"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, FileText, Rss, Settings, Users, DollarSign, Quote as Queue, Globe, PlusCircle } from "lucide-react"

interface AdminSidebarProps {
  userRole: string
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: BarChart3 },
  { name: "Articles", href: "/admin/articles", icon: FileText },
  { name: "Content Queue", href: "/admin/queue", icon: Queue },
  { name: "RSS Sources", href: "/admin/rss", icon: Rss },
  { name: "Categories", href: "/admin/categories", icon: PlusCircle },
  { name: "Monetization", href: "/admin/monetization", icon: DollarSign },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Translations", href: "/admin/translations", icon: Globe },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname()

  const filteredNavigation = navigation.filter((item) => {
    // Hide user management for non-admin roles
    if (item.name === "Users" && userRole !== "admin") {
      return false
    }
    return true
  })

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">News Admin</h1>
        <p className="text-sm text-gray-500 capitalize">{userRole}</p>
      </div>
      <nav className="mt-6">
        <div className="px-3">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500",
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
