// This file would contain the OpenAI API integration
// For demo purposes, we're just providing a skeleton

import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateProductDescription(productName: string): Promise<string> {
  console.log("Generating product description for:", productName)
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates concise, informative product descriptions. Format your response using Markdown for better readability - use headings, bullet points, and emphasis where appropriate.",
        },
        {
          role: "user",
          content: `Generate a brief, factual description for this product: ${productName}. Use markdown formatting for better readability.`,
        },
      ],
      max_tokens: 150,
    })

    return response.choices[0].message.content || "No description available."
  } catch (error) {
    console.error("Error generating product description:", error)
    return "No description available."
  }
}

export async function generateProductSuggestion(productName: string, price: number): Promise<string> {
  console.log("Generating product suggestion for:", productName, "with price:", price)
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful shopping assistant that provides balanced, honest advice about whether a product is worth purchasing. Evaluate products based on the following key metrics: value for money, quality, durability, versatility, comfort, and style. Provide a concise assessment that helps shoppers make informed decisions. Format your response using Markdown for better readability - use headings, bullet points, and emphasis where appropriate.",
        },
        {
          role: "user",
          content: `Provide a brief, balanced suggestion about whether this product is worth buying. Evaluate it based on value for money, quality, durability, versatility, comfort, and style where applicable. Use markdown formatting to highlight key points. Product: ${productName}, Price: $${price}`,
        },
      ],
      max_tokens: 150,
    })

    return response.choices[0].message.content || "No suggestion available."
  } catch (error) {
    console.error("Error generating product suggestion:", error)
    return "No suggestion available."
  }
}

