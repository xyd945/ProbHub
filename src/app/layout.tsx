import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "ProbHub - Discover Problems Worth Solving",
    description: "Aggregating real problems from Hacker News, StackExchange, GitHub and more. Find opportunities to build solutions people actually need.",
    keywords: ["problems", "startups", "ideas", "hacker news", "entrepreneurship"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} font-sans antialiased`}>
                <div className="min-h-screen flex flex-col">
                    <Header />
                    <main className="flex-1">{children}</main>
                    <footer className="border-t border-border py-8 mt-20">
                        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                            <p>
                                © {new Date().getFullYear()} ProbHub. Discovering problems
                                worth solving.
                            </p>
                        </div>
                    </footer>
                </div>
            </body>
        </html>
    );
}
