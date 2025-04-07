import { CartHeader } from "@/components/cart/cart-header"
import { CartItemList } from "@/components/cart/cart-item-list"
import { CartPoll } from "@/components/cart/cart-poll"
import { getServerAuthSession } from "@/lib/auth"
import { generateProductDescription, generateProductSuggestion } from "@/lib/openai"
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
  brand?: string
  model?: string
  category?: string
  color?: string
  releaseYear?: number
  gender?: string
  sizes?: string[]
  material?: string
  technology?: string[]
}

const DEMO_ITEMS: CartItem[] = [
  {
    id: "1",
    name: "Nike Air Jordan 1 Retro High OG",
    price: 180.00,
    image: "/placeholder.svg?height=200&width=200",
    upvotes: 35,
    downvotes: 3,
    url: "https://nike.com/air-jordan-1-retro-high-og",
    description: "",
    aiSuggestion: "",
    brand: "Nike",
    model: "Air Jordan 1",
    category: "Basketball",
    color: "University Blue/White",
    releaseYear: 2023,
    gender: "Unisex",
    sizes: ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"],
    material: "Full-grain leather",
    technology: ["Air-Sole cushioning", "Cupsole construction"]
  },
  {
    id: "2",
    name: "Nike Dri-FIT Running Shorts",
    price: 45.00,
    image: "/placeholder.svg?height=200&width=200",
    upvotes: 18,
    downvotes: 2,
    url: "https://nike.com/dri-fit-running-shorts",
    description: "",
    aiSuggestion: "",
    brand: "Nike",
    model: "Flex Stride",
    category: "Running",
    color: "Black/Reflective Silver",
    releaseYear: 2022,
    gender: "Men",
    sizes: ["S", "M", "L", "XL", "XXL"],
    material: "88% Polyester, 12% Spandex",
    technology: ["Dri-FIT", "Reflective elements", "Built-in liner"]
  },
  {
    id: "3",
    name: "Nike Metcon 8 Training Shoes",
    price: 130.00,
    image: "/placeholder.svg?height=200&width=200",
    upvotes: 24,
    downvotes: 4,
    url: "https://nike.com/metcon-8",
    description: "",
    aiSuggestion: "",
    brand: "Nike",
    model: "Metcon 8",
    category: "Training",
    color: "Particle Grey/Dark Smoke Grey/Volt",
    releaseYear: 2023,
    gender: "Unisex",
    sizes: ["US 6", "US 7", "US 8", "US 9", "US 10", "US 11", "US 12"],
    material: "Mesh and synthetic upper",
    technology: ["React foam", "Hyperlift insert", "Chain-link mesh"]
  },
  {
    id: "4",
    name: "Nike Pegasus 40 Running Shoes",
    price: 140.00,
    image: "/placeholder.svg?height=200&width=200",
    upvotes: 29,
    downvotes: 5,
    url: "https://nike.com/pegasus-40",
    description: "",
    aiSuggestion: "",
    brand: "Nike",
    model: "Pegasus 40",
    category: "Running",
    color: "Bright Crimson/Dark Team Red",
    releaseYear: 2023,
    gender: "Men",
    sizes: ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12", "US 13"],
    material: "Engineered mesh",
    technology: ["React foam", "Zoom Air units", "Waffle outsole"]
  }
]

export default async function CartPage({ params }: CartPageProps) {
  // Await all server-side data fetching concurrently
  const session = await getServerAuthSession()
  const { id: cartId } = await params

  // Get the user ID from the session if it exists
  const userId = session?.user?.id

  // For demo purposes
  if (cartId === "demo") {
    // Generate descriptions and suggestions using AI
    const itemsWithAIContent = await Promise.all(
      DEMO_ITEMS.map(async (item) => {
        // Only generate if not already populated
        if (!item.description || !item.aiSuggestion) {
          const [description, aiSuggestion] = await Promise.all([
            generateProductDescription(item.name),
            generateProductSuggestion(item.name, item.price),
          ]);
          
          return {
            ...item,
            description,
            aiSuggestion,
          };
        }
        return item;
      })
    );
    
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
                items={itemsWithAIContent}
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

