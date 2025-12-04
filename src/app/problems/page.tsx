import ProblemCard from "@/components/ProblemCard";
import type { ProblemListResponse } from "@/types/api";

async function getProblems(params: {
    q?: string;
    source?: string;
    sort?: string;
    page?: number;
}): Promise<ProblemListResponse> {
    const searchParams = new URLSearchParams();

    if (params.q) searchParams.set('q', params.q);
    if (params.source) searchParams.set('source', params.source);
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.page) searchParams.set('page', params.page.toString());
    searchParams.set('page_size', '20');

    const url = `http://localhost:3000/api/problems?${searchParams.toString()}`;

    const res = await fetch(url, {
        cache: 'no-store', // Always fetch fresh data
    });

    if (!res.ok) {
        throw new Error('Failed to fetch problems');
    }

    return res.json();
}

export default async function ProblemsPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const sort = (searchParams.sort as string) || 'new';
    const q = searchParams.q as string | undefined;
    const source = searchParams.source as string | undefined;
    const page = searchParams.page ? parseInt(searchParams.page as string) : 1;

    const data = await getProblems({ q, source, sort, page });

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-2">
                    Discover <span className="text-primary">Problems</span>
                </h1>
                <p className="text-muted-foreground mb-8">
                    Real problems people are discussing across the internet
                </p>

                {/* Filters - simplified for now */}
                <div className="mb-8 flex gap-4 items-center">
                    <div className="flex gap-2">
                        <a
                            href="/problems?sort=new"
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sort === 'new'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                }`}
                        >
                            Latest
                        </a>
                        <a
                            href="/problems?sort=top"
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sort === 'top'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                }`}
                        >
                            Top
                        </a>
                    </div>

                    <div className="flex-1" />

                    <div className="text-sm text-muted-foreground">
                        {data.total} problems found
                    </div>
                </div>

                {/* Problem List */}
                {data.items.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <p className="text-lg mb-4">🔍 No problems found</p>
                        <p className="text-sm">
                            Try running ingestion: curl -X POST
                            http://localhost:3000/api/ingest/hackernews
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {data.items.map((problem) => (
                            <ProblemCard
                                key={problem.id}
                                id={problem.id}
                                title={problem.title}
                                description={problem.description}
                                source={problem.source}
                                sourceUrl={problem.sourceUrl}
                                createdAtSource={problem.createdAtSource}
                                upvotes={problem.upvotes}
                                commentsCount={problem.commentsCount}
                                tags={problem.tags}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {data.total > data.page_size && (
                    <div className="mt-8 flex justify-center gap-2">
                        {page > 1 && (
                            <a
                                href={`/problems?page=${page - 1}&sort=${sort}`}
                                className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                            >
                                Previous
                            </a>
                        )}
                        <span className="px-4 py-2 text-sm text-muted-foreground">
                            Page {page} of {Math.ceil(data.total / data.page_size)}
                        </span>
                        {page < Math.ceil(data.total / data.page_size) && (
                            <a
                                href={`/problems?page=${page + 1}&sort=${sort}`}
                                className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                            >
                                Next
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
