import { NextResponse } from "next/server";

export function middleware(request) {
  // List of protected routes that require authentication
  const protectedRoutes = ["/dashboard"];

  // List of auth routes that should redirect if already logged in
  const authRoutes = ["/login", "/signup"];

  const { pathname } = request.nextUrl;

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Get the token from cookies (you would typically use a real token here)
  // For now, we'll let the client-side handle authentication checks
  // This middleware could be enhanced to check for JWT tokens or session cookies

  // For API routes, you might want to validate tokens here
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
};
