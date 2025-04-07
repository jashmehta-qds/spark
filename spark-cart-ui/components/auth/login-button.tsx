"use client"

import type React from "react"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

interface LoginButtonProps {
  children: React.ReactNode
}

export function LoginButton({ children }: LoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem signing in.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div onClick={handleLogin} className={isLoading ? "cursor-not-allowed" : "cursor-pointer"}>
      {children}
    </div>
  )
}

