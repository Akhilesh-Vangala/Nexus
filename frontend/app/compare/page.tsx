'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageBackdrop from '@/components/PageBackdrop';
import { getShortlist, type ShortlistEntry } from '@/lib/shortlist';
import { loadLastSearchResults } from '@/lib/searchSession';
import type { Professor } from '@/lib/types';

function Row({ label, a, b }: { label: string; a: string; b: string }) {
    return (
        <div className="grid grid-cols-1 gap-3 border-b border-white/[0.06] py-4 sm:grid-cols-[minmax(0,0.9fr)_1fr_1fr] sm:gap-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">{label}</div>
            <p className="font-body text-sm leading-relaxed text-text-secondary">{a}</p>
            <p className="font-body text-sm leading-relaxed text-text-secondary">{b}</p>
        </div>
    );
}

export default function ComparePage() {
    const [shortlist, setShortlist] = useState<ShortlistEntry[]>([]);

    useEffect(() => {
        const sync = () => setShortlist(getShortlist());
        sync();
        window.addEventListener('nexus-shortlist', sync);
        return () => window.removeEventListener('nexus-shortlist', sync);
    }, []);

    const pair = useMemo(() => {
        const last = loadLastSearchResults();
        const byId = new Map(last.map((p) => [p.id, p]));
        const resolved: Professor[] = [];
        for (const e of shortlist) {
            const p = byId.get(e.id);
            if (p) resolved.push(p);
            if (resolved.length >= 2) break;
        }
        return resolved.length >= 2 ? ([resolved[0], resolved[1]] as [Professor, Professor]) : null;
    }, [shortlist]);

    const sparsePair =
        shortlist.length >= 2 ? ([shortlist[0], shortlist[1]] as [ShortlistEntry, ShortlistEntry]) : null;

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg-primary">
            <PageBackdrop />
            <SiteHeader subtitle="Compare" />

            <main id="main-content" className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
                <h1 className="mb-2 font-display text-4xl font-semibold text-text-primary">
                    <span className="text-gradient-gold">Compare</span>
                </h1>
                <p className="mb-10 max-w-2xl font-body text-sm leading-relaxed text-text-secondary">
                    UI preview: side-by-side view for your top two starred professors. Full scoring still comes from your
                    last search session — run a search (or demo) and star two people to populate this screen.
                </p>

                {pair ? (
                    <div className="glass-card rounded-3xl border border-white/[0.08] p-6 sm:p-8">
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {[pair[0], pair[1]].map((p) => (
                                <div
                                    key={p.id}
                                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                                >
                                    <p className="font-display text-lg text-text-primary">{p.name}</p>
                                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-accent-teal">
                                        {p.alignment_score}% alignment
                                    </p>
                                    <p className="mt-2 text-xs text-text-tertiary">
                                        {p.department} · {p.university}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <Row
                            label="Focus"
                            a={pair[0].current_focus}
                            b={pair[1].current_focus}
                        />
                        <Row
                            label="Why you match"
                            a={pair[0].why_aligned}
                            b={pair[1].why_aligned}
                        />
                        <Row
                            label="Grants"
                            a={
                                pair[0].grants?.length
                                    ? pair[0].grants.map((g) => g.title).join(' · ')
                                    : 'None in last payload'
                            }
                            b={
                                pair[1].grants?.length
                                    ? pair[1].grants.map((g) => g.title).join(' · ')
                                    : 'None in last payload'
                            }
                        />
                        <Row
                            label="Timing"
                            a={pair[0].timing?.primary_reason ?? '—'}
                            b={pair[1].timing?.primary_reason ?? '—'}
                        />
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href={`/professor/${pair[0].id}`}
                                className="rounded-full border border-accent-amber/30 bg-accent-amber/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-accent-amber transition-colors hover:bg-accent-amber/15"
                            >
                                Open {pair[0].name.split(' ')[0]} →
                            </Link>
                            <Link
                                href={`/professor/${pair[1].id}`}
                                className="rounded-full border border-accent-teal/30 bg-accent-teal/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-accent-teal transition-colors hover:bg-accent-teal/15"
                            >
                                Open {pair[1].name.split(' ')[0]} →
                            </Link>
                        </div>
                    </div>
                ) : sparsePair ? (
                    <div className="rounded-2xl border border-dashed border-accent-purple/30 bg-accent-purple/5 px-6 py-10 text-center">
                        <p className="font-body text-sm text-text-secondary">
                            <strong className="text-text-primary">{sparsePair[0].name}</strong> and{' '}
                            <strong className="text-text-primary">{sparsePair[1].name}</strong> are on your shortlist, but
                            we need full professor objects from a results run.
                        </p>
                        <p className="mt-3 text-xs text-text-tertiary">
                            Go to results (search or demo), then return here — we match shortlist IDs to your last ranked
                            list.
                        </p>
                        <Link
                            href="/"
                            className="mt-6 inline-block rounded-full border border-white/[0.1] px-5 py-2 font-mono text-[10px] uppercase tracking-wider text-text-primary transition-colors hover:border-accent-purple/40"
                        >
                            Home →
                        </Link>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
                        <p className="text-text-secondary">Star at least two professors from results.</p>
                        <p className="mt-2 text-sm text-text-tertiary">
                            Open <Link href="/shortlist" className="text-accent-purple underline-offset-2 hover:underline">Shortlist</Link> to manage picks.
                        </p>
                        <Link
                            href="/"
                            className="mt-8 inline-block rounded-full bg-gradient-to-r from-accent-purple/80 to-accent-teal/70 px-6 py-2.5 font-mono text-[10px] uppercase tracking-wider text-white shadow-lg shadow-accent-purple/20"
                        >
                            Start from home
                        </Link>
                    </div>
                )}
            </main>
            <SiteFooter />
        </div>
    );
}
