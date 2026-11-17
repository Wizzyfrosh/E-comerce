import { BadgeCheck, PenLine } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RatingStars } from "./rating-stars";
import type { ProductWithRelations } from "@/types";
import type { Review } from "@/types/database";

interface ProductTabsProps {
  product: ProductWithRelations;
  reviews: Review[];
}

const REVIEWER_NAMES: Record<string, string> = {
  "user-jane": "Jane D.",
  "user-mike": "Mike R.",
  "user-sara": "Sara M.",
};

function reviewerName(userId: string): string {
  return REVIEWER_NAMES[userId] ?? "Verified Buyer";
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * PDP lower section tabs: Description / Specs / Reviews.
 * Specs render as a key/value table; reviews show an average summary plus a
 * chronological list. "Write a review" is placeholder (Phase 3).
 */
export function ProductTabs({ product, reviews }: ProductTabsProps) {
  const specs = product.specs ?? [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : product.rating_avg;

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="h-auto w-full justify-start gap-1 rounded-none border-b border-border bg-transparent p-0">
        <TabsTrigger
          value="description"
          className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-semibold text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
        >
          Description
        </TabsTrigger>
        {specs.length > 0 && (
          <TabsTrigger
            value="specs"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-semibold text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            Specifications
          </TabsTrigger>
        )}
        <TabsTrigger
          value="reviews"
          className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-semibold text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
        >
          Reviews ({reviews.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <div className="prose-sm max-w-none space-y-3 text-sm leading-relaxed text-muted-foreground">
          {product.description ? (
            product.description.split("\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))
          ) : (
            <p>No description available for this product.</p>
          )}
        </div>
      </TabsContent>

      {specs.length > 0 && (
        <TabsContent value="specs" className="mt-6">
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <tbody>
                {specs.map((spec, index) => (
                  <tr
                    key={spec.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <th className="w-1/3 px-4 py-3 text-left font-medium text-muted-foreground">
                      {spec.key}
                    </th>
                    <td className="px-4 py-3 text-foreground">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      )}

      <TabsContent value="reviews" className="mt-6 space-y-6">
        <div className="flex flex-wrap items-center gap-6 rounded-lg border border-border bg-gray-50 p-5">
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground">
              {avgRating.toFixed(1)}
            </p>
            <RatingStars rating={avgRating} className="mt-1 justify-center" />
            <p className="mt-1 text-xs text-muted-foreground">
              Based on {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const pct =
                reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-muted-foreground">{star}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-brand-hot"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-muted-foreground">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            disabled
            title="Writing reviews is coming in Phase 3"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-muted-foreground opacity-70"
          >
            <PenLine size={14} />
            Write a review (soon)
          </button>
        </div>

        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No reviews yet. Be the first to review this product.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {reviews.map((review) => (
              <li key={review.id} className="py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <RatingStars rating={review.rating} size={13} />
                  {review.title && (
                    <span className="text-sm font-semibold text-foreground">
                      {review.title}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {reviewerName(review.user_id)}
                  </span>
                  <span>·</span>
                  <span>{formatDate(review.created_at)}</span>
                  {review.is_verified && (
                    <span className="inline-flex items-center gap-1 text-brand-success">
                      <BadgeCheck size={12} /> Verified Purchase
                    </span>
                  )}
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {review.comment}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </TabsContent>
    </Tabs>
  );
}
