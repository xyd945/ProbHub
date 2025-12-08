'use client';

import { useState } from 'react';
import ProblemCard from '@/components/ProblemCard';
import TagFilter from '@/components/TagFilter';
import type { ProblemWithTags } from '@/types/api';

interface ProblemsClientProps {
    initialProblems: ProblemWithTags[];
}

export default function ProblemsClient({ initialProblems }: ProblemsClientProps) {
    const [filteredProblems, setFilteredProblems] = useState<ProblemWithTags[]>(initialProblems);
    const [activeTag, setActiveTag] = useState<string | null>(null);

    const handleFilterChange = (tag: string | null) => {
        setActiveTag(tag);
        if (tag === null) {
            setFilteredProblems(initialProblems);
        } else {
            setFilteredProblems(
                initialProblems.filter((problem) => problem.tags.includes(tag))
            );
        }
    };

    return (
        <div>
            {/* Tag Filters */}
            <TagFilter onFilterChange={handleFilterChange} />

            {/* Main Content */}
            <div className="container mx-auto px-4 pt-8 pb-8">
                {filteredProblems.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-lg text-muted-foreground mb-2">
                            {initialProblems.length === 0 ? 'No problems yet' : 'No problems found'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {initialProblems.length === 0
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
                    </div>
                )}
            </div>
        </div>
    );
}
