"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { addressSchema } from "@/lib/validations";
import {
  setAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/lib/actions/account";
import type { AccountAddress } from "@/lib/data/addresses";
import {
  readLocalAddresses,
  writeLocalAddresses,
  type LocalAddress,
} from "@/lib/data/local-store";
import {
  AlertCircle,
  CheckCircle2,
  MapPin,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";

type AddressRow = AccountAddress;

const BLANK_FORM = {
  full_name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  is_default: false,
};

type FormValues = typeof BLANK_FORM;

function fromLocal(a: LocalAddress): AddressRow {
  return {
    id: a.id,
    full_name: a.full_name,
    phone: a.phone ?? null,
    line1: a.line1,
    line2: a.line2 ?? null,
    city: a.city,
    state: a.state ?? null,
    postal_code: a.postal_code,
    country: a.country,
    is_default: a.is_default,
  };
}

function toLocal(r: AddressRow): LocalAddress {
  return {
    id: r.id,
    full_name: r.full_name,
    phone: r.phone ?? null,
    line1: r.line1,
    line2: r.line2 ?? null,
    city: r.city,
    state: r.state ?? null,
    postal_code: r.postal_code,
    country: r.country,
    is_default: r.is_default,
  };
}

export function AddressesManager({ initialAddresses }: { initialAddresses: AddressRow[] }) {
  const router = useRouter();
  const [items, setItems] = useState<AddressRow[]>(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>(BLANK_FORM);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Merge localStorage fallback addresses once on mount.
  useEffect(() => {
    queueMicrotask(() => {
      const local = readLocalAddresses().map(fromLocal);
      setItems((prev) => {
        const known = new Set(prev.map((a) => a.id));
        return [...prev, ...local.filter((a) => !known.has(a.id))];
      });
    });
  }, []);

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function openCreate() {
    setEditingId(null);
    setValues(BLANK_FORM);
    setError(null);
    setShowForm(true);
  }

  function openEdit(row: AddressRow) {
    setEditingId(row.id);
    setValues({
      full_name: row.full_name,
      phone: row.phone ?? "",
      line1: row.line1,
      line2: row.line2 ?? "",
      city: row.city,
      state: row.state ?? "",
      postal_code: row.postal_code,
      country: row.country,
      is_default: row.is_default,
    });
    setError(null);
    setShowForm(true);
  }

  function persistLocal(next: AddressRow[]) {
    setItems(next);
    writeLocalAddresses(next.filter((a) => a.id.startsWith("local-")).map(toLocal));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const payload = {
      full_name: values.full_name.trim(),
      phone: values.phone.trim() || undefined,
      line1: values.line1.trim(),
      line2: values.line2.trim() || undefined,
      city: values.city.trim(),
      state: values.state.trim() || undefined,
      postal_code: values.postal_code.trim(),
      country: values.country.trim(),
      is_default: values.is_default,
    };

    const parsed = addressSchema.safeParse(payload);
    if (!parsed.success) {
      setLoading(false);
      setError(parsed.error.issues[0]?.message ?? "Invalid address");
      return;
    }

    const result = await setAddress(parsed.data, editingId ?? undefined);
    setLoading(false);

    if (result.ok) {
      if (result.address) {
        const row = result.address;
        setItems((prev) => {
          const others = prev.filter((a) => a.id !== row.id);
          return row.is_default
            ? [{ ...row, is_default: true }, ...others.map((a) => ({ ...a, is_default: false }))]
            : [row, ...others];
        });
      }
      setShowForm(false);
      setEditingId(null);
      setValues(BLANK_FORM);
      router.refresh();
      return;
    }

    // Offline fallback: keep the row in localStorage so the demo still works.
    const row: AddressRow = {
      id: editingId ?? `local-${Date.now()}`,
      full_name: parsed.data.full_name,
      phone: parsed.data.phone ?? null,
      line1: parsed.data.line1,
      line2: parsed.data.line2 ?? null,
      city: parsed.data.city,
      state: parsed.data.state ?? null,
      postal_code: parsed.data.postal_code,
      country: parsed.data.country,
      is_default: parsed.data.is_default ?? false,
    };
    const others = items.filter((a) => a.id !== row.id);
    const next = row.is_default
      ? [{ ...row, is_default: true }, ...others.map((a) => ({ ...a, is_default: false }))]
      : [row, ...others];
    persistLocal(next);
    setShowForm(false);
    setEditingId(null);
    setValues(BLANK_FORM);
    setNotice("Saved on this device (offline mode).");
  }

  async function handleDelete(id: string) {
    const result = await deleteAddress(id);
    if (result.ok) {
      setItems((prev) => prev.filter((a) => a.id !== id));
      router.refresh();
      return;
    }
    persistLocal(items.filter((a) => a.id !== id));
    setNotice("Removed on this device (offline mode).");
  }

  async function handleSetDefault(id: string) {
    const result = await setDefaultAddress(id);
    if (result.ok) {
      setItems((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));
      router.refresh();
      return;
    }
    persistLocal(
      items.map((a) => ({ ...a, is_default: a.id === id }))
    );
    setNotice("Default saved on this device (offline mode).");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {items.length} saved address{items.length === 1 ? "" : "es"}
        </p>
        <Button onClick={openCreate} variant={showForm ? "outline" : "default"}>
          <Plus className="h-4 w-4" />
          Add address
        </Button>
      </div>

      {notice && (
        <div className="flex items-start gap-2 rounded-lg border border-brand-success/30 bg-brand-success/10 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <h3 className="mb-4 font-semibold text-foreground">
            {editingId ? "Edit address" : "New address"}
          </h3>
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="full_name" className="text-sm font-medium text-foreground">
                Full name
              </label>
              <Input
                id="full_name"
                value={values.full_name}
                onChange={(e) => setField("full_name", e.target.value)}
                placeholder="Jane Doe"
                autoComplete="name"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-foreground">
                Phone
              </label>
              <Input
                id="phone"
                value={values.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="+1 555 000 1234"
                autoComplete="tel"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="line1" className="text-sm font-medium text-foreground">
                Address line 1
              </label>
              <Input
                id="line1"
                value={values.line1}
                onChange={(e) => setField("line1", e.target.value)}
                placeholder="Street and house number"
                autoComplete="address-line1"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="line2" className="text-sm font-medium text-foreground">
                Address line 2 <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                id="line2"
                value={values.line2}
                onChange={(e) => setField("line2", e.target.value)}
                placeholder="Apartment, suite, unit"
                autoComplete="address-line2"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="city" className="text-sm font-medium text-foreground">
                City
              </label>
              <Input
                id="city"
                value={values.city}
                onChange={(e) => setField("city", e.target.value)}
                placeholder="Lagos"
                autoComplete="address-level2"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="state" className="text-sm font-medium text-foreground">
                State / Region <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                id="state"
                value={values.state}
                onChange={(e) => setField("state", e.target.value)}
                placeholder="Lagos State"
                autoComplete="address-level1"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="postal_code" className="text-sm font-medium text-foreground">
                Postal code
              </label>
              <Input
                id="postal_code"
                value={values.postal_code}
                onChange={(e) => setField("postal_code", e.target.value)}
                placeholder="100001"
                autoComplete="postal-code"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="country" className="text-sm font-medium text-foreground">
                Country
              </label>
              <Input
                id="country"
                value={values.country}
                onChange={(e) => setField("country", e.target.value)}
                placeholder="Nigeria"
                autoComplete="country-name"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
              <input
                type="checkbox"
                checked={values.is_default}
                onChange={(e) => setField("is_default", e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              Set as default shipping address
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : editingId ? "Update address" : "Save address"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {items.length === 0 && !showForm ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-brand-panel px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-muted-foreground shadow-sm">
            <MapPin size={28} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            No saved addresses
          </h3>
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
            Add a shipping address to speed up checkout on your next order.
          </p>
          <Button onClick={openCreate} className="mt-6">
            <Plus className="h-4 w-4" />
            Add your first address
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((row) => (
            <article
              key={row.id}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{row.full_name}</p>
                  {row.is_default && (
                    <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                      Default
                    </Badge>
                  )}
                </div>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <address className="mt-2 space-y-0.5 text-sm not-italic text-muted-foreground">
                <p>{row.line1}</p>
                {row.line2 && <p>{row.line2}</p>}
                <p>
                  {[row.city, row.state].filter(Boolean).join(", ")} · {row.postal_code}
                </p>
                <p>{row.country}</p>
                {row.phone && <p className="text-foreground">{row.phone}</p>}
              </address>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                {!row.is_default && (
                  <Button size="sm" variant="ghost" onClick={() => handleSetDefault(row.id)}>
                    <Star className="h-3.5 w-3.5" />
                    Set default
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(row.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
