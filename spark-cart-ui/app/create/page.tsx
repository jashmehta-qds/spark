import { redirect } from "next/navigation"
import { getServerAuthSession } from "@/lib/auth"
import { CreateCartForm } from "@/components/create/create-cart-form"

export default async function CreatePage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect("/")
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Create a Spark Cart</h1>
      <p className="text-muted-foreground mb-8">Share your shopping cart and get feedback from the community</p>

      <CreateCartForm userId={session.user.id} />
    </div>
  )
}

