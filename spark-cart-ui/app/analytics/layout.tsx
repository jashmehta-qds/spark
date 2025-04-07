import type React from "react"
import { redirect } from "next/navigation"
import { getServerAuthSession } from "@/lib/auth"
import { SidebarLayout } from "@/components/sidebar/sidebar-layout"

export default async function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerAuthSession()

  if (!session) {
    redirect("/")
  }

  return <SidebarLayout user={session.user}>{children}</SidebarLayout>
}

