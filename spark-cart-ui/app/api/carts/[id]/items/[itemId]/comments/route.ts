import { NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { supabase } from "@/lib/supabase/client"

export async function POST(request: Request, { params }: { params: { id: string; itemId: string } }) {
  const session = await getServerAuthSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { itemId } = params
    const { content } = await request.json()

    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          user_id: session.user.id,
          item_id: itemId,
          content,
        },
      ])
      .select(`
        id,
        content,
        created_at,
        profiles (
          name,
          image
        )
      `)
      .single()

    if (error) {
      throw new Error("Failed to create comment")
    }

    return NextResponse.json({
      id: data.id,
      content: data.content,
      createdAt: data.created_at,
      user: {
        name: data.profiles.name,
        image: data.profiles.image,
      },
    })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: { id: string; itemId: string } }) {
  try {
    const { itemId } = params

    const { data, error } = await supabase
      .from("comments")
      .select(`
        id,
        content,
        created_at,
        profiles (
          name,
          image
        )
      `)
      .eq("item_id", itemId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error("Failed to get comments")
    }

    const comments = data.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      user: {
        name: comment.profiles.name,
        image: comment.profiles.image,
      },
    }))

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error getting comments:", error)
    return NextResponse.json({ error: "Failed to get comments" }, { status: 500 })
  }
}

