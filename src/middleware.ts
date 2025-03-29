import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"
import { logAuthRequest } from "./lib/auth-debugging"

// Middleware principal qui combine la protection des routes et le débogage
export default withAuth(
  // Fonction de middleware personnalisée
  function middleware(request: NextRequest) {
    // Logger les requêtes d'authentification
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
      logAuthRequest(request)
    }
    return NextResponse.next()
  },
  // Options de configuration NextAuth
  {
    pages: {
      signIn: "/auth/signin",
    },
  }
)

export const config = {
  matcher: [
    // Routes à protéger
    "/dashboard/:path*",
    "/profile/:path*",
    // Routes d'authentification à logger
    '/api/auth/:path*'
  ],
} 