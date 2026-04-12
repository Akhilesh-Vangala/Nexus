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
        <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-bg-primary/85 backdrop-blur-md supports-[backdrop-filter]:bg-bg-primary/70">
            <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6">
                {showBack && (
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="shrink-0 rounded-lg px-2 py-1.5 font-mono text-xs text-text-tertiary outline-none ring-accent-amber/40 transition-colors hover:bg-white/[0.04] hover:text-text-primary focus-visible:ring-2"
                    >
                        ← Back
                    </button>
                )}
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <Link
                        href="/"
                        className="font-display text-lg font-semibold tracking-tight text-text-primary transition-colors hover:text-accent-amber sm:text-xl"
                    >
                        LabLens
                    </Link>
                    {subtitle && (
                        <span className="hidden truncate font-mono text-[10px] uppercase tracking-wider text-text-tertiary sm:inline">
                            / {subtitle}
                        </span>
                    )}
                </div>

                <nav className="ml-2 hidden items-center gap-4 sm:flex">
                    <Link
                        href="/methodology"
                        className="font-mono text-[11px] text-text-tertiary transition-colors hover:text-accent-amber"
                    >
                        How it works
                    </Link>
                    <Link
                        href="/shortlist"
                        className="font-mono text-[11px] text-text-tertiary transition-colors hover:text-accent-purple"
                    >
                        Shortlist{nShort > 0 ? ` (${nShort})` : ''}
                    </Link>
                </nav>

                <div className="flex-1" />
                {right}
            </div>
        </header>
    );
}
