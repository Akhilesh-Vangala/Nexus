import Link from 'next/link';

export default function SiteFooter() {
    return (
        <footer className="border-t border-white/[0.06] bg-bg-secondary/30 py-10">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
                <p className="max-w-md font-body text-xs text-text-tertiary">
                    Semantic alignment from live faculty signals — Linkup retrieval, local embeddings, Claude synthesis.
                </p>
                <Link
                    href="/professor-portal"
                    className="font-mono text-xs text-accent-purple/90 transition-colors hover:text-accent-purple"
                >
                    Professor portal →
                </Link>
            </div>
        </footer>
    );
}
