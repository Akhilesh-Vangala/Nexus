'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProfessorCard from '@/components/ProfessorCard';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { apiUrl } from '@/lib/api';
import { mergeSearchResponses, annotateSchoolTags } from '@/lib/mergeSearch';
import {
    normalizeClientSearchParams,
    saveLastSearchResults,
    type ClientSearchParams,
} from '@/lib/searchSession';
import type { Professor, SearchResponse } from '@/lib/types';

const PIPELINE_STEPS = [
    { label: 'Extracting your research intent…', icon: '🧠' },
    { label: 'Live faculty search (Linkup)…', icon: '🔗' },
    { label: 'Verifying activity signals…', icon: '✓' },
    { label: 'Computing semantic alignment…', icon: '📐' },
    { label: 'Synthesizing cards & drafts…', icon: '💡' },
];

function snippet(text: string, max = 200) {
    const t = text?.trim() || '';
    if (t.length <= max) return t;
    return `${t.slice(0, max).trim()}…`;
}

function applyClientFilters(professors: Professor[], p: ClientSearchParams): Professor[] {
    return professors.filter((prof) => {
        if (p.min_alignment > 0 && (prof.alignment_score ?? 0) < p.min_alignment) return false;
        if (p.require_grant && (!prof.grants || prof.grants.length === 0)) return false;
        if (p.department_filter) {
            const d = (prof.department || '').toLowerCase();
            if (!d.includes(p.department_filter.toLowerCase())) return false;
        }
        return true;
    });
}

