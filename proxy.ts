import {
  DEFAULT_ACCESS_TOKEN_COOKIE,
  type CookieOptions,
  type CookieStore,
  updateSession,
} from "@insforge/sdk/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/profile", "/find-jobs"];

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function createRequestCookieStore(request: NextRequest): CookieStore {
  return {
    get: (name: string) => request.cookies.get(name),
    set: () => undefined,
    delete: () => undefined,
  };
}

function createResponseCookieStore(response: NextResponse): CookieStore {
  return {
    get: (name: string) => response.cookies.get(name),
    set: (
      nameOrOptions: string | ({ name: string; value: string } & CookieOptions),
      value?: string,
      options?: CookieOptions,
    ) => {
      if (typeof nameOrOptions === "string") {
        response.cookies.set(nameOrOptions, value ?? "", options);
        return;
      }

      response.cookies.set(nameOrOptions);
    },
    delete: (nameOrOptions: string | ({ name: string } & CookieOptions)) => {
      if (typeof nameOrOptions === "string") {
        response.cookies.delete(nameOrOptions);
        return;
      }

      response.cookies.delete(nameOrOptions.name);
    },
  };
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  const session = await updateSession({
    requestCookies: createRequestCookieStore(request),
    responseCookies: createResponseCookieStore(response),
  });

  const hasAccessToken =
    Boolean(session.accessToken) ||
    Boolean(request.cookies.get(DEFAULT_ACCESS_TOKEN_COOKIE)?.value);

  if (isProtectedRoute(pathname) && !hasAccessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && hasAccessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/find-jobs/:path*", "/login"],
};
