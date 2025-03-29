import { NextRequest, NextResponse } from "next/server"
import { logAuthRequest } from "@/lib/auth-debugging"

export async function middleware(request: NextRequest) {
  // Logger les requêtes d'authentification
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    logAuthRequest(request)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Matcher pour les routes d'API liées à l'authentification
    '/api/auth/:path*'
  ],
} 