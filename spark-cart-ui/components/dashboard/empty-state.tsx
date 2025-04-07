import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <ShoppingCart className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="mt-6 text-2xl font-bold">No carts yet</h2>
      <p className="mt-2 text-muted-foreground">
        Create your first Spark Cart to get feedback from friends and the community
      </p>
      <Link href="/create" className="mt-6">
        <Button>Create Your First Cart</Button>
      </Link>
    </div>
  )
}