async function postSearch(body: Record<string, unknown>) {
    const response = await fetch(apiUrl('/api/search'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return (await response.json()) as SearchResponse;
}

export default function ResultsPage() {
    const router = useRouter();
    const [results, setResults] = useState<SearchResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [params, setParams] = useState<ClientSearchParams | null>(null);
    const [sortBy, setSortBy] = useState<'score' | 'timing'>('score');

    useEffect(() => {
        const stored = sessionStorage.getItem('searchParams');
        if (!stored) {
            router.push('/');
            return;
        }

        const raw = JSON.parse(stored) as Record<string, unknown>;
        const normalized = normalizeClientSearchParams(raw);
        setParams(normalized);
        sessionStorage.setItem(
            'searchContext',
            JSON.stringify({
                student_interest: normalized.student_interest,
                student_background: normalized.student_background,
                student_level: normalized.student_level,
                school_scope: normalized.school_scope,
            })
        );

        const stepTimer = setInterval(() => {
            setCurrentStep((prev) => Math.min(prev + 1, PIPELINE_STEPS.length - 1));
        }, 4500);

        runSearch(normalized).finally(() => {
            clearInterval(stepTimer);
            setCurrentStep(PIPELINE_STEPS.length - 1);
        });

        return () => clearInterval(stepTimer);
    }, [router]);

    const runSearch = async (p: ClientSearchParams) => {
        try {
            const base = {
                student_interest: p.student_interest,
                student_level: p.student_level,
                student_background: p.student_background,
                top_k: 6,
            };

            let data: SearchResponse;

            if (p.school_scope === 'both') {
                const [cu, nyu] = await Promise.all([
                    postSearch({ ...base, university: 'Columbia University' }),
                    postSearch({ ...base, university: 'NYU' }),
                ]);
                data = mergeSearchResponses(cu, nyu, 'Columbia University', 'NYU');
            } else {
                const uni =
                    p.school_scope === 'nyu' ? 'NYU' : 'Columbia University';
                data = await postSearch({ ...base, university: uni });
                data = {
                    ...data,
                    professors: annotateSchoolTags(data.professors || [], uni),
                };
            }

            setResults(data);
            saveLastSearchResults(data.professors || []);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Request failed');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProfessors = useMemo(() => {
        if (!results?.professors || !params) return [];
        return applyClientFilters(results.professors, params);
    }, [results, params]);

    const sortedProfessors = useMemo(() => {
        const list = [...filteredProfessors];
        if (sortBy === 'timing') {
            return list.sort((a, b) => (b.timing?.timing_score ?? 0) - (a.timing?.timing_score ?? 0));
        }
        return list.sort((a, b) => (b.alignment_score ?? 0) - (a.alignment_score ?? 0));
    }, [filteredProfessors, sortBy]);

    const intent = results?.intent;

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col bg-bg-primary">
                <SiteHeader subtitle="Searching" />
                <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-12">
                    <div className="w-full max-w-lg">
                        <h2 className="mb-2 text-center font-display text-2xl text-text-primary">
                            Running your search
                        </h2>
                        <p className="mb-10 text-center font-mono text-xs text-text-tertiary">
                            First run may load the embedding model — thanks for waiting.
                        </p>
                        <div className="space-y-2">
                            {PIPELINE_STEPS.map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{
                                        opacity: i <= currentStep ? 1 : 0.35,
                                        x: 0,
                                    }}
                                    className={`flex items-center gap-3 rounded-xl border p-3 ${
                                        i === currentStep
                                            ? 'border-accent-amber/25 bg-bg-tertiary/80'
                                            : i < currentStep
                                              ? 'border-transparent bg-bg-secondary/40'
                                              : 'border-transparent'
                                    }`}
                                >
                                    <span className="text-lg" aria-hidden>
                                        {step.icon}
                                    </span>
                                    <span
                                        className={`font-mono text-xs ${
                                            i === currentStep
                                                ? 'text-accent-amber step-pulse'
                                                : i < currentStep
                                                  ? 'text-accent-teal'
                                                  : 'text-text-tertiary'
                                        }`}
                                    >
                                        {i < currentStep ? '✓ ' : i === currentStep ? '⟳ ' : ''}
                                        {step.label}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                        <div className="mt-10 grid grid-cols-1 gap-4">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="glass-card p-6">
                                    <div className="skeleton mb-3 h-4 w-24" />
                                    <div className="skeleton mb-2 h-6 w-2/3" />
                                    <div className="skeleton mb-4 h-3 w-full" />
                                    <div className="skeleton h-2 w-3/4" />
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col bg-bg-primary">
                <SiteHeader />
                <main id="main-content" className="flex flex-1 items-center justify-center px-4">
                    <div className="glass-card max-w-md p-10 text-center">
                        <h2 className="mb-2 font-display text-xl text-accent-coral">Search failed</h2>
                        <p className="mb-2 font-mono text-xs text-text-tertiary">
                            Start the API:{' '}
                            <code className="text-text-secondary">cd api && uvicorn main:app --port 8000</code>
                        </p>
                        <p className="mb-8 font-body text-sm text-text-secondary">{error}</p>
                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            className="rounded-xl bg-accent-amber/20 px-6 py-2.5 font-mono text-sm text-accent-amber hover:bg-accent-amber/30"
                        >
                            ← Back to search
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const meta = results?.pipeline_metadata;
    const schoolLabel =
        params?.school_scope === 'both'
            ? 'Columbia & NYU'
            : params?.school_scope === 'nyu'
              ? 'NYU'
              : 'Columbia';

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg-primary">
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute -right-[20%] top-0 h-[420px] w-[420px] rounded-full bg-accent-purple/[0.06] blur-[100px]" />
                <div className="absolute -left-[15%] bottom-0 h-[380px] w-[380px] rounded-full bg-accent-teal/[0.05] blur-[90px]" />
                <div className="noise-overlay opacity-[0.12]" aria-hidden />
            </div>
            <SiteHeader
                subtitle="Results"
                right={
                    <span className="hidden text-right font-mono text-[10px] text-text-tertiary lg:block">
                        <span className="text-accent-teal">{results?.total_verified ?? 0}</span> pipeline verified ·{' '}
                        <span className="text-text-secondary">{sortedProfessors.length}</span> shown
                        {params && (params.require_grant || params.min_alignment > 0 || params.department_filter) && (
                            <span className="block text-accent-amber">Filters applied</span>
                        )}
                    </span>
                }
            />

            <main id="main-content" className="relative z-10 flex-1">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.1fr)]">
                        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                            <div>
                                <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-accent-teal">
                                    Your search
                                </p>
                                <span className="mb-2 inline-block rounded-full border border-white/10 bg-bg-secondary/80 px-3 py-1 font-mono text-[11px] text-text-secondary">
                                    {schoolLabel}
                                </span>
                                <blockquote className="mt-3 border-l-2 border-accent-amber/35 pl-4 font-body text-sm italic leading-relaxed text-text-secondary">
                                    &ldquo;{snippet(params?.student_interest || '', 240)}&rdquo;
                                </blockquote>
                            </div>

                            {intent?.primary_domain && (
                                <div className="glass-card p-5">
                                    <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                                        Extracted domain
                                    </p>
                                    <p className="font-display text-lg text-text-primary">{intent.primary_domain}</p>
                                    {intent.specific_topics && intent.specific_topics.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {intent.specific_topics.slice(0, 8).map((t) => (
                                                <span
                                                    key={t}
                                                    className="rounded-md border border-accent-purple/20 bg-accent-purple/5 px-2 py-1 font-mono text-[10px] text-accent-purple/90"
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {meta && (
                                <div className="rounded-2xl border border-white/[0.06] bg-bg-secondary/40 p-5">
                                    <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                                        Pipeline
                                    </p>
                                    <ul className="space-y-2 font-mono text-[11px] text-text-secondary">
                                        <li className="flex justify-between gap-4">
                                            <span className="text-text-tertiary">Raw found</span>
                                            <span>{meta.professors_found}</span>
                                        </li>
                                        <li className="flex justify-between gap-4">
                                            <span className="text-text-tertiary">Verified</span>
                                            <span>{meta.professors_verified}</span>
                                        </li>
                                        <li className="flex justify-between gap-4">
                                            <span className="text-text-tertiary">Scored</span>
                                            <span>{meta.embeddings_computed}</span>
                                        </li>
                                    </ul>
                                </div>
                            )}

                            <div className="rounded-xl border border-white/[0.06] bg-bg-tertiary/30 p-4 font-mono text-[10px] text-text-tertiary">
                                <p className="mb-1 text-text-secondary">Data sources</p>
                                <p>Linkup · arXiv · NSF Awards · local embeddings · Claude</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => router.push('/')}
                                className="w-full rounded-xl border border-white/10 py-3 font-mono text-xs text-text-secondary transition-colors hover:border-accent-amber/30 hover:text-accent-amber"
                            >
                                ← New search
                            </button>
                        </aside>

                        <div>
                            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h1 className="font-display text-2xl text-text-primary sm:text-3xl">
                                        Matched professors
                                    </h1>
                                    <p className="mt-1 font-mono text-xs text-text-tertiary">
                                        Sort: {sortBy === 'score' ? 'alignment score' : 'timing score'} · Star cards to
                                        save to{' '}
                                        <button
                                            type="button"
                                            onClick={() => router.push('/shortlist')}
                                            className="text-accent-purple hover:underline"
                                        >
                                            shortlist
                                        </button>
                                    </p>
                                </div>
                                <div
                                    className="flex gap-1 rounded-xl border border-white/[0.08] bg-bg-secondary/80 p-1"
                                    role="group"
                                    aria-label="Sort results"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setSortBy('score')}
                                        className={`rounded-lg px-4 py-2 font-mono text-xs transition-all ${
                                            sortBy === 'score'
                                                ? 'bg-accent-amber/20 text-accent-amber'
                                                : 'text-text-tertiary hover:text-text-secondary'
                                        }`}
                                    >
                                        Best match
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSortBy('timing')}
                                        className={`rounded-lg px-4 py-2 font-mono text-xs transition-all ${
                                            sortBy === 'timing'
                                                ? 'bg-accent-teal/20 text-accent-teal'
                                                : 'text-text-tertiary hover:text-text-secondary'
                                        }`}
                                    >
                                        Best timing
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                {sortedProfessors.map((prof, i) => (
                                    <motion.div
                                        key={prof.id || `${prof.name}-${i}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(i * 0.08, 0.55), duration: 0.45 }}
                                    >
                                        <ProfessorCard
                                            professor={prof}
                                            rank={i + 1}
                                            onClick={() => {
                                                sessionStorage.setItem('selectedProfessor', JSON.stringify(prof));
                                                sessionStorage.setItem('searchContext', JSON.stringify(params));
                                                router.push(`/professor/${prof.id || i}`);
                                            }}
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            {sortedProfessors.length === 0 && (results?.professors?.length ?? 0) > 0 && (
                                <div className="rounded-2xl border border-dashed border-accent-amber/30 py-16 text-center">
                                    <p className="font-display text-lg text-text-secondary">No professors match your filters</p>
                                    <p className="mx-auto mt-2 max-w-md font-body text-sm text-text-tertiary">
                                        Go back and loosen department text, uncheck grant-only, or lower the minimum score.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => router.push('/')}
                                        className="mt-8 rounded-xl bg-accent-amber/20 px-6 py-2.5 font-mono text-sm text-accent-amber"
                                    >
                                        Edit search
                                    </button>
                                </div>
                            )}

                            {sortedProfessors.length === 0 && (results?.professors?.length ?? 0) === 0 && (
                                <div className="rounded-2xl border border-dashed border-white/10 py-24 text-center">
                                    <p className="font-display text-lg text-text-secondary">No professors returned</p>
                                    <p className="mx-auto mt-2 max-w-md font-body text-sm text-text-tertiary">
                                        {results?.message ||
                                            'Broaden your prompt or check Linkup / Anthropic keys on the API.'}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => router.push('/')}
                                        className="mt-8 rounded-xl bg-accent-amber/20 px-6 py-2.5 font-mono text-sm text-accent-amber"
                                    >
                                        Edit search
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
