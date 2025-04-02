import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/group(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const baseHost = "localhost:3000";
  const reqHeaders = await headers(); // ✅ Await headers properly
  const host = reqHeaders.get("host") || "";
  const reqPath = req.nextUrl.pathname;
  const origin = req.nextUrl.origin;

  // Protect routes
  if (isProtectedRoute(req)) {
    await auth().protect(); // ✅ Ensure async execution
  }

  // Handle custom domain rewriting
  if (!baseHost.includes(host) && reqPath.includes("/group")) {
    try {
      const response = await fetch(`${origin}/api/domain?host=${host}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return NextResponse.error(); // Handle fetch errors properly
      }

      const data = await response.json();
      if (data?.status === 200) {
        return NextResponse.rewrite(
          new URL(reqPath, `https://${data.domain}/${reqPath}`)
        );
      }
    } catch (error) {
      console.error("Middleware error:", error);
      return NextResponse.error();
    }
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
