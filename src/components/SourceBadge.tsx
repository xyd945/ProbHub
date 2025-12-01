import Link from "next/link";

interface SourceBadgeProps {
    source: string;
    size?: "sm" | "md";
}

const sourceConfig: Record<string, { label: string; color: string }> = {
    hackernews: {
        label: "Hacker News",
        color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
    },
    stackexchange: {
        label: "StackExchange",
        color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    },
    github: {
        label: "GitHub",
        color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    },
    reddit: {
        label: "Reddit",
        color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    },
};

export default function SourceBadge({ source, size = "sm" }: SourceBadgeProps) {
    const config = sourceConfig[source] || {
        label: source,
        color: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
    };

    const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

    return (
        <span
            className={`inline-flex items-center rounded-md font-medium border ${config.color} ${sizeClass}`}
        >
            {config.label}
        </span>
    );
}
