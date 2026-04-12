'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { getShortlist, removeShortlist, type ShortlistEntry } from '@/lib/shortlist';

export default function ShortlistPage() {
    const router = useRouter();
    const [items, setItems] = useState<ShortlistEntry[]>([]);

    const refresh = () => setItems(getShortlist());

    useEffect(() => {
        refresh();
        const fn = () => refresh();
        window.addEventListener('lablens-shortlist', fn);
        return () => window.removeEventListener('lablens-shortlist', fn);
    }, []);

    const openProfile = (e: ShortlistEntry) => {
        sessionStorage.setItem(
            'selectedProfessor',
            JSON.stringify({
                id: e.id,
                name: e.name,
                university: e.university,
                department: e.department || 'Computer Science',
                alignment_score: e.alignment_score,
            })
        );
        router.push(`/professor/${e.id}`);
    };

    return (
        <div className="flex min-h-screen flex-col bg-bg-primary">
            <SiteHeader subtitle="Shortlist" />

            <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
                <h1 className="mb-2 font-display text-3xl text-text-primary">Saved professors</h1>
                <p className="mb-8 font-body text-sm text-text-tertiary">
                    Stored only in this browser. Open a row to load the profile (full detail still comes from your last
                    search when available).
                </p>

                {items.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
                        <p className="text-text-secondary">No stars yet.</p>
                        <p className="mt-2 text-sm text-text-tertiary">
                            From results, click the star on a card to save someone here.
                        </p>
                        <Link
                            href="/"
                            className="mt-8 inline-block rounded-xl bg-accent-amber/20 px-6 py-2.5 font-mono text-sm text-accent-amber"
                        >
                            Go search
                        </Link>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {items.map((e) => (
                            <li
                                key={e.id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-bg-secondary/40 px-4 py-3"
                            >
                                <div>
                                    <p className="font-display text-text-primary">Prof. {e.name}</p>
                                    <p className="font-mono text-[11px] text-text-tertiary">
                                        {e.university}
                                        {e.alignment_score != null && (
                                            <span className="text-accent-teal"> · {Math.round(e.alignment_score)} match</span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openProfile(e)}
                                        className="rounded-lg bg-accent-teal/15 px-3 py-1.5 font-mono text-xs text-accent-teal hover:bg-accent-teal/25"
                                    >
                                        Open
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            removeShortlist(e.id);
                                            refresh();
                                        }}
                                        className="rounded-lg px-3 py-1.5 font-mono text-xs text-text-tertiary hover:bg-white/5 hover:text-accent-coral"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </main>

            <SiteFooter />
        </div>
    );
}
