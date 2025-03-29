import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { AuthOptions } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import GoogleProvider from "next-auth/providers/google"
import LinkedInProvider from "next-auth/providers/linkedin"
import AppleProvider from "next-auth/providers/apple"
import { SendVerificationRequestParams } from "next-auth/providers/email"
import { Resend } from "resend"
import { prisma } from "@/lib/prisma"

const resend = new Resend(process.env.RESEND_API_KEY)
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3001"

async function sendVerificationRequest(params: SendVerificationRequestParams) {
  const { identifier, url, provider } = params
  
  // Correction de l'URL dans le contenu HTML
  const correctedUrl = url.replace(/localhost:\d+/, 'localhost:3001')
  
  try {
    const { data, error } = await resend.emails.send({
      from: provider.from || "onboarding@resend.dev",
      to: identifier,
      subject: "Connexion à votre compte",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Lien de connexion</h2>
          <p>Cliquez sur le lien ci-dessous pour vous connecter :</p>
          <a href="${correctedUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">
            Se connecter
          </a>
          <p style="margin-top: 20px; font-size: 14px; color: #666;">
            Si le bouton ne fonctionne pas, copiez ce lien : ${correctedUrl}
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Erreur lors de l'envoi de l'email:", error)
      throw error
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error)
    throw new Error("Erreur lors de l'envoi de l'email de vérification")
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: { scope: 'openid profile email' }
      }
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    }),
    EmailProvider({
      from: process.env.EMAIL_FROM,
      sendVerificationRequest,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // S'assurer que l'URL utilise le bon port
      return url.replace(/localhost:\d+/, 'localhost:3001')
    },
    async signIn({ user, account, profile, email, credentials }) {
      console.log("SIGNIN CALLBACK:", { user, account, profile })
      return true
    },
  }
} 