/**
 * Address book data access (Phase 3). Supabase-first against the `addresses`
 * table (RLS: user_id = auth.uid()); every function degrades gracefully when
 * the DB / session is unavailable so the account pages keep rendering.
 *
 * Server-side only — client components merge these results with
 * `readLocalAddresses()` from ./local-store.
 */
import { createClient } from "@/lib/supabase/server";
import type { Address } from "@/types/database";
import type { OrderAddress } from "@/types/commerce";
import type { AddressInput } from "@/lib/validations";

export interface AccountAddress extends OrderAddress {
  id: string;
  is_default: boolean;
}

export interface AddressActionResult {
  ok: boolean;
  error?: string;
  address?: AccountAddress;
}

function mapRow(row: Address): AccountAddress {
  return {
    id: row.id,
    full_name: row.full_name,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    postal_code: row.postal_code,
    country: row.country,
    is_default: row.is_default,
  };
}

/** Clear every other default address for the current user (best effort). */
async function clearOtherDefaults(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  keepId?: string
): Promise<void> {
  let query = supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", userId);
  if (keepId) query = query.neq("id", keepId);
  await query; // RLS / failures are non-fatal for the demo flow.
}

/** All addresses for the signed-in user, default first. Empty when offline. */
export async function listAddresses(): Promise<AccountAddress[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapRow(row as Address));
  } catch {
    return [];
  }
}

export async function createAddress(
  input: AddressInput
): Promise<AddressActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "You must be signed in" };

    if (input.is_default) await clearOtherDefaults(supabase, user.id);

    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        full_name: input.full_name,
        phone: input.phone ?? null,
        line1: input.line1,
        line2: input.line2 ?? null,
        city: input.city,
        state: input.state ?? null,
        postal_code: input.postal_code,
        country: input.country,
        is_default: input.is_default ?? false,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return { ok: false, error: "Address was not saved" };
    return { ok: true, address: mapRow(data as Address) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not save address",
    };
  }
}

export async function updateAddress(
  id: string,
  input: AddressInput
): Promise<AddressActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "You must be signed in" };

    if (input.is_default) await clearOtherDefaults(supabase, user.id, id);

    const { data, error } = await supabase
      .from("addresses")
      .update({
        full_name: input.full_name,
        phone: input.phone ?? null,
        line1: input.line1,
        line2: input.line2 ?? null,
        city: input.city,
        state: input.state ?? null,
        postal_code: input.postal_code,
        country: input.country,
        is_default: input.is_default ?? false,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return { ok: false, error: "Address not found" };
    return { ok: true, address: mapRow(data as Address) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not update address",
    };
  }
}

export async function deleteAddress(id: string): Promise<AddressActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "You must be signed in" };

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not delete address",
    };
  }
}

export async function setDefaultAddress(id: string): Promise<AddressActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "You must be signed in" };

    await clearOtherDefaults(supabase, user.id, id);
    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not set default address",
    };
  }
}
