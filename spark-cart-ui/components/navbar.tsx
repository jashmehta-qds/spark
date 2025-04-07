import { LoginButton } from "@/components/auth/login-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { getServerAuthSession } from "@/lib/auth"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"

export async function Navbar() {
  const session = await getServerAuthSession()

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#8b4513]/10 border-b border-[#8b4513]/20">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          <ShoppingCart className="h-6 w-6" />
          <span className="text-lg">Spark Cart</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4">
          <Link href="/cart/demo">
            <Button variant="ghost" className="text-black border-2 border-[#daa520] hover:bg-white/30">Demo</Button>
          </Link>
          {session ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className="text-white hover:bg-white/10">Dashboard</Button>
              </Link>
              <Link href="/create">
                <Button className="glass-button bg-[#daa520]/80 hover:bg-[#daa520] text-white">Create Cart</Button>
              </Link>
              <UserNav user={session.user} />
            </>
          ) : (
            <LoginButton>
              <Button className="glass-button bg-[#daa520]/80 hover:bg-[#daa520] text-white">Sign In</Button>
            </LoginButton>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}

