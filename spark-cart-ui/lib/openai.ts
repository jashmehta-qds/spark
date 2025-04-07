// This file would contain the OpenAI API integration
// For demo purposes, we're just providing a skeleton

import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateProductDescription(productName: string): Promise<string> {
  console.log("Generating product description for:", productName)
  try {
    // const response = await openai.chat.completions.create({
    //   model: "gpt-4o",
    //   messages: [
    //     {
    //       role: "system",
    //       content: "You are a helpful assistant that generates concise, informative product descriptions.",
    //     },
    //     {
    //       role: "user",
    //       content: `Generate a brief, factual description for this product: ${productName}`,
    //     },
    //   ],
    //   max_tokens: 100,
    // })

    const query = {
      description: productName
    }

    const response = await fetch('http://127.0.0.1:8000/get_product_description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify( query ),
    });

    const data = await response.json();

    return data.content || "No description available."
  } catch (error) {
    console.error("Error generating product description:", error)
    return "No description available."
  }
}

export async function generateProductSuggestion(productName: string, price: number): Promise<string> {
  console.log("Generating product suggestion for:", productName, "with price:", price)
  try {
    // const response = await openai.chat.completions.create({
    //   model: "gpt-4o",
    //   messages: [
    //     {
    //       role: "system",
    //       content:
    //         "You are a helpful shopping assistant that provides balanced, honest advice about whether a product is worth purchasing. Evaluate products based on the following key metrics: value for money, quality, durability, versatility, comfort, and style. Provide a concise assessment that helps shoppers make informed decisions. Use sources like Reddit / Amazon Reviews etc to judge the product.",
    //     },
    //     {
    //       role: "user",
    //       content: `Provide a brief, balanced suggestion about whether this product is worth buying. Evaluate it based on value for money, quality, durability, versatility, comfort, and style where applicable. Product: ${productName}, Price: $${price}`,
    //     },
    //   ],
    //   max_tokens: 150,
    // })

    // return response.choices[0].message.content || "No suggestion available."
    const query = {
      name: productName
    }

    const response = await fetch('http://127.0.0.1:8000/get_product_suggestion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify( query ),
    });

    const data = await response.json();

    return data.content || "No description available."
  } catch (error) {
    console.error("Error generating product suggestion:", error)
    return "No suggestion available."
  }
}

