import SourceBadge from './SourceBadge';
import { formatDistanceToNow } from 'date-fns';

interface ProblemCardProps {
    id: string;
    title: string;
    description: string;
    source: string;
    sourceUrl: string;
    createdAtSource: string;
    upvotes: number;
    commentsCount: number;
    tags: string[];
}

export default function ProblemCard({
    id,
    title,
    description,
    source,
    sourceUrl,
    createdAtSource,
    upvotes,
    commentsCount,
    tags,
}: ProblemCardProps) {
    const timeAgo = formatDistanceToNow(new Date(createdAtSource), {
        addSuffix: true,
    });

    // Truncate description for card view
    const truncatedDescription =
        description.length > 200
            ? description.substring(0, 200) + '...'
            : description;

    return (
        <a
            href={`/problems/${id}`}
            className="block group"
        >
            <div className="bg-card border border-border rounded-xl p-5 hover:shadow-lg hover:border-primary/50 transition-all duration-200 h-full flex flex-col">
                {/* Title */}
                <h3 className="font-bold text-lg leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-3">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-4">
                    {truncatedDescription}
                </p>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 text-xs rounded-md bg-secondary text-secondary-foreground"
                            >
                                #{tag}
                            </span>
                        ))}
                        {tags.length > 3 && (
                            <span className="px-2 py-0.5 text-xs rounded-md bg-secondary/60 text-secondary-foreground">
                                +{tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Metadata footer */}
                <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                    <div className="flex items-center gap-3">
                        <SourceBadge source={source} size="sm" />
                        <span className="flex items-center gap-1">
                            <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 15l7-7 7 7"
                                />
                            </svg>
                            {upvotes}
                        </span>
                        <span className="flex items-center gap-1">
                            <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                />
                            </svg>
                            {commentsCount}
                        </span>
                    </div>
                    <span className="text-xs">{timeAgo}</span>
                </div>
            </div>
        </a>
    );
}
