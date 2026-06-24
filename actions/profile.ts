"use server";

import { revalidatePath } from "next/cache";
import { createInsforgeServer } from "@/lib/insforge-server";

export async function saveProfile(): Promise<{ success: boolean; error?: string }> {
  try {
    const insforge = await createInsforgeServer();
    const { data } = await insforge.auth.getCurrentUser();

    if (!data.user) {
      return { success: false, error: "Unauthorized." };
    }

    // TODO: implement profile validation and InsForge DB write
    // After writing, check if this is the first time is_complete becomes true, then:
    // import { capturePostHogEvent } from "@/lib/posthog-server";
    // await capturePostHogEvent({
    //   distinctId: data.user.id,
    //   event: "profile_completed",
    //   properties: { userId: data.user.id },
    // });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("[actions/profile]", error);
    return { success: false, error: "Failed to save profile." };
  }
}
