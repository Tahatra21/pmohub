import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function middleware(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  // Public routes that don't require authentication
  const publicRoutes = ['/api/auth/login', '/api/auth/register', '/api/health', '/login', '/register'];
  
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Protected pages (authenticated routes)
  if (request.nextUrl.pathname.startsWith('/dashboard') || 
      request.nextUrl.pathname.startsWith('/projects') || 
      request.nextUrl.pathname.startsWith('/tasks') || 
      request.nextUrl.pathname.startsWith('/resources') || 
      request.nextUrl.pathname.startsWith('/budgets') || 
      request.nextUrl.pathname.startsWith('/settings') ||
      request.nextUrl.pathname.startsWith('/product-lifecycle')) {
    
    // Check for token in cookies or localStorage (we'll check localStorage on client side)
    // For now, let the page handle authentication client-side
    return NextResponse.next();
  }

  // API routes require authentication
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('user', JSON.stringify(payload));

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/projects/:path*',
    '/tasks/:path*',
    '/resources/:path*',
    '/budgets/:path*',
    '/settings/:path*',
    '/product-lifecycle/:path*'
  ],
};