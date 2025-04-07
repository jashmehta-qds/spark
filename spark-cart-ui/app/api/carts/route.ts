import { NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { createCart } from "@/lib/supabase/carts"
import { generateProductDescription, generateProductSuggestion } from "@/lib/openai"

export async function POST(request: Request) {
  const session = await getServerAuthSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, cartUrl, items } = body

    // Process items to add AI-generated content
    const processedItems = await Promise.all(
      items.map(async (item: any) => {
        // Generate AI description and suggestion
        const [description, aiSuggestion] = await Promise.all([
          generateProductDescription(item.name),
          generateProductSuggestion(item.name, item.price),
        ])

        return {
          ...item,
          description,
          aiSuggestion,
        }
      }),
    )

    // Create cart with processed items
    const cartId = await createCart({
      userId: session.user.id,
      title,
      cartUrl,
      items: processedItems,
    })

    return NextResponse.json({ cartId })
  } catch (error) {
    console.error("Error creating cart:", error)
    return NextResponse.json({ error: "Failed to create cart" }, { status: 500 })
  }
}

