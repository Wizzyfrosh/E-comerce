/**
 * Server-side Supabase client.
 * Reads the session from request cookies. In Route Handlers / Server Actions
 * `setAll` can persist refreshed cookies; in Server Components it is a no-op
 * (middleware is responsible for persisting refreshes there).
 *
 * Next 15+: `cookies()` is async — always `await createClient()`.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Throws when called from a Server Component (read-only cookies).
            // Middleware persists refreshed cookies in that case.
          }
        },
      },
    }
  );
}
