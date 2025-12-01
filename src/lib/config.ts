export const APP_NAME = 'ProbHub';
export const APP_DESCRIPTION = 'Discover problems people are discussing on the internet';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const SCORING_WEIGHTS = {
    upvotesMultiplier: 0.5,
    commentsMultiplier: 0.3,
    ageDecayPerDay: 0.05,
};

export const LLM_CONFIG = {
    maxTokens: 2000,
    temperature: 0.3,
    maxRetries: 3,
    retryDelay: 1000, // ms
};

export const RATE_LIMIT = {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
};

export const HN_API = {
    baseUrl: 'https://hacker-news.firebaseio.com/v0',
    endpoints: {
        askStories: '/askstories.json',
        item: (id: number) => `/item/${id}.json`,
    },
    maxConcurrentRequests: 5,
    rateLimit: 50, // calls per minute
};
