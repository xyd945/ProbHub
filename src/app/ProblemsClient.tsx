'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ProblemCard from '@/components/ProblemCard';
import ProblemCardSkeleton from '@/components/ProblemCardSkeleton';
import TagFilter from '@/components/TagFilter';
import type { ProblemWithTags } from '@/types/api';

interface ProblemsClientProps {
    initialProblems: ProblemWithTags[];
}

export default function ProblemsClient({ initialProblems }: ProblemsClientProps) {
    const [allProblems, setAllProblems] = useState<ProblemWithTags[]>(initialProblems);
    const [filteredProblems, setFilteredProblems] = useState<ProblemWithTags[]>(initialProblems);
    const [activeTag, setActiveTag] = useState<string | null>(null);

    // Infinite scroll state
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialProblems.length === 50); // Assume more if we got full page
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    // Fetch more problems
    const fetchMoreProblems = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const nextPage = page + 1;
            const response = await fetch(`/api/problems?page=${nextPage}&page_size=50&sort=new`);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                setAllProblems(prev => [...prev, ...data.items]);

                // If no tag filter, also update filtered list
                if (!activeTag) {
                    setFilteredProblems(prev => [...prev, ...data.items]);
                }

                setPage(nextPage);
                setHasMore(data.items.length === 50); // Has more if we got a full page
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching more problems:', error);
        } finally {
            setLoading(false);
        }
    }, [page, loading, hasMore, activeTag]);

    // Set up intersection observer for infinite scroll
    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    fetchMoreProblems();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [fetchMoreProblems, hasMore, loading]);

    const handleFilterChange = (tag: string | null) => {
        setActiveTag(tag);
        if (tag === null) {
            setFilteredProblems(allProblems);
        } else {
            setFilteredProblems(
                allProblems.filter((problem) => problem.tags.includes(tag))
            );
        }
    };

    return (
        <div>
            {/* Tag Filters */}
            <TagFilter onFilterChange={handleFilterChange} />

            {/* Main Content */}
            <div className="container mx-auto px-4 pt-8 pb-8">
                {filteredProblems.length === 0 && !loading ? (
                    <div className="text-center py-20">
                        <p className="text-lg text-muted-foreground mb-2">
                            {allProblems.length === 0 ? 'No problems yet' : 'No problems found'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {allProblems.length === 0
                                ? 'Run ingestion to fetch problems from Hacker News'
                                : `Try selecting a different tag`}
                        </p>
                    </div>
                ) : (
                    <div className="masonry-grid">
                        {/* Hero Section as Masonry Item - Takes 2 card widths on desktop */}
                        <div className="masonry-item hero-item">
                            <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/20 rounded-xl p-6 md:p-8 text-center h-full flex flex-col justify-center">
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent leading-tight">
                                    Discover Problems Worth Solving
                                </h1>
                                <p className="text-base md:text-lg text-foreground/70 leading-relaxed">
                                    Start your business from a problem, and create a product market fit
                                </p>
                            </div>
                        </div>

                        {/* Problem Cards */}
                        {filteredProblems.map((problem) => (
                            <div key={problem.id} className="masonry-item">
                                <ProblemCard
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
                            </div>
                        ))}

                        {/* Loading Skeletons */}
                        {loading && (
                            <>
                                {[...Array(6)].map((_, i) => (
                                    <div key={`skeleton-${i}`} className="masonry-item">
                                        <ProblemCardSkeleton />
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {/* Infinite scroll trigger */}
                {!activeTag && hasMore && (
                    <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                        {!loading && (
                            <p className="text-sm text-muted-foreground">
                                Loading more problems...
                            </p>
                        )}
                    </div>
                )}

                {/* End of list message */}
                {!activeTag && !hasMore && allProblems.length > 0 && (
                    <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">
                            You've reached the end! 🎉
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
