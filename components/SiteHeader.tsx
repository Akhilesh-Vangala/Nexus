'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { shortlistCount } from '@/lib/shortlist';

interface SiteHeaderProps {
    showBack?: boolean;
    subtitle?: string;
    right?: React.ReactNode;
}

export default function SiteHeader({ showBack, subtitle, right }: SiteHeaderProps) {
    const router = useRouter();
    const [nShort, setNShort] = useState(0);

    useEffect(() => {
        const sync = () => setNShort(shortlistCount());
        sync();
        window.addEventListener('lablens-shortlist', sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener('lablens-shortlist', sync);
            window.removeEventListener('storage', sync);
        };
    }, []);

    return (
        <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-mesh-header backdrop-blur-xl supports-[backdrop-filter]:bg-bg-primary/75">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-amber/25 to-transparent" />
            <div className="relative mx-auto flex min-h-14 max-w-7xl items-center gap-3 px-4 py-3 sm:min-h-16 sm:gap-4 sm:px-6">
                {showBack && (
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="shrink-0 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 font-mono text-xs text-text-tertiary transition-all hover:border-white/12 hover:bg-white/[0.06] hover:text-text-primary"
                    >
                        ← Back
                    </button>
                )}
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <Link
                        href="/"
                        className="font-display text-xl font-semibold tracking-wide text-text-primary transition-colors hover:text-accent-amber sm:text-2xl"
                    >
                        LabLens
                    </Link>
                    {subtitle && (
                        <span className="hidden truncate font-mono text-[10px] uppercase tracking-[0.15em] text-text-tertiary sm:inline">
                            / {subtitle}
                        </span>
                    )}
                </div>

                <nav className="ml-1 hidden flex-wrap items-center gap-1 lg:flex">
                    <Link
                        href="/methodology"
                        className="rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-all hover:bg-white/[0.05] hover:text-accent-amber"
                    >
                        How it works
                    </Link>
                    <Link
                        href="/compare"
                        className="rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-all hover:bg-white/[0.05] hover:text-accent-teal"
                    >
                        Compare
                    </Link>
                    <Link
                        href="/phd-fit"
                        className="rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-all hover:bg-white/[0.05] hover:text-text-secondary"
                    >
                        PhD fit
                    </Link>
                    <Link
                        href="/shortlist"
                        className="rounded-full border border-transparent px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-all hover:border-accent-purple/20 hover:bg-accent-purple/5 hover:text-accent-purple"
                    >
                        Shortlist{nShort > 0 ? ` · ${nShort}` : ''}
                    </Link>
                    <Link
                        href="/professor-portal"
                        className="rounded-full border border-accent-teal/20 bg-accent-teal/5 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-accent-teal transition-all hover:border-accent-teal/35 hover:bg-accent-teal/10"
                    >
                        Portal
                    </Link>
                </nav>

                <div className="flex-1" />
                {right}
            </div>
        </header>
    );
}
