import 'dotenv/config';
import { db } from './index';
import { sources } from './schema';

export async function seedDatabase() {
    console.log('🌱 Seeding database...');

    // Seed sources
    const initialSources = [
        {
            name: 'hackernews',
            displayName: 'Hacker News',
            type: 'forum' as const,
            status: 'active' as const,
            metadata: {
                apiBaseUrl: 'https://hacker-news.firebaseio.com/v0',
                description: 'Ask HN posts where people share problems and pain points',
            },
        },
        {
            name: 'stackexchange',
            displayName: 'StackExchange',
            type: 'qa' as const,
            status: 'active' as const,
            metadata: {
                apiBaseUrl: 'https://api.stackexchange.com/2.3',
                description: 'Real-world problems from 12 StackExchange sites covering personal finance, workplace, parenting, travel, and more',
            },
        },
        {
            name: 'github',
            displayName: 'GitHub Issues',
            type: 'code_repo' as const,
            status: 'paused' as const,
            metadata: {
                apiBaseUrl: 'https://api.github.com',
                description: 'Feature requests and bug reports from popular repositories',
            },
        },
    ];

    for (const source of initialSources) {
        await db
            .insert(sources)
            .values(source)
            .onConflictDoUpdate({
                target: sources.name,
                set: {
                    displayName: source.displayName,
                    type: source.type,
                    status: source.status,
                    metadata: source.metadata,
                    updatedAt: new Date(),
                },
            });
    }

    console.log('✅ Database seeded successfully!');
}

// Run if called directly
if (require.main === module) {
    seedDatabase()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('❌ Seeding failed:', error);
            process.exit(1);
        });
}
