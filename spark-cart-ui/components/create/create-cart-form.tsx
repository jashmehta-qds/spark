"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { createCart } from "@/lib/supabase/carts"

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  cartUrl: z.string().url({
    message: "Please enter a valid URL.",
  }),
  items: z
    .array(
      z.object({
        name: z.string().min(1, { message: "Item name is required" }),
        price: z.string().refine(
          (val) => {
            const num = Number.parseFloat(val)
            return !isNaN(num) && num > 0
          },
          { message: "Price must be a positive number" },
        ),
        url: z.string().url({ message: "Please enter a valid URL" }),
      }),
    )
    .min(1, { message: "Add at least one item" }),
})

interface CreateCartFormProps {
  userId: string
}

export function CreateCartForm({ userId }: CreateCartFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      cartUrl: "",
      items: [{ name: "", price: "", url: "" }],
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)

      // Convert price strings to numbers
      const formattedItems = values.items.map((item) => ({
        ...item,
        price: Number.parseFloat(item.price),
      }))

      // In a real app, we would call an API to create the cart
      const cartId = await createCart({
        userId,
        title: values.title,
        cartUrl: values.cartUrl,
        items: formattedItems,
      })

      toast({
        title: "Cart created",
        description: "Your cart has been created successfully.",
      })

      router.push(`/cart/${cartId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem creating your cart.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = () => {
    const currentItems = form.getValues("items")
    form.setValue("items", [...currentItems, { name: "", price: "", url: "" }])
  }

  const removeItem = (index: number) => {
    const currentItems = form.getValues("items")
    if (currentItems.length > 1) {
      form.setValue(
        "items",
        currentItems.filter((_, i) => i !== index),
      )
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cart Title</FormLabel>
              <FormControl>
                <Input placeholder="My Summer Shopping Cart" {...field} />
              </FormControl>
              <FormDescription>Give your cart a descriptive title</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cartUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Original Cart URL (optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://shop.com/cart/123456" {...field} />
              </FormControl>
              <FormDescription>Link to your original shopping cart if available</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Cart Items</h3>
            <Button type="button" variant="outline" onClick={addItem}>
              Add Item
            </Button>
          </div>

          {form.watch("items").map((_, index) => (
            <Card key={index} className="p-4">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name={`items.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Wireless Headphones" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`items.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input placeholder="99.99" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.url`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://shop.com/item/123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch("items").length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2 self-end"
                    onClick={() => removeItem(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Spark Cart"}
        </Button>
      </form>
    </Form>
  )
}

