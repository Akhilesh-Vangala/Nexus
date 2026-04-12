import Link from 'next/link';

export default function SiteFooter() {
    return (
        <footer className="border-t border-white/[0.06] bg-bg-secondary/30 py-10">
            <div className="mx-auto flex max-w-7xl flex-col flex-wrap items-center justify-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
                <p className="max-w-md font-body text-xs text-text-tertiary">
                    Semantic alignment from live faculty signals — Linkup retrieval, local embeddings, Claude synthesis.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs">
                    <Link href="/methodology" className="text-text-tertiary transition-colors hover:text-accent-amber">
                        How it works
                    </Link>
                    <Link href="/shortlist" className="text-text-tertiary transition-colors hover:text-accent-purple">
                        Shortlist
                    </Link>
                    <Link
                        href="/professor-portal"
                        className="text-accent-purple/90 transition-colors hover:text-accent-purple"
                    >
                        Professor portal →
                    </Link>
                </div>
            </div>
        </footer>
    );
}
