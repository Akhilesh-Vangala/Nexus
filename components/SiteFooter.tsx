import Link from 'next/link';

export default function SiteFooter() {
    return (
        <footer className="relative border-t border-white/[0.07] bg-gradient-to-t from-bg-secondary/80 to-bg-primary py-12">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="mx-auto flex max-w-7xl flex-col flex-wrap items-center justify-center gap-6 px-4 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
                <div>
                    <p className="font-display text-lg text-text-primary/90">LabLens</p>
                    <p className="mt-2 max-w-md font-body text-xs leading-relaxed text-text-tertiary">
                        Live faculty intelligence — Linkup retrieval, verified signals, dense embeddings, grounded
                        synthesis.
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-wider">
                    <Link href="/methodology" className="text-text-tertiary transition-colors hover:text-accent-amber">
                        Methodology
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
