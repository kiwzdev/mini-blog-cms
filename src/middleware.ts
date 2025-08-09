import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const user = await getToken({
    req: req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log("user", user?.email);

  // Get the pathname of the request
  const { pathname } = req.nextUrl;

  // Configuration
  const config = {
    // Paths that require authentication
    protectedPaths: [
      "/profile",
    ],
    
    // Paths that require admin role
    adminPaths: [
      "/admin"
    ],
    
    // Auth-related paths (should redirect if already authenticated)
    authPaths: [
      "/auth/sign-in",
      "/auth/sign-up"
    ],
    
    // Default redirect destinations
    redirectIfAuthenticatedTo: "/",
    redirectIfUnauthenticatedTo: "/auth/sign-in"
  };

  // Helper function to check if path matches any pattern
  const isPathMatch = (paths: string[], currentPath: string): boolean => {
    return paths.some(path => {
      // Exact match
      if (path === currentPath) return true;
      // Prefix match for nested paths (e.g., /admin matches /admin/users)
      if (currentPath.startsWith(path + "/")) return true;
      return false;
    });
  };

  // If user is authenticated and trying to access auth pages, redirect to authenticated page
  if (user && isPathMatch(config.authPaths, pathname)) {
    const redirectUrl = new URL(config.redirectIfAuthenticatedTo, req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Check if current path requires authentication
  const requiresAuth = isPathMatch(config.protectedPaths, pathname);
  
  // If user is unauthenticated and trying to access protected pages, redirect to auth
  if (!user && requiresAuth) {
    const redirectUrl = new URL(config.redirectIfUnauthenticatedTo, req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Role-based access control for admin routes
  if (isPathMatch(config.adminPaths, pathname)) {
    if (user?.role !== "admin") {
      const redirectUrl = new URL(config.redirectIfAuthenticatedTo, req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)", // Exclude specific paths
  ],
};