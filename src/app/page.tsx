import ProblemsClient from './ProblemsClient';
import type { ProblemListResponse } from '@/types/api';

async function getProblems(): Promise<ProblemListResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/problems?page_size=50&sort=new`, {
        cache: 'no-store',
    });

    if (!res.ok) {
        console.error('Failed to fetch problems');
        return { items: [], total: 0, page: 1, page_size: 50 };
    }

    return res.json();
}

export default async function HomePage() {
    const data = await getProblems();

    return <ProblemsClient initialProblems={data.items} />;
}
