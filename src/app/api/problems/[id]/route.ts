import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { problems, problemTags } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { ProblemDetailResponse } from '@/types/api';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Fetch problem with source
        const problem = await db.query.problems.findFirst({
            where: eq(problems.id, id),
            with: {
                source: true,
            },
        });

        if (!problem) {
            return NextResponse.json(
                { error: 'Problem not found' },
                { status: 404 }
            );
        }

        // Fetch tags
        const problemTagsData = await db.query.problemTags.findMany({
            where: eq(problemTags.problemId, id),
            with: {
                tag: true,
            },
        });

        const tagsList = problemTagsData.map((pt) => pt.tag.slug);

        // Format response
        const response: ProblemDetailResponse = {
            id: problem.id,
            title: problem.title,
            description: problem.description,
            source: problem.source.name,
            sourceUrl: problem.sourceUrl,
            createdAtSource: problem.createdAtSource.toISOString(),
            upvotes: problem.upvotes || 0,
            commentsCount: problem.commentsCount || 0,
            score: Number(problem.score || 0),
            tags: tagsList,
            authorHandle: problem.authorHandle || undefined,
            language: problem.language || undefined,
            rawEventId: problem.rawEventId || undefined,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching problem:', error);
        return NextResponse.json(
            { error: 'Failed to fetch problem' },
            { status: 500 }
        );
    }
}
