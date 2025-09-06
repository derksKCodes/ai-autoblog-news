import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if user is an active admin
  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("role, is_active, full_name")
    .eq("id", user.id)
    .single()

  if (adminError || !adminUser?.is_active) {
    redirect("/auth/login")
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar userRole={adminUser.role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={user} adminUser={adminUser} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
