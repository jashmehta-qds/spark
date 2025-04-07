"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { CheckCircle2, ShoppingCart, ThumbsDown, ThumbsUp } from "lucide-react"
import { useEffect, useState } from "react"

interface CartPollProps {
  cartId: string
  isAuthenticated: boolean
  yesVotes: number
  noVotes: number
}

export function CartPoll({
  cartId,
  isAuthenticated,
  yesVotes: initialYesVotes,
  noVotes: initialNoVotes,
}: CartPollProps) {
  const [yesVotes, setYesVotes] = useState(initialYesVotes)
  const [noVotes, setNoVotes] = useState(initialNoVotes)
  const [userVote, setUserVote] = useState<"yes" | "no" | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const { toast } = useToast()

  const totalVotes = yesVotes + noVotes
  const yesPercentage = totalVotes > 0 ? Math.round((yesVotes / totalVotes) * 100) : 0

  // Check if user has already voted
  useEffect(() => {
    if (!isAuthenticated) return

    const checkUserVote = async () => {
      try {
        const { data, error } = await supabase
          .from("votes")
          .select("vote_type")
          .eq("cart_id", cartId)
          .in("vote_type", ["yes", "no"])
          .maybeSingle()

        if (error) throw error

        if (data) {
          setUserVote(data.vote_type as "yes" | "no")
        }
      } catch (error) {
        console.error("Error checking user vote:", error)
      }
    }

    checkUserVote()
  }, [isAuthenticated, cartId])

  // Set up real-time subscription for votes
  useEffect(() => {
    const subscription = supabase
      .channel(`cart-poll-${cartId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
          filter: `cart_id=eq.${cartId}`,
        },
        () => {
          // Fetch updated vote counts
          supabase
            .from("votes")
            .select("vote_type")
            .eq("cart_id", cartId)
            .in("vote_type", ["yes", "no"])
            .then(({ data, error }) => {
              if (error) return

              if (data) {
                const yesCount = data.filter((vote) => vote.vote_type === "yes").length
                const noCount = data.filter((vote) => vote.vote_type === "no").length

                setYesVotes(yesCount)
                setNoVotes(noCount)
              }
            })
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [cartId])

  const handleVote = async (vote: "yes" | "no") => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote",
        variant: "destructive",
      })
      return
    }

    setIsVoting(true)

    try {
      const response = await fetch(`/api/carts/${cartId}/poll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteType: vote }),
      })

      if (!response.ok) throw new Error("Failed to record vote")

      // If user already voted this way, remove the vote
      if (userVote === vote) {
        setUserVote(null)
      } else {
        // Set new vote
        setUserVote(vote)
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
    <Card className="overflow-hidden border border-primary/20 shadow-md rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Should they purchase this cart?</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          Help the user decide if they should complete their purchase
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between gap-4">
            <Button
              variant={userVote === "yes" ? "default" : "outline"}
              className={`gap-2 w-[48%] rounded-xl h-12 text-base font-medium transition-all ${
                userVote === "yes" 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "hover:bg-green-50 hover:text-green-600 hover:border-green-200"
              }`}
              onClick={() => handleVote("yes")}
              disabled={isVoting}
            >
              <ThumbsUp className="h-5 w-5" />
              Yes ({yesVotes})
            </Button>
            <Button
              variant={userVote === "no" ? "default" : "outline"}
              className={`gap-2 w-[48%] rounded-xl h-12 text-base font-medium transition-all ${
                userVote === "no" 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              }`}
              onClick={() => handleVote("no")}
              disabled={isVoting}
            >
              <ThumbsDown className="h-5 w-5" />
              No ({noVotes})
            </Button>
          </div>

          <div className="space-y-3 bg-secondary/5 p-4 rounded-xl">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="flex items-center gap-1.5 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Yes: {yesPercentage}%
              </span>
              <span className="text-red-600">No: {100 - yesPercentage}%</span>
            </div>
            <div className="h-3 w-full bg-secondary/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${yesPercentage > 50 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${yesPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-3">
              {totalVotes} {totalVotes === 1 ? "vote" : "votes"} total
            </p>
          </div>
          
          <div className="text-center pt-2">
            <Button 
              className="btn-primary w-full py-5 rounded-xl"
            >
              Complete Checkout & Purchase
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              {yesPercentage > 70 
                ? "Highly recommended by the community!" 
                : yesPercentage > 50 
                  ? "The community thinks this is a good purchase"
                  : "Consider reviewing your cart based on feedback"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

