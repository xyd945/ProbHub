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

            {/* Problems Grid */}
            <div className="container mx-auto px-4 py-8">
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
