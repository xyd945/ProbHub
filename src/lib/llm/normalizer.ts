import { callLLM, parseLLMJson } from './client';
import { SYSTEM_PROMPT, generateHNPrompt } from './prompts';
import type { NormalizedProblem, RawEventPayload } from '@/types/api';

interface LLMProblemResponse {
    isProblem: boolean;
    title: string;
    description: string;
    tags: string[];
    reasoning: string;
}

/**
 * Base problem normalizer using LLM
 */
export class BaseProblemNormalizer {
    constructor(public sourceName: string) { }

    /**
     * Normalize a raw event into a structured problem using LLM
     */
    async normalize(
        raw: RawEventPayload,
        userPrompt: string
    ): Promise<NormalizedProblem | null> {
        try {
            console.log(`[Normalizer] Processing ${this.sourceName} event: ${raw.externalId}`);

            // Call LLM
            const responseText = await callLLM(SYSTEM_PROMPT, userPrompt, {
                jsonMode: true,
            });

            // Parse response
            const llmResponse = parseLLMJson<LLMProblemResponse>(responseText);

            console.log(`[Normalizer] LLM Response:`, {
                isProblem: llmResponse.isProblem,
                reasoning: llmResponse.reasoning,
            });

            // If LLM determines this isn't a problem, skip it
            if (!llmResponse.isProblem) {
                console.log(`[Normalizer] Skipping - not a problem: ${llmResponse.reasoning}`);
                return null;
            }

            // Build normalized problem
            const normalized: NormalizedProblem = {
                title: llmResponse.title,
                description: llmResponse.description,
                createdAtSource: raw.createdAtSource,
                sourceUrl: raw.sourceUrl,
                tags: llmResponse.tags,
            };

            console.log(`[Normalizer] ✅ Normalized problem: "${normalized.title}"`);

            return normalized;
        } catch (error) {
            console.error(`[Normalizer] Error normalizing ${raw.externalId}:`, error);
            throw error;
        }
    }
}

/**
 * Hacker News specific normalizer
 */
export class HackerNewsNormalizer extends BaseProblemNormalizer {
    constructor() {
        super('hackernews');
    }

    async normalize(raw: RawEventPayload): Promise<NormalizedProblem | null> {
        const payload = raw.payload as any;

        // Build HN-specific prompt
        const userPrompt = generateHNPrompt(
            payload.title || '',
            payload.text || '',
            payload.descendants || 0,
            payload.score || 0
        );

        const normalized = await super.normalize(raw, userPrompt);

        if (!normalized) {
            return null;
        }

        // Add HN-specific metadata
        return {
            ...normalized,
            authorHandle: payload.by,
            upvotes: payload.score || 0,
            commentsCount: payload.descendants || 0,
        };
    }
}
