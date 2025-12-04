import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tags } from '@/lib/db/schema';
import type { TagResponse } from '@/types/api';

export async function GET() {
    try {
        const tagsData = await db.query.tags.findMany({
            orderBy: (tags, { asc }) => [asc(tags.name)],
        });

        const response: TagResponse[] = tagsData.map((t) => ({
            id: t.id,
            slug: t.slug,
            name: t.name,
            type: t.type,
        }));

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching tags:', error);
        return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }
}
