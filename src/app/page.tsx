import Link from "next/link";

export default function HomePage() {
    return (
        <div className="container mx-auto px-4 py-12">
            {/* Hero Section */}
            <section className="max-w-4xl mx-auto text-center py-20 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Discovering problems worth solving
                </div>

                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                    Find Real Problems
                    <br />
                    <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        People Actually Have
                    </span>
                </h1>

                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                    We aggregate problems and complaints from across the internet—Hacker
                    News, StackExchange, GitHub, and more—so you can find opportunities
                    to build solutions people need.
                </p>

                <div className="flex gap-4 justify-center">
                    <Link
                        href="/problems"
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-primary/25"
                    >
                        Explore Problems
                    </Link>
                    <Link
                        href="/sources"
                        className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-colors"
                    >
                        View Sources
                    </Link>
                </div>
            </section>

            {/* Stats Section */}
            <section className="max-w-5xl mx-auto py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-8 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                    <div className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
                        1,000+
                    </div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wide">
                        Problems Discovered
                    </div>
                </div>
                <div className="text-center p-8 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                    <div className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
                        5+
                    </div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wide">
                        Data Sources
                    </div>
                </div>
                <div className="text-center p-8 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                    <div className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
                        Daily
                    </div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wide">
                        Updates
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="max-w-4xl mx-auto py-16">
                <h2 className="text-3xl font-bold text-center mb-12">
                    How It <span className="text-primary">Works</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto mb-4">
                            1
                        </div>
                        <h3 className="font-semibold mb-2">Aggregate</h3>
                        <p className="text-sm text-muted-foreground">
                            We continuously scan Hacker News, GitHub, StackExchange and other
                            platforms for problem discussions
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto mb-4">
                            2
                        </div>
                        <h3 className="font-semibold mb-2">Normalize</h3>
                        <p className="text-sm text-muted-foreground">
                            AI extracts and structures problem statements, removing noise and
                            highlighting pain points
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto mb-4">
                            3
                        </div>
                        <h3 className="font-semibold mb-2">Discover</h3>
                        <p className="text-sm text-muted-foreground">
                            Search, filter, and explore problems by domain, source, or recency
                            to find opportunities
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
