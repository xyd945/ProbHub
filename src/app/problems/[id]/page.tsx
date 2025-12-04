import { notFound } from "next/navigation";
import SourceBadge from "@/components/SourceBadge";
import { formatDistanceToNow } from "date-fns";
import type { ProblemDetailResponse } from "@/types/api";

async function getProblem(id: string): Promise<ProblemDetailResponse> {
    // Use environment-aware base URL
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/problems/${id}`, {
        cache: 'no-store',
    });

    if (!res.ok) {
        return notFound();
    }

    return res.json();
}

export default async function ProblemDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const problem = await getProblem(params.id);
    const timeAgo = formatDistanceToNow(new Date(problem.createdAtSource), {
        addSuffix: true,
    });

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <a
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
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
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Back to problems
                </a>

                {/* Problem Header */}
                <div className="mb-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <h1 className="text-4xl font-bold flex-1">{problem.title}</h1>
                        <SourceBadge source={problem.source} size="md" />
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{timeAgo}</span>
                        <span>•</span>
                        <span>{problem.upvotes} upvotes</span>
                        <span>•</span>
                        <span>{problem.commentsCount} comments</span>
                        {problem.authorHandle && (
                            <>
                                <span>•</span>
                                <span>by {problem.authorHandle}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Tags */}
                {problem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        {problem.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 text-sm rounded-md bg-secondary text-secondary-foreground"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Description */}
                <div className="mb-8">
                    <p className="text-lg leading-relaxed text-foreground">{problem.description}</p>
                </div>

                {/* Source Link */}
                <div className="p-6 rounded-lg bg-muted/50 border border-border">
                    <h3 className="font-semibold mb-2">View Original Discussion</h3>
                    <a
                        href={problem.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-2"
                    >
                        {problem.sourceUrl}
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
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                        </svg>
                    </a>
                </div>

                {/* Stats Card */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-card border border-border text-center">
                        <div className="text-2xl font-bold text-primary">
                            {problem.score}
                        </div>
                        <div className="text-sm text-muted-foreground">Score</div>
                    </div>
                    <div className="p-4 rounded-lg bg-card border border-border text-center">
                        <div className="text-2xl font-bold text-primary">
                            {problem.upvotes}
                        </div>
                        <div className="text-sm text-muted-foreground">Upvotes</div>
                    </div>
                    <div className="p-4 rounded-lg bg-card border border-border text-center">
                        <div className="text-2xl font-bold text-primary">
                            {problem.commentsCount}
                        </div>
                        <div className="text-sm text-muted-foreground">Comments</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
