import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Extract the subdomain (e.g., "school-demo-123" from "school-demo-123.sites.classgrid.in")
  let currentHost = hostname;
  
  if (currentHost.includes('.sites.classgrid.in')) {
    currentHost = currentHost.split('.sites.classgrid.in')[0];
  } else if (currentHost.includes('classgrid-sites.vercel.app')) {
    // If visited directly on Vercel preview, just show a fallback or default
    currentHost = currentHost.split('.classgrid-sites.vercel.app')[0];
  } else {
    // Fallback for localhost or other domains
    currentHost = currentHost.split(':')[0];
  }

  // If there is no subdomain or it's the root domain, let it pass through to the default Next.js page
  if (!currentHost || currentHost === 'classgrid.in' || currentHost === 'localhost') {
    return NextResponse.next();
  }

  // Define your Cloudflare R2 Public URL
  // It uses the environment variable if set, otherwise falls back to the hardcoded default
  const R2_URL = process.env.R2_PUBLIC_URL || 'https://pub-96a564393c0440f2bab37ad8bbe92398.r2.dev';
  
  // If the user visits the root `/`, default to `/index.html`
  const path = url.pathname === '/' ? '/index.html' : url.pathname;
  
  // Rewrite the request to fetch the HTML directly from Cloudflare R2
  // E.g., fetches -> https://pub-96a564393c0440f2bab37ad8bbe92398.r2.dev/websites/nikhil/index.html
  const targetUrl = new URL(`/websites/${currentHost}${path}`, R2_URL);
  
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
