import { SCORING_WEIGHTS } from '../config';

/**
 * Calculate a composite score for a problem based on engagement and recency
 */
export function calculateProblemScore(
    upvotes: number,
    commentsCount: number,
    createdAt: Date
): number {
    const { upvotesMultiplier, commentsMultiplier, ageDecayPerDay } = SCORING_WEIGHTS;

    // Logarithmic scaling for engagement metrics
    const upvoteScore = Math.log(1 + upvotes) * upvotesMultiplier;
    const commentScore = Math.log(1 + commentsCount) * commentsMultiplier;

    // Time decay
    const now = new Date();
    const ageInDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const timeDecay = ageInDays * ageDecayPerDay;

    // Final score
    const score = Math.max(0, upvoteScore + commentScore - timeDecay);

    return Math.round(score * 100) / 100; // Round to 2 decimal places
}

/**
 * Build full-text search vector for PostgreSQL
 */
export function buildSearchVector(title: string, description: string): string {
    // Combine title (weighted higher) and description
    // PostgreSQL will handle this via trigger or computed column
    return `${title} ${description}`;
}
