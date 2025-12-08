export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <a href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary-foreground">
                            P
                        </span>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        ProbHub
                    </span>
                </a>

                {/* Navigation */}
                <nav className="flex items-center gap-6">
                    <a
                        href="/"
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                        Problems
                    </a>
                    <a
                        href="/sources"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Sources
                    </a>
                </nav>
            </div>
        </header>
    );
}
