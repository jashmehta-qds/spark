"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { BarChart, Home, LogOut, PlusCircle, Settings, ShoppingCart } from "lucide-react"
import type { User } from "next-auth"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface AppSidebarProps {
  user: User | null
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="pb-0">
        <Link href="/" className="flex items-center gap-2 px-4 py-3">
          <ShoppingCart className="h-6 w-6" />
          <span className="font-bold text-xl text-foreground">Spark Cart</span>
        </Link>
        <SidebarSeparator />
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/dashboard"} tooltip="Dashboard">
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/create"} tooltip="Create Cart">
              <Link href="/create">
                <PlusCircle className="h-4 w-4" />
                <span>Create Cart</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/analytics"} tooltip="Analytics">
              <Link href="/analytics">
                <BarChart className="h-4 w-4" />
                <span>Analytics</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/settings"} tooltip="Settings">
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      {user ? (
        <SidebarFooter>
          <SidebarSeparator />
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.image || ""} alt={user.name || ""} />
                <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-sm">{user.name}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[140px]">{user.email}</span>
              </div>
            </div>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full justify-start"
              tooltip="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </div>
        </SidebarFooter>
      ) : null}

      <SidebarRail />
    </Sidebar>
  )
}

