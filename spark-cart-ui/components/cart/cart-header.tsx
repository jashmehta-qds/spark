import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, Share2, ShoppingBag } from "lucide-react"

interface CartHeaderProps {
  title: string
  owner: {
    name: string
    image: string
  }
  createdAt: string
  totalInteractions: number
}

export function CartHeader({ title, owner, createdAt, totalInteractions }: CartHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-full">
          <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
          Shopping Cart
        </Badge>
        <div className="h-1 w-1 rounded-full bg-muted-foreground"></div>
        <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 px-3 py-1 rounded-full">
          <Share2 className="h-3.5 w-3.5 mr-1.5" />
          Shared
        </Badge>
      </div>
      
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/10">
            <AvatarImage src={owner.image} alt={owner.name} />
            <AvatarFallback className="bg-primary/10 text-primary">{owner.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{owner.name}</p>
            <p className="text-xs text-muted-foreground">
              Created {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="sm:ml-auto flex items-center gap-2 px-3 py-1.5 bg-secondary/5 rounded-full text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4 text-secondary" />
          <span>{totalInteractions} interactions</span>
        </div>
      </div>
    </div>
  )
}

