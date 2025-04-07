// This file would contain the OpenAI API integration
// For demo purposes, we're just providing a skeleton

import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateProductDescription(productName: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates concise, informative product descriptions.",
        },
        {
          role: "user",
          content: `Generate a brief, factual description for this product: ${productName}`,
        },
      ],
      max_tokens: 100,
    })

    return response.choices[0].message.content || "No description available."
  } catch (error) {
    console.error("Error generating product description:", error)
    return "No description available."
  }
}

export async function generateProductSuggestion(productName: string, price: number): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful shopping assistant that provides balanced, honest advice about whether a product is worth purchasing.",
        },
        {
          role: "user",
          content: `Provide a brief, balanced suggestion about whether this product is worth buying. Product: ${productName}, Price: $${price}`,
        },
      ],
      max_tokens: 100,
    })

    return response.choices[0].message.content || "No suggestion available."
  } catch (error) {
    console.error("Error generating product suggestion:", error)
    return "No suggestion available."
  }
}

