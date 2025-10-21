import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Use the same JWT secret as auth.ts
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 
  'pmo-production-secret-key-2024-fixed-secret-key-for-consistency'
);

export async function middleware(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  // Public routes that don't require authentication
  const publicRoutes = ['/api/auth/login', '/api/auth/register', '/api/health'];
  
  if (publicRoutes.includes(request.nextUrl.pathname)) {
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
      console.log('Middleware: Verifying token...');
      const { payload } = await jwtVerify(token, JWT_SECRET);
      console.log('Middleware: Token verified successfully');
      
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('user', JSON.stringify(payload));

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Middleware: Token verification failed:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};