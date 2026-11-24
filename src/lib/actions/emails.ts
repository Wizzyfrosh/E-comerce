"use server";

/**
 * Server-action wrappers for transactional emails. Server-only: reads
 * RESEND_API_KEY server-side; falls back to console logging without a key.
 * Kept tiny so client auth/checkout components can call emails without
 * exposing secrets or importing the Resend SDK client-side.
 */
import type { OrderRecord } from "@/types/commerce";
import {
  sendOrderConfirmation,
  sendOrderShipped,
  sendPasswordReset,
  sendWelcomeEmail,
} from "@/lib/email";

export interface ActionOk {
  ok: boolean;
  error?: string;
}

export async function triggerWelcomeEmail(name: string, email: string): Promise<ActionOk> {
  try {
    const result = await sendWelcomeEmail(name, email);
    return { ok: result.sent || result.provider === "console" };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "error" };
  }
}

export async function triggerPasswordReset(
  email: string,
  resetUrl: string
): Promise<ActionOk> {
  try {
    const result = await sendPasswordReset(email, resetUrl);
    return { ok: result.sent || result.provider === "console" };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "error" };
  }
}

export async function triggerOrderConfirmation(order: OrderRecord): Promise<ActionOk> {
  try {
    const result = await sendOrderConfirmation(order);
    return { ok: result.sent || result.provider === "console" };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "error" };
  }
}

export async function triggerOrderShipped(
  order: OrderRecord,
  trackingNumber: string
): Promise<ActionOk> {
  try {
    const result = await sendOrderShipped(order, trackingNumber);
    return { ok: result.sent || result.provider === "console" };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "error" };
  }
}
