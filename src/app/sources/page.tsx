export default function SourcesPage() {
    const sources = [
        {
            name: "Hacker News",
            status: "Active",
            description:
                "Ask HN posts where people share problems and pain points in tech and startups",
            coverage: "~100 new problems/week",
            color: "border-orange-500/50",
        },
        {
            name: "StackExchange",
            status: "Coming Soon",
            description:
                "Developer questions highlighting pain points and missing tools",
            coverage: "Planned",
            color: "border-blue-500/50",
        },
        {
            name: "GitHub Issues",
            status: "Coming Soon",
            description: "Feature requests and bug reports from popular repositories",
            coverage: "Planned",
            color: "border-purple-500/50",
        },
    ];

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-2">
                    Data <span className="text-primary">Sources</span>
                </h1>
                <p className="text-muted-foreground mb-12">
                    We aggregate problems from multiple platforms to give you comprehensive coverage
                </p>

                <div className="grid gap-6">
                    {sources.map((source) => (
                        <div
                            key={source.name}
                            className={`p-6 rounded-lg border-2 ${source.color} bg-card`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h2 className="text-2xl font-bold">{source.name}</h2>
                                <span
                                    className={`px-3 py-1 text-xs font-semibold rounded-full ${source.status === "Active"
                                            ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                            : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                                        }`}
                                >
                                    {source.status}
                                </span>
                            </div>
                            <p className="text-muted-foreground mb-2">{source.description}</p>
                            <p className="text-sm text-primary font-medium">
                                Coverage: {source.coverage}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-6 rounded-lg bg-muted/50 border border-border">
                    <h3 className="font-semibold mb-2">Want to suggest a source?</h3>
                    <p className="text-sm text-muted-foreground">
                        We're always looking to expand our coverage. If you know of a platform with valuable problem discussions, let us know!
                    </p>
                </div>
            </div>
        </div>
    );
}
