"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react"

interface Cart {
  id: string
  title: string
  createdAt: string
  totalInteractions: number
  yesVotes: number
  noVotes: number
  items: {
    id: string
    name: string
    upvotes: number
    downvotes: number
  }[]
}

interface DashboardTabsProps {
  carts: Cart[]
}

export function DashboardTabs({ carts }: DashboardTabsProps) {
  const activeCarts = carts.filter((cart) => {
    const createdAt = new Date(cart.createdAt)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    return diffInDays < 30
  })

  const archivedCarts = carts.filter((cart) => {
    const createdAt = new Date(cart.createdAt)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    return diffInDays >= 30
  })

  return (
    <Tabs defaultValue="active" className="mt-6">
      <TabsList>
        <TabsTrigger value="active">Active Carts</TabsTrigger>
        <TabsTrigger value="archived">Archived</TabsTrigger>
        <TabsTrigger value="stats">Stats</TabsTrigger>
      </TabsList>
      <TabsContent value="active" className="mt-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activeCarts.map((cart) => (
            <CartCard key={cart.id} cart={cart} />
          ))}
        </div>
      </TabsContent>
      <TabsContent value="archived" className="mt-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {archivedCarts.map((cart) => (
            <CartCard key={cart.id} cart={cart} />
          ))}
        </div>
      </TabsContent>
      <TabsContent value="stats" className="mt-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Most Upvoted Item"
            value={getMostUpvotedItem(carts)?.name || "No items"}
            description={`${getMostUpvotedItem(carts)?.upvotes || 0} upvotes`}
          />
          <StatsCard
            title="Most Controversial Item"
            value={getMostControversialItem(carts)?.name || "No items"}
            description={`${getMostControversialItem(carts)?.upvotes || 0} upvotes, ${getMostControversialItem(carts)?.downvotes || 0} downvotes`}
          />
          <StatsCard
            title="Total Interactions"
            value={getTotalInteractions(carts).toString()}
            description="Across all your carts"
          />
        </div>
      </TabsContent>
    </Tabs>
  )
}

function CartCard({ cart }: { cart: Cart }) {
  const totalVotes = cart.yesVotes + cart.noVotes
  const yesPercentage = totalVotes > 0 ? Math.round((cart.yesVotes / totalVotes) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="line-clamp-1">{cart.title}</CardTitle>
        <CardDescription>Created {formatDistanceToNow(new Date(cart.createdAt), { addSuffix: true })}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{cart.totalInteractions} interactions</span>
            </div>
            <Badge variant={yesPercentage >= 50 ? "default" : "destructive"}>{yesPercentage}% Yes</Badge>
          </div>
          <div className="text-sm">
            <p className="font-medium">Top items:</p>
            <ul className="mt-1 space-y-1">
              {cart.items.slice(0, 3).map((item) => (
                <li key={item.id} className="flex items-center justify-between">
                  <span className="line-clamp-1">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{item.upvotes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsDown className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{item.downvotes}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/cart/${cart.id}`} className="w-full">
          <Button variant="outline" className="w-full gap-2">
            <ExternalLink className="h-4 w-4" />
            View Cart
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

function StatsCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

// Helper functions
function getMostUpvotedItem(carts: Cart[]) {
  const allItems = carts.flatMap((cart) => cart.items)
  return allItems.sort((a, b) => b.upvotes - a.upvotes)[0]
}

function getMostControversialItem(carts: Cart[]) {
  const allItems = carts.flatMap((cart) => cart.items)
  return allItems.sort((a, b) => {
    const aControversy = a.upvotes * a.downvotes
    const bControversy = b.upvotes * b.downvotes
    return bControversy - aControversy
  })[0]
}

function getTotalInteractions(carts: Cart[]) {
  return carts.reduce((total, cart) => total + cart.totalInteractions, 0)
}

