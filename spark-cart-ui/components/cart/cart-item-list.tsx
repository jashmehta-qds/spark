"use client"

import { CartItem } from "@/components/cart/cart-item"

interface CartItemListProps {
  items: {
    id: string
    name: string
    price: number
    image: string
    upvotes: number
    downvotes: number
    url: string
    description: string
    aiSuggestion: string
  }[]
  cartId: string
  isAuthenticated: boolean
  userId: string | undefined
}

export function CartItemList({ items, cartId, isAuthenticated, userId }: CartItemListProps) {
  return (
    <div className="space-y-8">
      {items.map((item) => (
        <CartItem key={item.id} item={item} cartId={cartId} isAuthenticated={isAuthenticated} userId={userId} />
      ))}
    </div>
  )
}

