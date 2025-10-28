import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { db } from '@/lib/db';

// Use the same JWT secret as auth.ts
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 
  'pmo-production-secret-key-2024-fixed-secret-key-for-consistency'
);

async function checkIpWhitelist(request: NextRequest): Promise<boolean> {
  try {
    // Get security settings
    const settings = await db.securitySettings.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!settings || !settings.enableIpWhitelist) {
      return true; // IP whitelist disabled, allow all
    }

    const clientIp = request.ip || 
                     request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';

    const allowedIps = settings.allowedIps as string[];
    
    // Check if client IP is in whitelist
    const isAllowed = allowedIps.some(allowedIp => {
      // Support CIDR notation (basic implementation)
      if (allowedIp.includes('/')) {
        // For now, just check exact match for simplicity
        return clientIp === allowedIp.split('/')[0];
      }
      return clientIp === allowedIp || clientIp.startsWith(allowedIp);
    });

    if (!isAllowed) {
      console.log(`IP Whitelist: Blocked access from ${clientIp}`);
    }

    return isAllowed;
  } catch (error) {
    console.error('IP Whitelist check failed:', error);
    return true; // Allow access if check fails
  }
}

export async function middleware(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  // Public routes that don't require authentication
  const publicRoutes = ['/api/auth/login', '/api/auth/register', '/api/health'];
  
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Check IP whitelist for all API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ipAllowed = await checkIpWhitelist(request);
    if (!ipAllowed) {
      return NextResponse.json(
        { success: false, error: 'Access denied: IP not whitelisted' },
        { status: 403 }
      );
    }
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