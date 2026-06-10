// Server Component wrapper.
//
// Calling headers() is the canonical Next.js 14 way to opt a route out of
// static pre-rendering and the Router Cache.  Without it, "use client" child
// routes remain SSG (●) and the Router Cache can serve a stale pre-rendered
// payload for up to 5 min after a deploy, so users still see the old version.
//
// With headers() the route becomes dynamic (ƒ) – rendered per request, never
// served from the in-memory Router Cache.
import { headers } from "next/headers";
export const dynamic = "force-dynamic";

import LocaleContactPageClient from "./LocaleContactPageClient";

export default function LocaleContactPage() {
  void headers(); // marks route as dynamic – bypasses Router Cache
  return <LocaleContactPageClient />;
}
