import OpenAI from 'openai';
import { LLM_CONFIG } from '../config';

if (!process.env.LLM_API_KEY) {
    throw new Error('LLM_API_KEY environment variable is required');
}

if (!process.env.LLM_BASE_URL) {
    throw new Error('LLM_BASE_URL environment variable is required');
}

// Initialize OpenAI-compatible client
export const llmClient = new OpenAI({
    apiKey: process.env.LLM_API_KEY,
    baseURL: process.env.LLM_BASE_URL,
});

export const LLM_MODEL = process.env.LLM_MODEL || 'deepseek-chat';

/**
 * Call LLM with retry logic and error handling
 */
export async function callLLM(
    systemPrompt: string,
    userPrompt: string,
    options: {
        temperature?: number;
        maxTokens?: number;
        jsonMode?: boolean;
    } = {}
): Promise<string> {
    const {
        temperature = LLM_CONFIG.temperature,
        maxTokens = LLM_CONFIG.maxTokens,
        jsonMode = true,
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= LLM_CONFIG.maxRetries; attempt++) {
        try {
            const response = await llmClient.chat.completions.create({
                model: LLM_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                temperature,
                max_tokens: maxTokens,
                ...(jsonMode && { response_format: { type: 'json_object' } }),
            });

            const content = response.choices[0]?.message?.content;

            if (!content) {
                throw new Error('Empty response from LLM');
            }

            // Log token usage
            const usage = response.usage;
            if (usage) {
                console.log(`[LLM] Tokens: ${usage.total_tokens} (prompt: ${usage.prompt_tokens}, completion: ${usage.completion_tokens})`);
            }

            return content;
        } catch (error) {
            lastError = error as Error;
            console.error(`[LLM] Attempt ${attempt}/${LLM_CONFIG.maxRetries} failed:`, error);

            if (attempt < LLM_CONFIG.maxRetries) {
                // Exponential backoff
                const delay = LLM_CONFIG.retryDelay * Math.pow(2, attempt - 1);
                console.log(`[LLM] Retrying in ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    throw new Error(`LLM call failed after ${LLM_CONFIG.maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Parse and validate JSON response from LLM
 */
export function parseLLMJson<T>(content: string): T {
    try {
        return JSON.parse(content) as T;
    } catch (error) {
        throw new Error(`Failed to parse LLM JSON response: ${error}`);
    }
}
