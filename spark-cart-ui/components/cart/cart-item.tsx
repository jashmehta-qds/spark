"use client"

import { CommentSection } from "@/components/cart/comment-section"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { ExternalLink, MessageSquare, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

interface CartItemProps {
  item: {
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
  cartId: string
  isAuthenticated: boolean
  userId: string | undefined
}

export function CartItem({ item, cartId, isAuthenticated, userId }: CartItemProps) {
  const [upvotes, setUpvotes] = useState(item.upvotes)
  const [downvotes, setDownvotes] = useState(item.downvotes)
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const { toast } = useToast()

  // Check if user has already voted
  useEffect(() => {
    if (!isAuthenticated || !userId) return

    const checkUserVote = async () => {
      try {
        const { data, error } = await supabase
          .from("votes")
          .select("vote_type")
          .eq("user_id", userId)
          .eq("item_id", item.id)
          .in("vote_type", ["up", "down"])
          .maybeSingle()

        if (error) throw error

        if (data) {
          setUserVote(data.vote_type as "up" | "down")
        }
      } catch (error) {
        console.error("Error checking user vote:", error)
      }
    }

    checkUserVote()
  }, [isAuthenticated, userId, item.id])

  // Set up real-time subscription for votes
  useEffect(() => {
    const subscription = supabase
      .channel(`item-votes-${item.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
          filter: `item_id=eq.${item.id}`,
        },
        () => {
          // Fetch updated vote counts
          supabase
            .from("votes")
            .select("vote_type")
            .eq("item_id", item.id)
            .then(({ data, error }) => {
              if (error) return

              if (data) {
                const upCount = data.filter((vote) => vote.vote_type === "up").length
                const downCount = data.filter((vote) => vote.vote_type === "down").length

                setUpvotes(upCount)
                setDownvotes(downCount)
              }
            })
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [item.id])

  const handleVote = async (voteType: "up" | "down") => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote on items",
        variant: "destructive",
      })
      return
    }

    setIsVoting(true)

    try {
      const response = await fetch(`/api/carts/${cartId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voteType,
          itemId: item.id,
        }),
      })

      if (!response.ok) throw new Error("Failed to record vote")

      // If user already voted this way, remove the vote
      if (userVote === voteType) {
        setUserVote(null)
      } else {
        // Set new vote
        setUserVote(voteType)
      }
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Error",
        description: "Failed to record your vote",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <Card className="product-card overflow-hidden">
      <div className="md:grid md:grid-cols-[300px_1fr]">
        <div className="relative aspect-square h-full max-h-[300px] w-full bg-muted">
          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
        </div>
        <div className="p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold tracking-tight md:text-2xl">{item.name}</h3>
              <p className="text-xl font-medium text-primary mt-1">${item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3 py-2 px-3 bg-accent/40 rounded-full">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "vote-button",
                  userVote === "up" && "vote-button-active text-green-600 bg-green-100"
                )}
                onClick={() => handleVote("up")}
                disabled={isVoting}
              >
                <ThumbsUp className="h-5 w-5" />
                <span className="sr-only">Upvote</span>
              </Button>
              <span className="text-sm font-medium min-w-[1.5rem] text-center">{upvotes}</span>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "vote-button",
                  userVote === "down" && "vote-button-active text-red-600 bg-red-100"
                )}
                onClick={() => handleVote("down")}
                disabled={isVoting}
              >
                <ThumbsDown className="h-5 w-5" />
                <span className="sr-only">Downvote</span>
              </Button>
              <span className="text-sm font-medium min-w-[1.5rem] text-center">{downvotes}</span>
            </div>
          </div>

          <Tabs defaultValue="description" className="mt-6">
            <TabsList className="rounded-full h-10 p-1">
              <TabsTrigger value="description" className="rounded-full">Description</TabsTrigger>
              <TabsTrigger value="ai-suggestion" className="rounded-full">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                AI Suggestion
              </TabsTrigger>
              <TabsTrigger value="comments" className="rounded-full">
                <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                Comments
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-5 text-muted-foreground">
              <p>{item.description}</p>
              <div className="mt-4">
                <Link href={item.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-1.5 mt-2 rounded-full px-4">
                    <ExternalLink className="h-3.5 w-3.5" />
                    View on store
                  </Button>
                </Link>
              </div>
            </TabsContent>
            <TabsContent value="ai-suggestion" className="mt-5">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-primary text-white p-1.5 rounded-full">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm text-primary">AI ANALYSIS</span>
                </div>
                <p className="text-muted-foreground">{item.aiSuggestion}</p>
                <div className="absolute w-4 h-4 bg-primary/5 border-t border-l border-primary/20 transform rotate-45 top-6 left-[-8px]"></div>
              </div>
            </TabsContent>
            <TabsContent value="comments" className="mt-5">
              <CommentSection itemId={item.id} isAuthenticated={isAuthenticated} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-border bg-secondary/5 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {upvotes > downvotes ? `${Math.round((upvotes / (upvotes + downvotes)) * 100)}% recommend this product` : "Not enough votes yet"}
        </div>
        <Link href={item.url} target="_blank" rel="noopener noreferrer">
          <Button className="btn-primary px-4 py-2 h-9 text-sm">
            Buy Now
          </Button>
        </Link>
      </div>
    </Card>
  )
}

