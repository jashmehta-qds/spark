import type { User } from "next-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

interface DashboardHeaderProps {
  user: User
  cartCount: number
}

export function DashboardHeader({ user, cartCount }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.image || ""} alt={user.name || ""} />
          <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">
            {cartCount} {cartCount === 1 ? "cart" : "carts"} shared
          </p>
        </div>
      </div>
      <Link href="/create">
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create New Cart
        </Button>
      </Link>
    </div>
  )
}

