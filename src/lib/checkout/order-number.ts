/**
 * Order-number generation shared by server actions.
 * Kept outside `"use server"` modules because it is synchronous (server-action
 * files may only export async functions).
 *
 * Format: `DZ-YYYYMMDD-XXXX` where XXXX is a 4-character uppercase alnum
 * suffix (no ambiguous characters).
 */
const ORDER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateOrderNumber(): string {
  const now = new Date();
  const yyyymmdd = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(
    now.getUTCDate()
  ).padStart(2, "0")}`;
  let suffix = "";
  for (let i = 0; i < 4; i += 1) {
    suffix += ORDER_ALPHABET[Math.floor(Math.random() * ORDER_ALPHABET.length)];
  }
  return `DZ-${yyyymmdd}-${suffix}`;
}
