import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Internal service requests use X-Internal-Key instead of Supabase auth
  const internalKey = request.headers.get("x-internal-key");
  console.log("[PROXY] Request path:", pathname);
  if (pathname.startsWith("/api/internal")) {
    console.log("[PROXY] Internal API request detected");
    console.log("[PROXY] Internal key from header:", internalKey ? "present" : "missing");
    console.log("[PROXY] Expected key:", process.env.AGENT_SERVICE_INTERNAL_KEY ? "present" : "missing");
    if (!internalKey || internalKey !== process.env.AGENT_SERVICE_INTERNAL_KEY) {
      console.log("[PROXY] Internal key validation failed");
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }
    console.log("[PROXY] Internal key validation passed, allowing request");
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // getUser() (not getSession()) validates the token against Supabase and
  // transparently refreshes it — required here since this is the only place
  // that can write the refreshed cookie back to the browser.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
