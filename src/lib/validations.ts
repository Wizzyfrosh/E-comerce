/**
 * Zod validation schemas + inferred types for auth, address, and coupon forms.
 * Used by client components to validate input before calling Supabase.
 */
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export const resetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const addressSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  phone: z.string().optional(),
  line1: z.string().min(3, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  postal_code: z.string().min(3, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  is_default: z.boolean().optional().default(false),
});

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Coupon code is required")
    .toUpperCase()
    .regex(/^[A-Z0-9_-]+$/, "Invalid coupon code format"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ResetInput = z.infer<typeof resetSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CouponInput = z.infer<typeof couponSchema>;

/** Checkout step 1: contact details. */
export const contactSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^[+0-9 ()-]{7,20}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
});

/** Checkout step 3: shipping method selection. */
export const shippingMethodSchema = z.object({
  method: z.enum(["free", "standard", "express"], {
    message: "Choose a shipping method",
  }),
});

/** Checkout step 2: shipping address (reuses address schema with required name). */
export const checkoutAddressSchema = addressSchema.extend({
  full_name: z.string().min(2, "Full name is required"),
  line1: z.string().min(3, "Address line 1 is required"),
  city: z.string().min(2, "City is required"),
  postal_code: z.string().min(3, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
});

/** Account profile update. */
export const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^[+0-9 ()-]{7,20}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ShippingMethodInput = z.infer<typeof shippingMethodSchema>;
export type CheckoutAddressInput = z.infer<typeof checkoutAddressSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
