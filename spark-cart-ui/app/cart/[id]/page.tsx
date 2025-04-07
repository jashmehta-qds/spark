import { CartHeader } from "@/components/cart/cart-header"
import { CartItemList } from "@/components/cart/cart-item-list"
import { CartPoll } from "@/components/cart/cart-poll"
import { getServerAuthSession } from "@/lib/auth"
import { getCartWithItems } from "@/lib/supabase/carts"
import { notFound } from "next/navigation"

interface CartPageProps {
  params: {
    id: string
  }
}

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  upvotes: number
  downvotes: number
  url: string
  description: string
  aiSuggestion: string
}

const DEMO_ITEMS: CartItem[] = [
  {
    id: "1",
    name: "Wireless Noise Cancelling Headphones",
    price: 299.99,
    image: "/placeholder.svg?height=200&width=200",
    upvotes: 24,
    downvotes: 3,
    url: "#",
    description:
      "Premium wireless headphones with industry-leading noise cancellation, exceptional sound quality, and up to 30 hours of battery life.",
    aiSuggestion:
      "These headphones are highly rated for their sound quality and noise cancellation. They're a good investment if you travel frequently or work in noisy environments.",
  },
  {
    id: "2",
    name: "Smart Fitness Watch",
    price: 199.99,
    image: "/placeholder.svg?height=200&width=200",
    upvotes: 18,
    downvotes: 7,
    url: "#",
    description:
      "Advanced fitness tracker with heart rate monitoring, GPS, sleep tracking, and 7-day battery life.",
    aiSuggestion:
      "This fitness watch offers good value for the features. Consider if you'll use all the advanced tracking capabilities before purchasing.",
  },
  {
    id: "3",
    name: "Portable Bluetooth Speaker",
    price: 129.99,
    image: "/placeholder.svg?height=200&width=200",
    upvotes: 12,
    downvotes: 2,
    url: "#",
    description:
      "Waterproof portable speaker with 360° sound, 24-hour battery life, and durable design for outdoor adventures.",
    aiSuggestion:
      "This speaker is well-reviewed for its durability and sound quality. It's a good choice if you need something portable and weather-resistant.",
  },
]

export default async function CartPage({ params }: CartPageProps) {
  // Await all server-side data fetching concurrently
  const [session, cartId] = await Promise.all([
    getServerAuthSession(),
    Promise.resolve(params.id)
  ])

  // Get the user ID from the session if it exists
  const userId = session?.user?.id

  // For demo purposes
  if (cartId === "demo") {
    return (
      <div className="min-h-screen bg-background pb-16">
        <div className="w-full bg-primary/5 border-b border-primary/10 mb-6">
          <div className="container px-4 md:px-6 py-8 mx-auto">
            <CartHeader
              title="My Summer Shopping Cart"
              owner={{
                name: "Demo User",
                image: "/placeholder.svg?height=40&width=40",
              }}
              createdAt={new Date().toISOString()}
              totalInteractions={42}
            />
          </div>
        </div>
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-10 lg:grid-cols-[1fr_350px] xl:grid-cols-[1fr_400px]">
            <div>
              <CartItemList
                items={DEMO_ITEMS}
                cartId={cartId}
                isAuthenticated={!!session}
                userId={userId}
              />
            </div>
            <div className="lg:sticky lg:top-20 h-fit">
              <CartPoll cartId={cartId} isAuthenticated={!!session} yesVotes={32} noVotes={10} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Get real cart data
  const cart = await getCartWithItems(cartId)

  if (!cart) {
    notFound()
  }

  // Transform cart items to match the CartItem interface
  const transformedItems: CartItem[] = cart.items.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    image: item.image,
    upvotes: item.upvotes,
    downvotes: item.downvotes,
    url: item.url,
    description: item.description,
    aiSuggestion: item.ai_suggestion
  }))

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="w-full bg-primary/5 border-b border-primary/10 mb-6">
        <div className="container px-4 md:px-6 py-8 mx-auto">
          <CartHeader
            title={cart.title}
            owner={{
              name: cart.owner.name || "Anonymous",
              image: cart.owner.image || "/placeholder.svg?height=40&width=40",
            }}
            createdAt={cart.createdAt}
            totalInteractions={cart.totalInteractions}
          />
        </div>
      </div>
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid gap-10 lg:grid-cols-[1fr_350px] xl:grid-cols-[1fr_400px]">
          <div>
            <CartItemList 
              items={transformedItems} 
              cartId={cartId} 
              isAuthenticated={!!session} 
              userId={userId}
            />
          </div>
          <div className="lg:sticky lg:top-20 h-fit">
            <CartPoll 
              cartId={cartId} 
              isAuthenticated={!!session} 
              yesVotes={cart.yesVotes} 
              noVotes={cart.noVotes} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

