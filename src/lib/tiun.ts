// tiun SDK integration — auth, checkout, analytics
import { tiun } from "@tiun/sdk";

export const SNIPPET_ID = "q3yTLdMDNx5tf3OjQZl9pEDQ5XfaonuZ6K2z1Zt7";
export const PRODUCT_ID = "p-live-f69d5a2";

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

let _initialized = false;

/** Initialize tiun SDK — call once at app startup */
export function initTiun() {
  if (_initialized || typeof window === "undefined") return;
  _initialized = true;
  tiun.init({
    snippetId: SNIPPET_ID,
    language: "en",
    debug: process.env.NODE_ENV === "development",
  });
}

/** Check if user has Pro access (via tiun product access) */
export function isPro(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const { isAuthenticated, user } = tiun.getUser();
    if (isAuthenticated && user) {
      return user.productAccess.includes(PRODUCT_ID);
    }
    return false;
  } catch {
    // Fallback to localStorage if SDK not ready yet
    try {
      return localStorage.getItem("shipzen-tier") === "pro";
    } catch {
      return false;
    }
  }
}

/** Get current authenticated user */
export function getCurrentUser(): { id: string; email: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const { isAuthenticated, user } = tiun.getUser();
    if (isAuthenticated && user) {
      return { id: user.userId, email: user.email };
    }
    return null;
  } catch {
    return null;
  }
}

/** Open login modal (email OTP) */
export async function login() {
  try {
    await tiun.login();
  } catch (err) {
    console.error("[tiun] Login failed:", err);
  }
}

/** Log the user out */
export function logout() {
  try {
    tiun.logout();
  } catch (err) {
    console.error("[tiun] Logout failed:", err);
  }
}

/** Open checkout for ShipZen Pro */
export async function checkoutPro() {
  try {
    await tiun.checkout({ productId: PRODUCT_ID });
  } catch (err) {
    console.error("[tiun] Checkout failed:", err);
  }
}

/** Subscribe to user changes — returns unsubscribe fn */
export function onUserChange(callback: (data: { isAuthenticated: boolean; user: { userId: string; email: string; productAccess: string[] } | null }) => void) {
  try {
    return tiun.on("userChange", callback);
  } catch {
    return () => {};
  }
}

/** Track analytics event */
export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  console.log(`[shipzen:analytics] ${event}`, properties);
}

export { tiun };
