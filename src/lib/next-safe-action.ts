import { createSafeActionClient } from "next-safe-action";

// Client-side safe action client stub (no server-side logic)
export const actionClient = createSafeActionClient();
export const protectedActionClient = actionClient;
export const protectedWithClinicActionClient = actionClient;
