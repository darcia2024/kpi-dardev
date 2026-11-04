"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { portalGuide } from "@/lib/portal-guide";
import { isTutorialPin, tutorialCookie, tutorialCookieValue } from "@/lib/tutorial-access";

export async function unlockTutorial(formData: FormData): Promise<void> {
  const asked = formData.get("peran");
  const role = portalGuide.find(item => item.key === asked);
  const target = new URLSearchParams(role ? { peran: role.key } : {});
  if (!isTutorialPin(formData.get("pin"))) {
    target.set("pin", "salah");
    redirect(`/tutorial?${target}`);
  }
  (await cookies()).set(tutorialCookie, tutorialCookieValue, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/tutorial", maxAge: 60 * 60 * 24 * 30 });
  const query = target.toString();
  redirect(query ? `/tutorial?${query}` : "/tutorial");
}
