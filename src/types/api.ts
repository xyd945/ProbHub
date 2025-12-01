// API Request/Response Types

export interface ProblemListParams {
    q?: string; // Full-text search query
    source?: string; // Filter by source name
    tag?: string[]; // Filter by tag slugs
    sort?: 'new' | 'top' | 'trending';
    page?: number;
    page_size?: number;
}

export interface ProblemListResponse {
    items: ProblemWithTags[];
    total: number;
    page: number;
    page_size: number;
}

export interface ProblemWithTags {
    id: string;
    title: string;
    description: string;
    source: string;
    sourceUrl: string;
    createdAtSource: string;
    upvotes: number;
    commentsCount: number;
    score: number;
    tags: string[];
    authorHandle?: string;
    language?: string;
}

export interface ProblemDetailResponse extends ProblemWithTags {
    rawEventId?: string;
}

export interface SourceResponse {
    id: string;
    name: string;
    displayName: string;
    type: string;
    status: string;
}

export interface TagResponse {
    id: string;
    slug: string;
    name: string;
    type: string;
}

// Connector Types

export interface SourceConnector {
    sourceName: string;
    fetchNewRawEvents(since: Date | null): Promise<RawEventPayload[]>;
}

export interface RawEventPayload {
    externalId: string;
    externalParentId?: string;
    payload: unknown; // Raw JSON from API
    createdAtSource: Date;
    sourceUrl: string;
}

// Normalizer Types

export interface ProblemNormalizer {
    sourceName: string;
    normalize(raw: RawEventPayload): Promise<NormalizedProblem | null>;
}

export interface NormalizedProblem {
    title: string;
    description: string;
    createdAtSource: Date;
    sourceUrl: string;
    authorHandle?: string;
    upvotes?: number;
    commentsCount?: number;
    tags?: string[];
    language?: string;
}

// LLM Types

export interface LLMConfig {
    baseUrl: string;
    apiKey: string;
    model: string;
    maxTokens?: number;
    temperature?: number;
}

export interface LLMResponse {
    title: string;
    description: string;
    tags: string[];
    isProblem: boolean; // Whether this is actually a problem worth indexing
}

// Ingestion Stats

export interface IngestionStats {
    source: string;
    fetched: number;
    processed: number;
    errors: number;
    startedAt: string;
    completedAt: string;
}
