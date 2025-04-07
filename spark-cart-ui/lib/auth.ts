import { createUser, getUserByEmail } from "@/lib/supabase/users"
import type { NextAuthOptions } from "next-auth"
import { getServerSession as getNextAuthServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // Check if user exists in our database
        const dbUser = await getUserByEmail(user.email as string)

        if (!dbUser) {
          // Create user in our database
          const newUser = await createUser({
            name: user.name as string,
            email: user.email as string,
            image: user.image as string,
          })

          token.id = newUser.id
        } else {
          token.id = dbUser.id
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }

      return session
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
  },
}

// Helper function to get the session on the server
export async function getServerAuthSession() {
  return getNextAuthServerSession(authOptions)
}

