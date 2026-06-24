import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";
import type { InsForgeClient } from "@insforge/sdk";

export async function createInsforgeServer(): Promise<InsForgeClient> {
  return createServerClient({ cookies: await cookies() });
}

export function createInsforgeAuthServer(): InsForgeClient {
  return createServerClient();
}
