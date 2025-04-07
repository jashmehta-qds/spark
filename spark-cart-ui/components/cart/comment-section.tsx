"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    name: string
    image: string
  }
}

interface CommentSectionProps {
  itemId: string
  isAuthenticated: boolean
}

export function CommentSection({ itemId, isAuthenticated }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/carts/any/items/${itemId}/comments`)
        if (!response.ok) throw new Error("Failed to fetch comments")
        const data = await response.json()
        setComments(data)
      } catch (error) {
        console.error("Error fetching comments:", error)
        toast({
          title: "Error",
          description: "Failed to load comments",
          variant: "destructive",
        })
      }
    }

    fetchComments()

    // Set up real-time subscription
    const subscription = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `item_id=eq.${itemId}`,
        },
        (payload) => {
          // Fetch the new comment with user data
          fetch(`/api/carts/any/items/${itemId}/comments`)
            .then((res) => res.json())
            .then((data) => {
              setComments(data)
            })
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [itemId, toast])

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim()) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/carts/any/items/${itemId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      })

      if (!response.ok) throw new Error("Failed to post comment")

      setNewComment("")
    } catch (error) {
      console.error("Error posting comment:", error)
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user.image} alt={comment.user.name} />
              <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{comment.user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-muted-foreground py-4">No comments yet. Be the first to comment!</p>
      )}

      <div className="mt-4 space-y-2">
        <Textarea
          placeholder={isAuthenticated ? "Add a comment..." : "Sign in to comment"}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!isAuthenticated || isLoading}
        />
        <Button onClick={handleSubmitComment} disabled={!isAuthenticated || !newComment.trim() || isLoading} size="sm">
          {isLoading ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </div>
  )
}

