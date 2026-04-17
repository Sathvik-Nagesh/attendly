import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200/60", className)}
      {...props}
    />
  );
}

export function StatCardSkeleton() {
    return (
        <div className="p-6 border border-slate-200 shadow-sm rounded-xl bg-white space-y-4">
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="w-10 h-10 rounded-xl" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-4 w-12 rounded-full" />
                <Skeleton className="h-4 w-8" />
            </div>
        </div>
    );
}

export function ActivitySkeleton() {
    return (
        <div className="flex gap-3">
            <Skeleton className="w-4 h-4 rounded-full mt-1" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-1/4" />
            </div>
        </div>
    );
}

export function TableRowSkeleton() {
    return (
        <div className="flex items-center space-x-4 py-4 px-6 border-b border-slate-100 last:border-0">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
    );
}
