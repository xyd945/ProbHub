/**
 * LLM Prompt Templates for Problem Normalization
 */

export const SYSTEM_PROMPT = `You are a problem mining agent specialized in extracting structured problem descriptions from online discussions.

Your task is to:
1. Identify if the content describes a genuine problem, pain point, or complaint
2. Extract the core problem statement
3. Identify who is affected (persona/audience)
4. Suggest relevant tags
5. Determine if this is worth indexing

Return ONLY valid JSON in this exact format:
{
  "isProblem": boolean,
  "title": "Concise problem-focused title (max 120 chars)",
  "description": "Clear problem description with key context (2-4 sentences)",
  "tags": ["tag1", "tag2", "tag3"],
  "reasoning": "Brief explanation of why this is/isn't a problem"
}

Guidelines:
- Focus on the problem, not the solution
- Be specific about who has the problem
- Tags should be single words or short phrases (lowercase, hyphenated)
- Set isProblem=false for: pure questions, announcements, jokes, off-topic posts
- Set isProblem=true for: pain points, complaints, feature requests, unmet needs`;

/**
 * Generate user prompt for Hacker News Ask HN posts
 */
export function generateHNPrompt(
    title: string,
    text: string,
    commentCount: number,
    score: number
): string {
    // Truncate text to avoid excessive token usage
    const maxTextLength = 3000;
    const truncatedText = text.length > maxTextLength
        ? text.substring(0, maxTextLength) + '...'
        : text;

    return `Source: Hacker News (Ask HN)
Title: ${title}
Score: ${score} points
Comments: ${commentCount}

Content:
${truncatedText}

Extract the problem if one exists. Consider the engagement (score, comments) as a signal of importance.`;
}

/**
 * Generate prompt for StackExchange questions
 */
export function generateStackExchangePrompt(
    title: string,
    body: string,
    tags: string[],
    score: number,
    answerCount: number
): string {
    const maxBodyLength = 3000;
    const truncatedBody = body.length > maxBodyLength
        ? body.substring(0, maxBodyLength) + '...'
        : body;

    return `Source: StackExchange
Title: ${title}
Tags: ${tags.join(', ')}
Score: ${score}
Answers: ${answerCount}

Question:
${truncatedBody}

Extract the underlying technical problem or pain point.`;
}

/**
 * Generate prompt for GitHub Issues
 */
export function generateGitHubPrompt(
    title: string,
    body: string,
    labels: string[],
    reactions: number
): string {
    const maxBodyLength = 3000;
    const truncatedBody = body.length > maxBodyLength
        ? body.substring(0, maxBodyLength) + '...'
        : body;

    return `Source: GitHub Issues
Title: ${title}
Labels: ${labels.join(', ')}
Reactions: ${reactions}

Issue Description:
${truncatedBody}

Extract the feature request or problem being reported.`;
}
