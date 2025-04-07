import { NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { supabase } from "@/lib/supabase/client"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerAuthSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params
    const { voteType, itemId } = await request.json()

    // Check if user has already voted
    const { data: existingVote, error: checkError } = await supabase
      .from("votes")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("item_id", itemId)
      .eq("vote_type", voteType)
      .maybeSingle()

    if (checkError) {
      throw new Error("Failed to check existing vote")
    }

    if (existingVote) {
      // Remove vote if it exists
      const { error: deleteError } = await supabase.from("votes").delete().eq("id", existingVote.id)

      if (deleteError) {
        throw new Error("Failed to remove vote")
      }
    } else {
      // Add vote
      const { error: insertError } = await supabase.from("votes").insert([
        {
          user_id: session.user.id,
          cart_id: id,
          item_id: itemId,
          vote_type: voteType,
        },
      ])

      if (insertError) {
        throw new Error("Failed to add vote")
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error recording vote:", error)
    return NextResponse.json({ error: "Failed to record vote" }, { status: 500 })
  }
}

