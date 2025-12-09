import { BaseProblemNormalizer } from './normalizer';
import type { NormalizedProblem, RawEventPayload } from '@/types/api';

/**
 * StackExchange specific normalizer
 */
export class StackExchangeNormalizer extends BaseProblemNormalizer {
    constructor() {
        super('stackexchange');
    }

    async normalize(raw: RawEventPayload): Promise<NormalizedProblem | null> {
        const payload = raw.payload as any;

        // Build SE-specific prompt
        const userPrompt = this.generateSEPrompt(
            payload.title || '',
            payload.body || '',
            payload.score || 0,
            payload.view_count || 0,
            payload.answer_count || 0,
            payload.tags || [],
            payload._site || 'unknown'
        );

        const normalized = await super.normalize(raw, userPrompt);

        if (!normalized) {
            return null;
        }

        // Add SE-specific metadata
        return {
            ...normalized,
            authorHandle: payload.owner?.display_name,
            upvotes: payload.score || 0,
            commentsCount: payload.answer_count || 0, // Use answer count as engagement metric
        };
    }

    /**
     * Generate LLM prompt for StackExchange question
     */
    private generateSEPrompt(
        title: string,
        body: string,
        score: number,
        views: number,
        answers: number,
        tags: string[],
        site: string
    ): string {
        return `Analyze this StackExchange question from ${site} and determine if it represents a real-world problem worth documenting.

**Question Title:** ${title}

**Question Body:**
${body}

**Engagement Metrics:**
- Score (upvotes): ${score}
- Views: ${views}
- Answers: ${answers}
- Tags: ${tags.join(', ')}

**Instructions:**
1. Is this a genuine problem that people face in real life? (not just technical/theoretical)
2. If yes, extract:
   - A clear, concise title (problem-focused)
   - A description of the problem (remove code, technical jargon, keep it understandable)
   - Relevant tags (focus on problem domain, not necessarily the SE tags)

Return JSON:
{
    "isProblem": true/false,
    "title": "problem title",
    "description": "problem description",
    "tags": ["tag1", "tag2"],
    "reasoning": "why this is/isn't a real-world problem"
}`;
    }
}
