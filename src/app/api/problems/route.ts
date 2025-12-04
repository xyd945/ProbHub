import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { problems, sources, problemTags, tags } from '@/lib/db/schema';
import { eq, desc, asc, and, or, sql, ilike } from 'drizzle-orm';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/config';
import type { ProblemListResponse, ProblemWithTags } from '@/types/api';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Parse query parameters
        const q = searchParams.get('q') || undefined;
        const sourceFilter = searchParams.get('source') || undefined;
        const tagFilters = searchParams.getAll('tag');
        const sortBy = searchParams.get('sort') || 'new';
        const page = parseInt(searchParams.get('page') || '1', 10);
        const pageSize = Math.min(
            parseInt(searchParams.get('page_size') || String(DEFAULT_PAGE_SIZE), 10),
            MAX_PAGE_SIZE
        );

        // Build WHERE conditions
        const conditions = [];

        // Full-text search
        if (q) {
            conditions.push(
                or(
                    ilike(problems.title, `%${q}%`),
                    ilike(problems.description, `%${q}%`)
                )
            );
        }

        // Source filter
        if (sourceFilter) {
            const source = await db.query.sources.findFirst({
                where: eq(sources.name, sourceFilter),
            });
            if (source) {
                conditions.push(eq(problems.sourceId, source.id));
            }
        }

        // Combine conditions
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Determine sort order
        let orderByClause;
        switch (sortBy) {
            case 'top':
                orderByClause = [desc(problems.score), desc(problems.createdAtSource)];
                break;
            case 'trending':
                // Trending: high score + recent
                orderByClause = [desc(problems.score), desc(problems.createdAtSource)];
                break;
            case 'new':
            default:
                orderByClause = [desc(problems.createdAtSource)];
                break;
        }

        // Fetch problems with pagination
        const offset = (page - 1) * pageSize;

        const problemsData = await db.query.problems.findMany({
            where: whereClause,
            orderBy: orderByClause,
            limit: pageSize,
            offset,
            with: {
                source: true,
            },
        });

        // Get total count
        const totalResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(problems)
            .where(whereClause);
        const total = Number(totalResult[0]?.count || 0);

        // Fetch tags for each problem
        const problemIds = problemsData.map((p) => p.id);
        const problemTagsData = problemIds.length > 0
            ? await db.query.problemTags.findMany({
                where: sql`${problemTags.problemId} IN ${problemIds}`,
                with: {
                    tag: true,
                },
            })
            : [];

        // Group tags by problem ID
        const tagsByProblem = new Map<string, string[]>();
        for (const pt of problemTagsData) {
            if (!tagsByProblem.has(pt.problemId)) {
                tagsByProblem.set(pt.problemId, []);
            }
            tagsByProblem.get(pt.problemId)!.push(pt.tag.slug);
        }

        // Format response
        const items: ProblemWithTags[] = problemsData.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            source: p.source.name,
            sourceUrl: p.sourceUrl,
            createdAtSource: p.createdAtSource.toISOString(),
            upvotes: p.upvotes || 0,
            commentsCount: p.commentsCount || 0,
            score: Number(p.score || 0),
            tags: tagsByProblem.get(p.id) || [],
            authorHandle: p.authorHandle || undefined,
            language: p.language || undefined,
        }));

        const response: ProblemListResponse = {
            items,
            total,
            page,
            page_size: pageSize,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching problems:', error);
        return NextResponse.json(
            { error: 'Failed to fetch problems' },
            { status: 500 }
        );
    }
}
