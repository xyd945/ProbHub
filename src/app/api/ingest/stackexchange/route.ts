import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sources, rawEvents, problems, tags, problemTags } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { StackExchangeConnector } from '@/lib/connectors/stackexchange';
import { StackExchangeNormalizer } from '@/lib/llm/stackexchange-normalizer';
import { calculateProblemScore } from '@/lib/utils/scoring';
import type { IngestionStats } from '@/types/api';

/**
 * POST /api/ingest/stackexchange
 * 
 * Ingests questions from StackExchange sites and normalizes them into problems using LLM
 */
export async function POST(request: NextRequest) {
    const startTime = new Date();

    try {
        console.log('[Ingestion] Starting StackExchange ingestion...');

        // Get StackExchange source from database
        const seSource = await db.query.sources.findFirst({
            where: eq(sources.name, 'stackexchange'),
        });

        if (!seSource) {
            return NextResponse.json(
                { error: 'StackExchange source not found in database' },
                { status: 500 }
            );
        }

        // Initialize connector and normalizer
        const connector = new StackExchangeConnector();
        const normalizer = new StackExchangeNormalizer();

        // Fetch new events (for now, fetch all recent ones; 'since' parameter unused)
        const newEvents = await connector.fetchNewRawEvents(null);

        console.log(`[Ingestion] Fetched ${newEvents.length} new events`);

        const stats: IngestionStats = {
            source: 'stackexchange',
            fetched: newEvents.length,
            processed: 0,
            errors: 0,
            startedAt: startTime.toISOString(),
            completedAt: '',
        };

        // Process each event
        for (const event of newEvents) {
            try {
                // 1. Check if already processed (deduplication)
                const existing = await db.query.rawEvents.findFirst({
                    where: and(
                        eq(rawEvents.sourceId, seSource.id),
                        eq(rawEvents.externalId, event.externalId)
                    ),
                });

                if (existing && existing.ingestionStatus === 'processed') {
                    console.log(`[Ingestion] Skipping duplicate: ${event.externalId}`);
                    continue;
                }

                // 2. Insert raw_events (ignore if already exists)
                const existingRawEvent = await db.query.rawEvents.findFirst({
                    where: and(
                        eq(rawEvents.sourceId, seSource.id),
                        eq(rawEvents.externalId, event.externalId)
                    ),
                });

                let rawEvent;
                if (existingRawEvent) {
                    rawEvent = existingRawEvent;
                    console.log(`[Ingestion] Using existing raw_event: ${event.externalId}`);
                } else {
                    [rawEvent] = await db
                        .insert(rawEvents)
                        .values({
                            sourceId: seSource.id,
                            externalId: event.externalId,
                            payload: event.payload,
                            fetchedAt: new Date(),
                            ingestionStatus: 'pending',
                        })
                        .returning();
                }

                // 3. Normalize with LLM
                console.log(`[Ingestion] Normalizing: ${event.externalId}`);

                const normalized = await normalizer.normalize(event);

                if (!normalized) {
                    // LLM determined this isn't a problem
                    await db
                        .update(rawEvents)
                        .set({ ingestionStatus: 'processed' })
                        .where(eq(rawEvents.id, rawEvent.id));

                    console.log(`[Ingestion] Skipped (not a problem): ${event.externalId}`);
                    continue;
                }

                // 4. Calculate score
                const score = calculateProblemScore(
                    normalized.upvotes || 0,
                    normalized.commentsCount || 0,
                    normalized.createdAtSource
                );

                // 5. Insert problem
                const [problem] = await db
                    .insert(problems)
                    .values({
                        sourceId: seSource.id,
                        rawEventId: rawEvent.id,
                        externalId: event.externalId,
                        title: normalized.title,
                        description: normalized.description,
                        sourceUrl: normalized.sourceUrl,
                        authorHandle: normalized.authorHandle,
                        createdAtSource: normalized.createdAtSource,
                        upvotes: normalized.upvotes || 0,
                        commentsCount: normalized.commentsCount || 0,
                        score: String(score),
                        language: normalized.language || 'en',
                    })
                    .onConflictDoNothing()
                    .returning();

                if (problem) {
                    // 6. Process tags
                    if (normalized.tags && normalized.tags.length > 0) {
                        await processTags(problem.id, normalized.tags);
                    }

                    // 7. Mark raw event as processed
                    await db
                        .update(rawEvents)
                        .set({ ingestionStatus: 'processed' })
                        .where(eq(rawEvents.id, rawEvent.id));

                    stats.processed++;
                    console.log(`[Ingestion] ✅ Processed: "${normalized.title}"`);
                }
            } catch (error) {
                stats.errors++;
                console.error(`[Ingestion] Error processing ${event.externalId}:`, error);

                // Mark as error if raw event exists
                try {
                    await db
                        .update(rawEvents)
                        .set({
                            ingestionStatus: 'error',
                            ingestionError: String(error),
                        })
                        .where(
                            and(
                                eq(rawEvents.sourceId, seSource.id),
                                eq(rawEvents.externalId, event.externalId)
                            )
                        );
                } catch (updateError) {
                    console.error('[Ingestion] Failed to update error status:', updateError);
                }
            }
        }

        const endTime = new Date();
        stats.completedAt = endTime.toISOString();

        console.log('[Ingestion] ✅ Completed:', stats);

        return NextResponse.json(stats);
    } catch (error) {
        console.error('[Ingestion] Fatal error:', error);
        return NextResponse.json(
            { error: 'Ingestion failed', message: String(error) },
            { status: 500 }
        );
    }
}

/**
 * Helper function to process tags for a problem
 */
async function processTags(problemId: string, tagSlugs: string[]): Promise<void> {
    for (const slug of tagSlugs) {
        // Ensure tag exists
        const [tag] = await db
            .insert(tags)
            .values({
                slug: slug.toLowerCase().replace(/\s+/g, '-'),
                name: slug,
                type: 'system', // Auto-generated tags
            })
            .onConflictDoNothing()
            .returning();

        if (tag) {
            // Link tag to problem
            await db
                .insert(problemTags)
                .values({
                    problemId,
                    tagId: tag.id,
                })
                .onConflictDoNothing();
        } else {
            // Tag already exists, find it and link
            const existingTag = await db.query.tags.findFirst({
                where: eq(tags.slug, slug.toLowerCase().replace(/\s+/g, '-')),
            });

            if (existingTag) {
                await db
                    .insert(problemTags)
                    .values({
                        problemId,
                        tagId: existingTag.id,
                    })
                    .onConflictDoNothing();
            }
        }
    }
}
