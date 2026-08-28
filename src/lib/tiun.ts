// tiun integration placeholder
// TODO: Replace with actual tiun SDK once tiun.dev docs are reviewed
// For MVP/hackathon, we stub the integration points

export const TIERS = {
  free: {
    maxBreakdownsPerDay: 3,
    name: "Free",
  },
  pro: {
    maxBreakdownsPerDay: Infinity,
    name: "Pro",
    priceMonthly: 9,
  },
} as const;

// Stub: check if user is on pro tier
export function isPro(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("shipzen-tier") === "pro";
  } catch {
    return false;
  }
}

// Stub: track analytics event
export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  console.log(`[tiun:analytics] ${event}`, properties);
  // TODO: tiun.track(event, properties)
}

// Stub: get current user
export function getCurrentUser(): { id: string; email: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("shipzen-user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
