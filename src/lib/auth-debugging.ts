import { NextRequest } from "next/server"

export function logAuthRequest(request: NextRequest) {
  const url = request.nextUrl.toString()
  const method = request.method
  const headers = Object.fromEntries(request.headers)
  
  console.log(`[Auth Debug] ${method} ${url}`, {
    headers,
    cookies: request.cookies.getAll(),
    searchParams: Object.fromEntries(request.nextUrl.searchParams)
  })
} 