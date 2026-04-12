'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { shortlistCount } from '@/lib/shortlist';
import { useTheme } from '@/lib/theme';

interface SiteHeaderProps {
    showBack?: boolean;
    subtitle?: string;
    right?: React.ReactNode;
}

export default function SiteHeader({ showBack, subtitle, right }: SiteHeaderProps) {
    const router = useRouter();
    const [nShort, setNShort] = useState(0);
    const { theme, toggle } = useTheme();

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
                        Nexus
                    </Link>
                    {subtitle && (
                        <span className="hidden truncate font-mono text-[10px] uppercase tracking-[0.15em] text-text-tertiary sm:inline">
                            / {subtitle}
                        </span>
                    )}
                </div>

                <nav className="ml-1 hidden flex-wrap items-center gap-1 lg:flex">
                    <Link
                        href="/"
                        className="rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-all hover:bg-white/[0.05] hover:text-accent-amber"
                    >
                        Home
                    </Link>
                    <Link
                        href="/methodology"
                        className="rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-all hover:bg-white/[0.05] hover:text-accent-amber dark:hover:bg-white/[0.05]"
                    >
                        How it works
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

                <button
                    type="button"
                    onClick={toggle}
                    aria-label="Toggle light/dark mode"
                    className="rounded-full border border-white/[0.08] bg-white/[0.04] p-2 text-text-tertiary transition-all hover:border-accent-amber/30 hover:bg-white/[0.08] hover:text-accent-amber"
                >
                    {theme === 'dark' ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>
                {right}
            </div>
        </header>
    );
}
