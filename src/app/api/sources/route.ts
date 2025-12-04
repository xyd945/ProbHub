import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sources } from '@/lib/db/schema';
import type { SourceResponse } from '@/types/api';

export async function GET() {
    try {
        const sourcesData = await db.query.sources.findMany({
            orderBy: (sources, { asc }) => [asc(sources.displayName)],
        });

        const response: SourceResponse[] = sourcesData.map((s) => ({
            id: s.id,
            name: s.name,
            displayName: s.displayName,
            type: s.type,
            status: s.status,
        }));

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching sources:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sources' },
            { status: 500 }
        );
    }
}
