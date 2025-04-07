import { supabase, supabaseAdmin } from "./client"

interface User {
  id: string
  name: string
  email: string
  image: string
}

interface CreateUserParams {
  name: string
  email: string
  image: string
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("email", email).single()

  if (error || !data) {
    return null
  }

  return data
}

export async function createUser(params: CreateUserParams): Promise<User> {
  // In a production app, you would create a Supabase auth user first
  // For this demo, we'll just create a profile
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .insert([
      {
        id: crypto.randomUUID(), // In a real app, this would be the auth.uid
        name: params.name,
        email: params.email,
        image: params.image,
      },
    ])
    .select()
    .single()

  if (error || !data) {
    throw new Error("Failed to create user")
  }

  return data
}

