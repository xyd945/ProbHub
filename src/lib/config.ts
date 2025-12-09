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

export const STACKEXCHANGE_API = {
    baseUrl: 'https://api.stackexchange.com',
    version: process.env.STACKEXCHANGE_API_VERSION || '2.3',
    apiKey: process.env.STACKEXCHANGE_API_KEY,

    // Configurable limits
    tier1Limit: parseInt(process.env.STACKEXCHANGE_TIER1_LIMIT || '20', 10),
    tier2Limit: parseInt(process.env.STACKEXCHANGE_TIER2_LIMIT || '10', 10),

    // Rate limiting (respects SE's limits)
    maxConcurrentRequests: 5,
    requestDelayMs: 100,

    // Site configuration
    sites: {
        tier1: [
            { slug: 'money', name: 'Personal Finance & Money' },
            { slug: 'workplace', name: 'Workplace' },
            { slug: 'interpersonal', name: 'Interpersonal Skills' },
            { slug: 'parenting', name: 'Parenting' },
            { slug: 'travel', name: 'Travel' },
            { slug: 'diy', name: 'Home Improvement' },
        ],
        tier2: [
            { slug: 'cooking', name: 'Cooking' },
            { slug: 'fitness', name: 'Fitness' },
            { slug: 'law', name: 'Law' },
            { slug: 'ux', name: 'UX' },
            { slug: 'bicycles', name: 'Bicycles' },
            { slug: 'academia', name: 'Academia' },
        ],
    },

    // Query parameters (extensible for future filtering)
    defaultParams: {
        sort: 'votes' as const,
        order: 'desc' as const,
        filter: 'withbody' as const, // Include question body
        // Future: fromdate, todate can be added here
    },
};
