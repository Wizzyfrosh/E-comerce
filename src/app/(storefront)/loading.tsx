/**
 * Route-group loading skeleton for the storefront. Shown during navigation
 * between storefront pages while server components resolve.
 */
export default function StorefrontLoading() {
  return (
    <div className="container-store space-y-8 pt-6" aria-hidden="true">
      <div className="h-64 animate-pulse rounded-xl bg-gray-100 md:h-80" />
      <div className="flex gap-5 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 w-20 shrink-0 animate-pulse rounded-full bg-gray-100" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-56 animate-pulse rounded-lg border border-border bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
