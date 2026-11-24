/**
 * Transactional email templates (Phase 3).
 * Plain inline-styled HTML so no React-email runtime is required; the same
 * content is offered as plain-text fallback. Expanded/adjusted in Phase 3.
 */
import type { OrderRecord } from "@/types/commerce";

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

const shell = (title: string, body: string, cta?: { label: string; href: string }) => `
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(15,23,42,.08);">
          <tr><td style="background:#1e4fd8;padding:24px 32px;color:#ffffff;font-size:20px;font-weight:bold;">
            Digitaz
          </td></tr>
          <tr><td style="padding:32px;color:#111827;">
            <h1 style="margin:0 0 16px;font-size:22px;">${title}</h1>
            ${body}
            ${
              cta
                ? `<p style="margin:24px 0;"><a href="${cta.href}" style="background:#1e4fd8;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;display:inline-block;">${cta.label}</a></p>`
                : ""
            }
            <p style="color:#6b7280;font-size:12px;margin-top:32px;">
              © Digitaz. You are receiving this email because you have an account or an order with Digitaz.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

export function orderConfirmationEmail(order: OrderRecord): EmailTemplate {
  const rows = order.lines
    .map(
      (line) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${line.name}${line.variantLabel ? ` <span style="color:#6b7280;">(${line.variantLabel})</span>` : ""} × ${line.qty}</td>
        <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${money(line.total)}</td>
      </tr>`
    )
    .join("");
  const body = `
    <p>Hi ${order.fullName || "there"}, your order is confirmed.</p>
    <p style="font-size:14px;color:#374151;">Order number: <strong>${order.orderNumber}</strong> · Status: <strong>${order.status}</strong></p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin-top:16px;">
      ${rows}
      <tr><td style="padding:8px 0;color:#6b7280;">Subtotal</td><td style="padding:8px 0;text-align:right;">${money(order.subtotal)}</td></tr>
      ${order.discount > 0 ? `<tr><td style="padding:8px 0;color:#e11d48;">Discount${order.couponCode ? ` (${order.couponCode})` : ""}</td><td style="padding:8px 0;text-align:right;color:#e11d48;">−${money(order.discount)}</td></tr>` : ""}
      <tr><td style="padding:8px 0;color:#6b7280;">Shipping</td><td style="padding:8px 0;text-align:right;">${order.shipping === 0 ? "Free" : money(order.shipping)}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Tax</td><td style="padding:8px 0;text-align:right;">${money(order.tax)}</td></tr>
      <tr><td style="padding:12px 0;font-weight:bold;border-top:2px solid #111827;">Total</td><td style="padding:12px 0;text-align:right;font-weight:bold;border-top:2px solid #111827;">${money(order.total)}</td></tr>
    </table>
    <p style="font-size:13px;color:#6b7280;">Shipping to: ${order.shippingAddress.full_name}, ${order.shippingAddress.line1}${order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ""}</p>`;
  const text = `Order ${order.orderNumber} confirmed. Total ${money(order.total)}. Thank you for shopping with Digitaz.`;
  return { subject: `Your order ${order.orderNumber} is confirmed`, html: shell("Order Confirmed", body), text };
}

export function orderShippedEmail(order: OrderRecord, trackingNumber: string): EmailTemplate {
  const body = `
    <p>Hi ${order.fullName || "there"}, good news — your order <strong>${order.orderNumber}</strong> has shipped.</p>
    <p>Tracking number: <strong>${trackingNumber}</strong>. Estimated delivery: 2–5 business days.</p>
    <p>Total charged: ${money(order.total)}. You can track progress from your account orders page.</p>`;
  const text = `Order ${order.orderNumber} shipped. Tracking: ${trackingNumber}.`;
  return {
    subject: `Your order ${order.orderNumber} has shipped`,
    html: shell("Order Shipped", body, { label: "Track Order", href: "/account/orders" }),
    text,
  };
}

export function passwordResetEmail(resetUrl: string): EmailTemplate {
  const body = `
    <p>We received a request to reset your password. Click the button below within 60 minutes to choose a new one.</p>
    <p style="font-size:12px;color:#6b7280;">If you did not request this, you can safely ignore this email — your password will remain unchanged.</p>`;
  return {
    subject: "Reset your Digitaz password",
    html: shell("Password Reset", body, { label: "Reset Password", href: resetUrl }),
    text: `Reset your Digitaz password (link expires in 60 minutes): ${resetUrl}`,
  };
}

export function welcomeEmail(name: string): EmailTemplate {
  const body = `
    <p>Welcome to Digitaz, ${name || "friend"}! Your account is ready.</p>
    <ul style="margin:12px 0 16px;padding-left:20px;font-size:14px;color:#374151;line-height:1.7;">
      <li>Track orders and manage saved addresses from your account</li>
      <li>Faster, secure checkout every time you shop</li>
      <li>Member-only deals, restock alerts and new-arrival drops</li>
    </ul>
    <p>Shop laptops, smartphones, TVs, gaming gear, audio and accessories — backed by local support and fast delivery.</p>`;
  return {
    subject: "Welcome to Digitaz",
    html: shell("Welcome to Digitaz 🎉", body, { label: "Start Shopping", href: "/" }),
    text: "Welcome to Digitaz! Track orders, check out faster and shop deals. Start shopping at /",
  };
}
