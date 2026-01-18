import { Card, CardContent } from "@/components/ui/card";

/**
 * Skeleton loading state for nutrition summary.
 * Displays animated placeholder while data is being fetched.
 */
export function SkeletonNutritionSummary() {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        {/* Skeleton ring */}
        <div className="flex justify-center mb-6">
          <div className="w-48 h-48 rounded-full bg-muted animate-pulse" />
        </div>

        {/* Skeleton bars */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-2 w-full bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
