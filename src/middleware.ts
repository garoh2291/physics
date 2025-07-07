import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Protect admin routes
    if (
      pathname.startsWith("/admin") &&
      token?.role !== "ADMIN" &&
      token?.role !== "SUPERADMIN"
    ) {
      return Response.redirect(new URL("/dashboard", req.url));
    }

    // Protect superadmin routes
    if (pathname.startsWith("/superadmin") && token?.role !== "SUPERADMIN") {
      return Response.redirect(new URL("/dashboard", req.url));
    }

    // Protect student dashboard
    if (pathname.startsWith("/dashboard") && !token?.role) {
      return Response.redirect(new URL("/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/superadmin/:path*"],
};
