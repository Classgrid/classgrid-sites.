import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Extract the subdomain (e.g., "nikhil" from "nikhil.classgrid.in")
  let currentHost = hostname;
  
  if (process.env.NODE_ENV === 'production') {
    currentHost = hostname.replace('.classgrid.in', '');
  } else {
    currentHost = hostname.replace('.localhost:3000', '');
  }

  // If there is no subdomain or it's the root domain, let it pass through to the default Next.js page
  if (!currentHost || currentHost === 'classgrid.in' || currentHost === 'localhost:3000') {
    return NextResponse.next();
  }

  // Define your Cloudflare R2 Public URL
  // It uses the environment variable if set, otherwise falls back to the hardcoded default
  const R2_URL = process.env.R2_PUBLIC_URL || 'https://pub-96a564393c0440f2bab37ad8bbe92398.r2.dev';
  
  // If the user visits the root `/`, default to `/index.html`
  const path = url.pathname === '/' ? '/index.html' : url.pathname;
  
  // Rewrite the request to fetch the HTML directly from Cloudflare R2
  // E.g., fetches -> https://pub-96a564393c0440f2bab37ad8bbe92398.r2.dev/sites/nikhil/index.html
  const targetUrl = new URL(`/sites/${currentHost}${path}`, R2_URL);
  
  return NextResponse.rewrite(targetUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
