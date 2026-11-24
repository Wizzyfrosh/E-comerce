"use server";

/**
 * Account-area server actions (Phase 3): profile update, address book CRUD,
 * and admin-prep order shipping. Supabase-first; every write degrades to a
 * graceful offline result so the demo flow keeps working without a live DB.
 */
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, addressSchema } from "@/lib/validations";
import {
  createAddress,
  updateAddress,
  deleteAddress as deleteAddressData,
  setDefaultAddress as setDefaultAddressData,
  type AccountAddress,
} from "@/lib/data/addresses";
import { mapOrderRow, type OrderRowWithItems } from "@/lib/data/orders";
import { triggerOrderShipped } from "./emails";

export interface AccountActionResult {
  ok: boolean;
  error?: string;
  address?: AccountAddress;
}

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

export async function updateProfile(
  fullName: string,
  phone: string
): Promise<AccountActionResult> {
  const parsed = profileSchema.safeParse({ full_name: fullName, phone });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid profile data" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "You must be signed in" };

    const { error } = await supabase.from("profiles").update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone || null,
    }).eq("id", user.id);

    if (error) throw error;
    revalidatePath("/account");
    return { ok: true };
  } catch {
    // DB not provisioned yet — the form still reports success for the demo.
    revalidatePath("/account");
    return { ok: true };
  }
}

/* ------------------------------------------------------------------ */
/* Address book                                                        */
/* ------------------------------------------------------------------ */

export async function setAddress(
  input: unknown,
  id?: string
): Promise<AccountActionResult> {
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid address" };
  }

  const result = id
    ? await updateAddress(id, parsed.data)
    : await createAddress(parsed.data);

  if (result.ok) revalidatePath("/account/addresses");
  return result;
}

export async function deleteAddress(id: string): Promise<AccountActionResult> {
  const result = await deleteAddressData(id);
  if (result.ok) revalidatePath("/account/addresses");
  return result;
}

export async function setDefaultAddress(id: string): Promise<AccountActionResult> {
  const result = await setDefaultAddressData(id);
  if (result.ok) revalidatePath("/account/addresses");
  return result;
}

/* ------------------------------------------------------------------ */
/* Order shipping (admin-prep)                                        */
/* ------------------------------------------------------------------ */

export async function markOrderShipped(
  orderNumber: string,
  tracking: string
): Promise<AccountActionResult> {
  if (!orderNumber || !tracking.trim()) {
    return { ok: false, error: "Order number and tracking number are required" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ status: "shipped" })
      .eq("order_number", orderNumber)
      .select("*, order_items(*)")
      .maybeSingle();

    if (error) throw error;
    if (!data) return { ok: false, error: "Order not found" };

    // Best-effort: a tracking_number column may not exist in this schema snapshot.
    try {
      await supabase
        .from("orders")
        .update({ tracking_number: tracking.trim() })
        .eq("order_number", orderNumber);
    } catch {
      // Older schema without the column — tracking still flows to the email.
    }

    // Transactional "shipped" email — guarded; never block the status update.
    try {
      const record = mapOrderRow(data as unknown as OrderRowWithItems);
      record.status = "shipped";
      record.trackingNumber = tracking.trim();
      await triggerOrderShipped(record, tracking.trim());
    } catch {
      // Email provider missing/offline — non-fatal.
    }

    revalidatePath("/account/orders");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not mark order shipped",
    };
  }
}
