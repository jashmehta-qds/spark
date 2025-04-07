import { redirect } from "next/navigation"
import { getServerAuthSession } from "@/lib/auth"
import { getUserCarts } from "@/lib/supabase/carts"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { EmptyState } from "@/components/dashboard/empty-state"

export default async function DashboardPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect("/")
  }

  const userCarts = await getUserCarts(session.user.id)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Carts</h1>
      {userCarts.length > 0 ? <DashboardTabs carts={userCarts} /> : <EmptyState />}
    </div>
  )
}

