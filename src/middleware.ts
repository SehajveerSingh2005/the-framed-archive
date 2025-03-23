import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimiter } from './lib/rateLimit'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Critical routes that need rate limiting
  const protectedPaths = [
    '/api/create-order',    // Payment/order creation
    '/auth/verify',         // Email verification
  ]

  // Check if current path needs rate limiting
  const needsRateLimit = protectedPaths.some(protectedPath => 
    path.startsWith(protectedPath)
  )

  if (needsRateLimit) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1'
    
    if (rateLimiter.isRateLimited(ip)) {
      const response = new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': (rateLimiter.getTimeUntilReset(ip) / 1000).toString()
        }
      })
      
      // Add security headers
      addSecurityHeaders(response)
      return response
    }
  }

  const response = NextResponse.next()
  addSecurityHeaders(response)
  return response
}

// Separate function for security headers
function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 
    "camera=(), " +
    "microphone=(), " +
    "geolocation=(), " +
    "payment=*, " +
    "clipboard-write=*"
  )
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "img-src 'self' data: https: blob:; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: https://*.firebaseapp.com https://*.google.com https://*.razorpay.com; " +
    "style-src 'self' 'unsafe-inline' https:; " +
    "font-src 'self' data: https: chrome-extension:; " +
    "frame-src 'self' https://*.firebaseapp.com https://*.google.com https://*.razorpay.com; " +
    "connect-src 'self' https: wss: data: https://*.firebaseapp.com https://*.googleapis.com https://*.razorpay.com https://lumberjack.razorpay.com; " +
    "worker-src 'self' blob:;"
  )
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}