'use client';

import { useState, useEffect } from 'react';

interface TagFilterProps {
    onFilterChange: (tag: string | null) => void;
}

export default function TagFilter({ onFilterChange }: TagFilterProps) {
    const [tags, setTags] = useState<{ slug: string; name: string }[]>([]);
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTags() {
            try {
                const res = await fetch('/api/tags');
                if (!res.ok) {
                    throw new Error('Failed to fetch tags');
                }
                const data = await res.json();
                console.log('Fetched tags:', data.length); // Debug log
                setTags(data);
            } catch (error) {
                console.error('Error fetching tags:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchTags();
    }, []);

    const handleTagClick = (tag: string | null) => {
        setActiveTag(tag);
        onFilterChange(tag);
    };

    if (loading) {
        return (
            <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div
                                key={i}
                                className="h-9 w-24 rounded-full bg-secondary/50 animate-pulse flex-shrink-0"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="sticky top-16 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-4">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {/* All filter */}
                    <button
                        onClick={() => handleTagClick(null)}
                        className={`
                            px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                            transition-all duration-200 flex-shrink-0
                            ${activeTag === null
                                ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md'
                                : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                            }
                        `}
                    >
                        All
                    </button>

                    {/* Tag filters - show ALL tags with horizontal scroll */}
                    {tags.map((tag) => (
                        <button
                            key={tag.slug}
                            onClick={() => handleTagClick(tag.slug)}
                            className={`
                                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                                transition-all duration-200 flex-shrink-0
                                ${activeTag === tag.slug
                                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md'
                                    : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                                }
                            `}
                        >
                            #{tag.name}
                        </button>
                    ))}

                    {/* Show tag count */}
                    <div className="flex items-center px-3 text-xs text-muted-foreground flex-shrink-0">
                        {tags.length} tags
                    </div>
                </div>
            </div>
        </div>
    );
}
