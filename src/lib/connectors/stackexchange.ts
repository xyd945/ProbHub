import type { SourceConnector, RawEventPayload } from '@/types/api';
import { STACKEXCHANGE_API } from '../config';

// StackExchange API response types
interface SEQuestion {
    question_id: number;
    title: string;
    body: string;
    link: string;
    score: number;
    view_count: number;
    answer_count: number;
    creation_date: number;
    last_activity_date: number;
    owner: {
        display_name?: string;
        user_id?: number;
    };
    tags: string[];
}

interface SEQuestionsResponse {
    items: SEQuestion[];
    has_more: boolean;
    quota_remaining: number;
}

/**
 * StackExchange API Connector
 * Fetches questions from multiple SE sites with configurable sorting/filtering
 */
export class StackExchangeConnector implements SourceConnector {
    sourceName = 'stackexchange';
    private baseUrl = STACKEXCHANGE_API.baseUrl;
    private apiKey = STACKEXCHANGE_API.apiKey;
    private version = STACKEXCHANGE_API.version;

    /**
     * Fetch questions from all configured SE sites
     */
    async fetchNewRawEvents(since: Date | null): Promise<RawEventPayload[]> {
        console.log('[SE Connector] Starting StackExchange ingestion...');

        const allEvents: RawEventPayload[] = [];

        // Process Tier 1 sites
        for (const site of STACKEXCHANGE_API.sites.tier1) {
            const events = await this.fetchQuestionsFromSite(
                site.slug,
                site.name,
                STACKEXCHANGE_API.tier1Limit
            );
            allEvents.push(...events);
        }

        // Process Tier 2 sites
        for (const site of STACKEXCHANGE_API.sites.tier2) {
            const events = await this.fetchQuestionsFromSite(
                site.slug,
                site.name,
                STACKEXCHANGE_API.tier2Limit
            );
            allEvents.push(...events);
        }

        console.log(`[SE Connector] ✅ Fetched ${allEvents.length} questions total`);
        return allEvents;
    }

    /**
     * Fetch questions from a specific SE site
     */
    private async fetchQuestionsFromSite(
        siteSlug: string,
        siteName: string,
        limit: number
    ): Promise<RawEventPayload[]> {
        try {
            console.log(`[SE Connector] Fetching from ${siteName} (${limit} questions)...`);

            const url = this.buildQuestionsUrl(siteSlug, limit);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`SE API error for ${siteName}: ${response.status}`);
            }

            const data: SEQuestionsResponse = await response.json();

            console.log(`[SE Connector] ${siteName}: Found ${data.items.length} questions, quota remaining: ${data.quota_remaining}`);

            // Convert to RawEventPayload
            const events = data.items.map((q) => this.toRawEvent(q, siteSlug));

            // Rate limiting delay
            await this.sleep(STACKEXCHANGE_API.requestDelayMs);

            return events;
        } catch (error) {
            console.error(`[SE Connector] Error fetching from ${siteName}:`, error);
            return [];
        }
    }

    /**
     * Build API URL for fetching questions
     * Extensible: easy to add date filtering, different sorts, etc.
     */
    private buildQuestionsUrl(site: string, limit: number): string {
        const params = new URLSearchParams({
            site,
            pagesize: String(limit),
            sort: STACKEXCHANGE_API.defaultParams.sort,
            order: STACKEXCHANGE_API.defaultParams.order,
            filter: STACKEXCHANGE_API.defaultParams.filter,
            key: this.apiKey || '',

            // Future extensibility: uncomment to add date filtering
            // fromdate: String(Math.floor(fromDate.getTime() / 1000)),
            // todate: String(Math.floor(toDate.getTime() / 1000)),
        });

        return `${this.baseUrl}/${this.version}/questions?${params.toString()}`;
    }

    /**
     * Convert SE question to RawEventPayload
     */
    private toRawEvent(question: SEQuestion, site: string): RawEventPayload {
        return {
            externalId: `${site}:${question.question_id}`,
            payload: {
                ...question,
                _site: site, // Track which site this came from
            },
            createdAtSource: new Date(question.creation_date * 1000),
            sourceUrl: question.link,
        };
    }

    /**
     * Rate limiting utility
     */
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
