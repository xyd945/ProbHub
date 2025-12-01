import { pgTable, uuid, text, timestamp, pgEnum, jsonb, integer, index, numeric } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums
export const sourceTypeEnum = pgEnum('source_type', [
    'forum',
    'qa',
    'code_repo',
    'review_site',
    'social',
]);

export const sourceStatusEnum = pgEnum('source_status', ['active', 'paused']);

export const ingestionStatusEnum = pgEnum('ingestion_status', [
    'pending',
    'processed',
    'error',
]);

export const tagTypeEnum = pgEnum('tag_type', [
    'domain',
    'persona',
    'impact',
    'status',
    'source_tag',
    'system',
]);

export const signalTypeEnum = pgEnum('signal_type', [
    'view',
    'click_source',
    'bookmark',
    'share',
]);

// Tables
export const sources = pgTable('sources', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull().unique(),
    displayName: text('display_name').notNull(),
    type: sourceTypeEnum('type').notNull(),
    status: sourceStatusEnum('status').notNull().default('active'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const rawEvents = pgTable(
    'raw_events',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        sourceId: uuid('source_id')
            .notNull()
            .references(() => sources.id),
        externalId: text('external_id').notNull(),
        externalParentId: text('external_parent_id'),
        payload: jsonb('payload').notNull(),
        fetchedAt: timestamp('fetched_at').notNull().defaultNow(),
        ingestionStatus: ingestionStatusEnum('ingestion_status')
            .notNull()
            .default('pending'),
        ingestionError: text('ingestion_error'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => ({
        sourceExternalIdIdx: index('raw_events_source_external_id_idx').on(
            table.sourceId,
            table.externalId
        ),
        ingestionStatusIdx: index('raw_events_ingestion_status_idx').on(
            table.ingestionStatus
        ),
    })
);

export const problems = pgTable(
    'problems',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        sourceId: uuid('source_id')
            .notNull()
            .references(() => sources.id),
        rawEventId: uuid('raw_event_id').references(() => rawEvents.id),
        externalId: text('external_id').notNull(),
        title: text('title').notNull(),
        description: text('description').notNull(),
        sourceUrl: text('source_url').notNull(),
        authorHandle: text('author_handle'),
        createdAtSource: timestamp('created_at_source').notNull(),
        language: text('language').default('en'),
        upvotes: integer('upvotes').default(0),
        commentsCount: integer('comments_count').default(0),
        score: numeric('score').default('0'),
        // Full-text search vector (computed via trigger or application)
        fts: text('fts'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    },
    (table) => ({
        sourceExternalIdIdx: index('problems_source_external_id_idx').on(
            table.sourceId,
            table.externalId
        ),
        scoreIdx: index('problems_score_idx').on(table.score),
        createdAtSourceIdx: index('problems_created_at_source_idx').on(
            table.createdAtSource
        ),
        // GIN index for full-text search (will be created via migration)
    })
);

export const tags = pgTable('tags', {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    type: tagTypeEnum('type').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const problemTags = pgTable(
    'problem_tags',
    {
        problemId: uuid('problem_id')
            .notNull()
            .references(() => problems.id, { onDelete: 'cascade' }),
        tagId: uuid('tag_id')
            .notNull()
            .references(() => tags.id, { onDelete: 'cascade' }),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => ({
        pk: index('problem_tags_pk').on(table.problemId, table.tagId),
        problemIdIdx: index('problem_tags_problem_id_idx').on(table.problemId),
        tagIdIdx: index('problem_tags_tag_id_idx').on(table.tagId),
    })
);

export const problemSignals = pgTable(
    'problem_signals',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        problemId: uuid('problem_id')
            .notNull()
            .references(() => problems.id, { onDelete: 'cascade' }),
        userId: uuid('user_id'), // nullable for anonymous
        type: signalTypeEnum('type').notNull(),
        metadata: jsonb('metadata'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => ({
        problemIdIdx: index('problem_signals_problem_id_idx').on(table.problemId),
        typeIdx: index('problem_signals_type_idx').on(table.type),
    })
);

// Type exports for use in application code
export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;

export type RawEvent = typeof rawEvents.$inferSelect;
export type NewRawEvent = typeof rawEvents.$inferInsert;

export type Problem = typeof problems.$inferSelect;
export type NewProblem = typeof problems.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type ProblemTag = typeof problemTags.$inferSelect;
export type NewProblemTag = typeof problemTags.$inferInsert;

export type ProblemSignal = typeof problemSignals.$inferSelect;
export type NewProblemSignal = typeof problemSignals.$inferInsert;
