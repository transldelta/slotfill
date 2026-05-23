type LoadingSkeletonProps = {
  variant?: "card" | "table" | "list";
  count?: number;
};

const block = "animate-pulse rounded bg-gray-200 dark:bg-gray-700";

export function LoadingSkeleton({
  variant = "list",
  count = 4,
}: LoadingSkeletonProps) {
  if (variant === "card") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
          >
            <div className={`${block} mb-4 h-8 w-8 rounded-lg`} />
            <div className={`${block} mb-2 h-7 w-16`} />
            <div className={`${block} h-4 w-24`} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`${block} h-12 w-full`} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${block} h-10 w-full`} />
      ))}
    </div>
  );
}
