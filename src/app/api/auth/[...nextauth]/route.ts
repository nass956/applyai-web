import NextAuth from "next-auth"
import { authOptions } from "./options"

console.log("Configuration NextAuth :", {
  signInPage: authOptions.pages?.signIn,
  providers: authOptions.providers.map(p => p.id)
})

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 