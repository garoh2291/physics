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

    // Check onboarding for students
    if (token?.role === "STUDENT" && !token?.isOnboarded) {
      console.log("Middleware: Student not onboarded", {
        pathname,
        role: token?.role,
        isOnboarded: token?.isOnboarded,
        onboardedParam: req.nextUrl.searchParams.get("onboarded"),
      });

      // Allow access to onboarding page
      if (pathname === "/onboarding") {
        return;
      }
      // Allow access to dashboard if onboarded=true parameter is present
      if (
        pathname === "/dashboard" &&
        req.nextUrl.searchParams.get("onboarded") === "true"
      ) {
        console.log(
          "Middleware: Allowing dashboard access with onboarded param"
        );
        return;
      }
      // Redirect to onboarding for all other pages
      if (pathname !== "/onboarding") {
        console.log("Middleware: Redirecting to onboarding");
        return Response.redirect(new URL("/onboarding", req.url));
      }
    }

    // Protect student dashboard and exercise pages
    if (pathname.startsWith("/dashboard") && !token?.role) {
      return Response.redirect(new URL("/login", req.url));
    }

    if (pathname.startsWith("/exercises") && !token?.role) {
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
