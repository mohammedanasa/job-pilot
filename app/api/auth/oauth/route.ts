import { setAuthCookies } from "@insforge/sdk/ssr";
import { NextResponse } from "next/server";
import { createInsforgeAuthServer } from "@/lib/insforge-server";
import { capturePostHogEvent } from "@/lib/posthog-server";

type OAuthExchangeRequest = {
  code: string;
  codeVerifier: string;
};

function isOAuthExchangeRequest(value: unknown): value is OAuthExchangeRequest {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "codeVerifier" in value &&
    typeof value.code === "string" &&
    typeof value.codeVerifier === "string"
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const payload: unknown = await request.json();

    if (!isOAuthExchangeRequest(payload)) {
      return NextResponse.json(
        { success: false, error: "OAuth callback data is missing." },
        { status: 400 },
      );
    }

    const insforge = createInsforgeAuthServer();
    const { data, error } = await insforge.auth.exchangeOAuthCode(
      payload.code,
      payload.codeVerifier,
    );

    if (error || !data?.accessToken || !data.user) {
      console.error("[auth/oauth]", error ?? "OAuth exchange returned no session");
      return NextResponse.json(
        { success: false, error: "Could not complete OAuth sign in." },
        { status: error?.statusCode ?? 400 },
      );
    }

    await capturePostHogEvent({
      distinctId: data.user.id,
      event: "server_auth_completed",
      properties: {
        userId: data.user.id,
        email: data.user.email ?? null,
      },
    });

    const response = NextResponse.json({
      success: true,
      data: { user: data.user },
    });
    setAuthCookies(response.cookies, {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    return response;
  } catch (error) {
    console.error("[auth/oauth]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
