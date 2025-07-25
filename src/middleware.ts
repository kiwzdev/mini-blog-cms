import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const user = await getToken({
    req: req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log("user", user);

  // // Get the pathname of the request
  // const { pathname } = req.nextUrl;

  // // Default redirect paths (matching the hook's defaults)
  // const redirectIfAuthenticatedTo = "/todos";
  // const redirectIfUnauthenticatedTo = "/auth/sign-in";

  // // If user is authenticated and trying to access auth pages, redirect to authenticated page
  // if (user && (pathname === "/auth/sign-in" || pathname === "/auth/sign-up")) {
  //   const redirectUrl = new URL(redirectIfAuthenticatedTo, req.url);
  //   return NextResponse.redirect(redirectUrl);
  // }

  // // If user is unauthenticated and trying to access protected pages, redirect to auth
  // if (
  //   !user &&
  //   pathname !== redirectIfUnauthenticatedTo &&
  //   pathname !== "/auth/sign-up" &&
  //   pathname !== "/auth/sign-in"
  // ) {
  //   const redirectUrl = new URL(redirectIfUnauthenticatedTo, req.url);
  //   return NextResponse.redirect(redirectUrl);
  // }

  // // Role-based access control for admin routes
  // if (pathname.startsWith("/admin")) {
  //   if (user?.role !== "admin") {
  //     const redirectUrl = new URL(redirectIfAuthenticatedTo, req.url);
  //     return NextResponse.redirect(redirectUrl);
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)", // Exclude specific paths
  ],
};
