export default function ProblemsPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-2">
                    Discover <span className="text-primary">Problems</span>
                </h1>
                <p className="text-muted-foreground mb-8">
                    Real problems people are discussing across the internet
                </p>

                {/* Placeholder for filters and problem list */}
                <div className="text-center py-20 text-muted-foreground">
                    <p className="text-lg mb-4">🔍 Problems will appear here</p>
                    <p className="text-sm">
                        Once you set up Supabase and run ingestion, problems from Hacker
                        News will be displayed
                    </p>
                </div>
            </div>
        </div>
    );
}
