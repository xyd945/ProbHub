"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <div className="relative">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg" />
                                <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 rounded-lg blur-md opacity-50" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                ProbHub
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6">
                            <Link
                                href="/problems"
                                className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/problems")
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                    }`}
                            >
                                Problems
                            </Link>
                            <Link
                                href="/sources"
                                className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/sources")
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                    }`}
                            >
                                Sources
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            GitHub
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
}
