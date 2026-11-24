/**
 * Transactional email gateway (Phase 3).
 *
 * Supabase/Stripe-first style: if RESEND_API_KEY is set, mail goes through
 * Resend; otherwise every send logs a JSON payload (console + in-memory
 * outbox) so the buying flow remains fully demoable offline.
 *
 * Templates live in ./templates.ts; this module owns transport and the public
 * send-* API used by order/checkout/auth flows.
 */
import type { OrderRecord } from "@/types/commerce";
import {
  orderConfirmationEmail,
  orderShippedEmail,
  passwordResetEmail,
  welcomeEmail,
} from "./templates";

export interface EmailResult {
  sent: boolean;
  provider: "resend" | "console";
  error?: string;
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? "Digitaz Store <no-reply@digitaz.example.com>";

/** In-memory outbox for the console fallback (debugging / tests). */
export const emailOutbox: EmailPayload[] = [];

async function sendViaResend(payload: EmailPayload): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, provider: "console" };
  try {
    const { Resend } = await import("resend");
    const client = new Resend(apiKey);
    await client.emails.send({
      from: FROM_ADDRESS,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
    return { sent: true, provider: "resend" };
  } catch (error) {
    return {
      sent: false,
      provider: "console",
      error: error instanceof Error ? error.message : "resend error",
    };
  }
}

/** Low-level send: real provider when configured, otherwise console fallback. */
export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  if (!payload.to || !payload.subject || !payload.html) {
    return { sent: false, provider: "console", error: "missing payload fields" };
  }
  emailOutbox.push(payload);
  const result = await sendViaResend(payload);
  if (!result.sent) {
    console.info("[email:console]", {
      to: payload.to,
      subject: payload.subject,
      fallback: true,
    });
  }
  return result;
}

/** Order placed + payment received confirmation. */
export async function sendOrderConfirmation(order: OrderRecord): Promise<EmailResult> {
  if (!order.email) return { sent: false, provider: "console", error: "no email" };
  const { subject, html, text } = orderConfirmationEmail(order);
  return sendEmail({ to: order.email, subject, html, text });
}

/** Order marked shipped (tracking number included). */
export async function sendOrderShipped(
  order: OrderRecord,
  trackingNumber: string
): Promise<EmailResult> {
  if (!order.email) return { sent: false, provider: "console", error: "no email" };
  const { subject, html, text } = orderShippedEmail(order, trackingNumber);
  return sendEmail({ to: order.email, subject, html, text });
}

/** Password reset request. */
export async function sendPasswordReset(
  email: string,
  resetUrl: string
): Promise<EmailResult> {
  const { subject, html, text } = passwordResetEmail(resetUrl);
  return sendEmail({ to: email, subject, html, text });
}

/** Welcome email right after signup. */
export async function sendWelcomeEmail(name: string, email: string): Promise<EmailResult> {
  const { subject, html, text } = welcomeEmail(name);
  return sendEmail({ to: email, subject, html, text });
}
