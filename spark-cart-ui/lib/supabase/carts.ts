import { supabase, supabaseAdmin } from "./client"
import { generateProductDescription, generateProductSuggestion } from "@/lib/openai"

interface CreateCartParams {
  userId: string
  title: string
  cartUrl: string
  items: {
    name: string
    price: number
    url: string
  }[]
}

export async function createCart(params: CreateCartParams): Promise<string> {
  // Start a transaction
  const { data: cart, error: cartError } = await supabaseAdmin
    .from("carts")
    .insert([
      {
        user_id: params.userId,
        title: params.title,
        cart_url: params.cartUrl,
      },
    ])
    .select()
    .single()

  if (cartError || !cart) {
    throw new Error("Failed to create cart")
  }

  // Process items to add AI-generated content
  const processedItems = await Promise.all(
    params.items.map(async (item) => {
      // Generate AI description and suggestion
      const [description, aiSuggestion] = await Promise.all([
        generateProductDescription(item.name),
        generateProductSuggestion(item.name, item.price),
      ])

      return {
        cart_id: cart.id,
        name: item.name,
        price: item.price,
        url: item.url,
        image: "/placeholder.svg?height=200&width=200", // In a real app, you'd use a real image
        description,
        ai_suggestion: aiSuggestion,
      }
    }),
  )

  // Insert items
  const { error: itemsError } = await supabaseAdmin.from("cart_items").insert(processedItems)

  if (itemsError) {
    throw new Error("Failed to create cart items")
  }

  return cart.id
}

export async function getCartWithItems(cartId: string) {
  // Get cart
  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select(`
      id,
      title,
      cart_url,
      created_at,
      profiles (
        name,
        image
      )
    `)
    .eq("id", cartId)
    .single()

  if (cartError || !cart) {
    return null
  }

  // Get items
  const { data: items, error: itemsError } = await supabase
    .from("cart_items")
    .select(`
      id,
      name,
      price,
      image,
      url,
      description,
      ai_suggestion
    `)
    .eq("cart_id", cartId)

  if (itemsError) {
    throw new Error("Failed to get cart items")
  }

  // Get votes
  const { data: votes, error: votesError } = await supabase.from("votes").select("*").eq("cart_id", cartId)

  if (votesError) {
    throw new Error("Failed to get votes")
  }

  // Get comments count
  const { count: commentsCount, error: commentsError } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .in(
      "item_id",
      items.map((item) => item.id),
    )

  if (commentsError) {
    throw new Error("Failed to get comments count")
  }

  // Process items with vote counts
  const processedItems = items.map((item) => {
    const itemVotes = votes.filter((vote) => vote.item_id === item.id)
    const upvotes = itemVotes.filter((vote) => vote.vote_type === "up").length
    const downvotes = itemVotes.filter((vote) => vote.vote_type === "down").length

    return {
      ...item,
      upvotes,
      downvotes,
    }
  })

  // Process cart poll votes
  const yesVotes = votes.filter((vote) => vote.vote_type === "yes").length
  const noVotes = votes.filter((vote) => vote.vote_type === "no").length

  // Calculate total interactions
  const totalInteractions = votes.length + (commentsCount || 0)

  return {
    id: cart.id,
    title: cart.title,
    cartUrl: cart.cart_url,
    createdAt: cart.created_at,
    owner: {
      name: cart.profiles.name,
      image: cart.profiles.image,
    },
    items: processedItems,
    yesVotes,
    noVotes,
    totalInteractions,
  }
}

export async function getUserCarts(userId: string) {
  const { data: carts, error: cartsError } = await supabase
    .from("carts")
    .select(`
      id,
      title,
      created_at
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (cartsError) {
    throw new Error("Failed to get user carts")
  }

  // For each cart, get items, votes, and comments
  const processedCarts = await Promise.all(
    carts.map(async (cart) => {
      // Get items
      const { data: items, error: itemsError } = await supabase
        .from("cart_items")
        .select("id, name")
        .eq("cart_id", cart.id)

      if (itemsError) {
        throw new Error("Failed to get cart items")
      }

      // Get votes
      const { data: votes, error: votesError } = await supabase.from("votes").select("*").eq("cart_id", cart.id)

      if (votesError) {
        throw new Error("Failed to get votes")
      }

      // Get comments count
      const { count: commentsCount, error: commentsError } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .in(
          "item_id",
          items.map((item) => item.id),
        )

      if (commentsError) {
        throw new Error("Failed to get comments count")
      }

      // Process items with vote counts
      const processedItems = items.map((item) => {
        const itemVotes = votes.filter((vote) => vote.item_id === item.id)
        const upvotes = itemVotes.filter((vote) => vote.vote_type === "up").length
        const downvotes = itemVotes.filter((vote) => vote.vote_type === "down").length

        return {
          ...item,
          upvotes,
          downvotes,
        }
      })

      // Process cart poll votes
      const yesVotes = votes.filter((vote) => vote.vote_type === "yes").length
      const noVotes = votes.filter((vote) => vote.vote_type === "no").length

      // Calculate total interactions
      const totalInteractions = votes.length + (commentsCount || 0)

      return {
        id: cart.id,
        title: cart.title,
        createdAt: cart.created_at,
        items: processedItems,
        yesVotes,
        noVotes,
        totalInteractions,
      }
    }),
  )

  return processedCarts
}

