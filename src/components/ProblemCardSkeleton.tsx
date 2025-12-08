export default function ProblemCardSkeleton() {
    return (
        <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-start gap-3 mb-4">
                <div className="w-6 h-6 rounded bg-secondary/50" />
                <div className="flex-1">
                    <div className="h-4 bg-secondary/50 rounded w-20 mb-2" />
                    <div className="h-3 bg-secondary/50 rounded w-24" />
                </div>
            </div>

            {/* Title skeleton */}
            <div className="mb-3">
                <div className="h-6 bg-secondary/50 rounded w-full mb-2" />
                <div className="h-6 bg-secondary/50 rounded w-3/4" />
            </div>

            {/* Description skeleton */}
            <div className="space-y-2 mb-4">
                <div className="h-4 bg-secondary/50 rounded w-full" />
                <div className="h-4 bg-secondary/50 rounded w-full" />
                <div className="h-4 bg-secondary/50 rounded w-2/3" />
            </div>

            {/* Tags skeleton */}
            <div className="flex gap-2 mb-4">
                <div className="h-6 bg-secondary/50 rounded-full w-16" />
                <div className="h-6 bg-secondary/50 rounded-full w-20" />
                <div className="h-6 bg-secondary/50 rounded-full w-14" />
            </div>

            {/* Footer skeleton */}
            <div className="flex items-center gap-4 pt-3 border-t border-border">
                <div className="h-4 bg-secondary/50 rounded w-12" />
                <div className="h-4 bg-secondary/50 rounded w-16" />
            </div>
        </div>
    );
}
