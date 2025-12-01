import Link from "next/link";
import SourceBadge from "./SourceBadge";
import { formatDistanceToNow } from "date-fns";

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

    return (
        <article className="group p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
            <div className="flex items-start justify-between gap-4 mb-3">
                <Link href={`/problems/${id}`} className="flex-1">
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2">
                        {title}
                    </h3>
                </Link>
                <SourceBadge source={source} />
            </div>

            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                {description}
            </p>

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <svg
                            className="w-4 h-4"
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
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                        {commentsCount}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span>{timeAgo}</span>
                    <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                    >
                        View source →
                    </a>
                </div>
            </div>
        </article>
    );
}
