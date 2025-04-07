import { LoginButton } from "@/components/auth/login-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getServerAuthSession } from "@/lib/auth"
import { ArrowRight, LogIn, ShoppingCart } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  const session = await getServerAuthSession()

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container mx-auto px-4 py-8">
        <section className="w-full py-12 md:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-16 xl:grid-cols-[1fr_500px]">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none text-foreground">
                  Should you buy it?<br/><span className="text-primary">Let the crowd decide!</span>
                </h1>
                <p className="max-w-[600px] text-xl text-muted-foreground md:text-2xl">
                  Share your shopping cart and get instant feedback from friends and the community. Upvotes, comments,
                  and AI-powered suggestions help you make better buying decisions.
                </p>
              </div>
              <div className="flex flex-col gap-4 min-[400px]:flex-row">
                {session ? (
                  <Link href="/dashboard" passHref>
                    <Button size="lg" className="btn-primary h-12 px-8">
                      Go to Dashboard <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <LoginButton>
                    <Button size="lg" className="btn-primary h-12 px-8">
                      <LogIn className="h-5 w-5 mr-2" /> Login with Google
                    </Button>
                  </LoginButton>
                )}
                <Link href="/cart/demo" passHref>
                  <Button variant="outline" size="lg" className="h-12 px-8 border-2 border-secondary/20 hover:bg-secondary/5">
                    View Demo Cart
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Card className="w-full glass-effect rounded-2xl shadow-lg border-primary/10">
                <CardHeader className="space-y-2 border-b border-primary/10 pb-6">
                  <CardTitle className="text-2xl font-bold text-foreground">
                    Paste a cart link
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-base">
                    Enter a link to your shopping cart to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form className="grid gap-5">
                    <Input 
                      type="url" 
                      placeholder="https://shop.com/cart/123456" 
                      className="input-modern h-14 text-base"
                    />
                    <Button type="submit" className="btn-primary h-12">
                      <ShoppingCart className="mr-2 h-5 w-5" /> Create Spark Cart
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-between text-sm text-muted-foreground border-t border-primary/10 pt-6">
                  <p>Works with most major e-commerce sites</p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-16 md:py-20 my-8 bg-primary/5 rounded-3xl">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
              <div className="space-y-2 max-w-[800px]">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                  How <span className="text-primary">Spark Cart</span> works
                </h2>
                <p className="text-xl text-muted-foreground">
                  Spark Cart makes shopping decisions social and fun
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-8 py-6 lg:grid-cols-3 lg:gap-12">
              {[
                {
                  icon: <ShoppingCart className="h-8 w-8" />,
                  title: "Share your cart",
                  description: "Create a Spark Cart from any e-commerce site and share the link with friends"
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-8 w-8"
                    >
                      <path d="M7 10v12" />
                      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
                    </svg>
                  ),
                  title: "Get feedback",
                  description: "Friends and community members vote and comment on your items"
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-8 w-8"
                    >
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  ),
                  title: "Make better decisions",
                  description: "Use the wisdom of the crowd and AI suggestions to decide what to buy"
                }
              ].map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-white shadow-sm border border-primary/10 card-hover">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-md">
                    {feature.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

