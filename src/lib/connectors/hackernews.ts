import type { SourceConnector, RawEventPayload } from '@/types/api';
import { HN_API } from '../config';

interface HNItem {
    id: number;
    type: string;
    by: string;
    time: number;
    title?: string;
    text?: string;
    url?: string;
    score?: number;
    descendants?: number;
    kids?: number[];
}

/**
 * Hacker News API connector
 */
export class HackerNewsConnector implements SourceConnector {
    sourceName = 'hackernews';
    private baseUrl = HN_API.baseUrl;

    /**
     * Fetch new Ask HN stories
     */
    async fetchNewRawEvents(since: Date | null): Promise<RawEventPayload[]> {
        try {
            console.log('[HN Connector] Fetching Ask HN stories...');

            // Get Ask HN story IDs
            const askStoriesUrl = `${this.baseUrl}${HN_API.endpoints.askStories}`;
            const response = await fetch(askStoriesUrl);

            if (!response.ok) {
                throw new Error(`HN API error: ${response.status}`);
            }

            const storyIds: number[] = await response.json();

            console.log(`[HN Connector] Found ${storyIds.length} Ask HN stories`);

            // For initial testing, limit to recent stories
            const limit = 20; // Start with 20 stories
            const recentIds = storyIds.slice(0, limit);

            // Fetch story details
            const events: RawEventPayload[] = [];

            for (const id of recentIds) {
                try {
                    const item = await this.fetchItem(id);

                    if (!item) continue;

                    // Filter: must have text and decent engagement
                    if (!item.text || (item.score || 0) < 3) {
                        continue;
                    }

                    // Check if newer than 'since' date
                    if (since) {
                        const itemDate = new Date(item.time * 1000);
                        if (itemDate <= since) {
                            continue;
                        }
                    }

                    events.push({
                        externalId: String(item.id),
                        payload: item,
                        createdAtSource: new Date(item.time * 1000),
                        sourceUrl: `https://news.ycombinator.com/item?id=${item.id}`,
                    });

                    // Rate limiting: small delay between requests
                    await this.sleep(100);
                } catch (error) {
                    console.error(`[HN Connector] Error fetching item ${id}:`, error);
                }
            }

            console.log(`[HN Connector] ✅ Fetched ${events.length} valid events`);

            return events;
        } catch (error) {
            console.error('[HN Connector] Failed to fetch stories:', error);
            throw error;
        }
    }

    /**
     * Fetch a single HN item by ID
     */
    private async fetchItem(id: number): Promise<HNItem | null> {
        const url = `${this.baseUrl}${HN_API.endpoints.item(id)}`;
        const response = await fetch(url);

        if (!response.ok) {
            return null;
        }

        return response.json();
    }

    /**
     * Simple sleep utility for rate limiting
     */
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
