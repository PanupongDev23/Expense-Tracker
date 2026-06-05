export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";
export const DEMO_USER_EMAIL = "demo@example.com";

export function isDemoMode() {
  if (process.env.DEMO_MODE === "true") {
    return true;
  }

  return process.env.NODE_ENV !== "production" && !process.env.DATABASE_URL;
}

export function isDemoUser(userId: string) {
  return isDemoMode() && userId === DEMO_USER_ID;
}
