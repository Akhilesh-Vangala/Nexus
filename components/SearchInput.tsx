'use client';

import { useState, useEffect, useRef } from 'react';
import type { SchoolScope } from '@/lib/searchSession';

const PLACEHOLDERS = [
    "I'm fascinated by how language models fail at causal reasoning...",
    "I want to work on computer vision for robotic manipulation...",
    "I'm interested in fairness and bias in machine learning systems...",
    "I want to research protein structure prediction using deep learning...",
    "I'm curious about reinforcement learning for real-world decision making...",
];

const LEVELS = [
    { value: 'undergrad', label: 'Undergrad' },
    { value: 'masters', label: "Master's" },
    { value: 'phd_applicant', label: 'PhD Applicant' },
];

const TEMPLATES = [
    { label: 'Causal ML', text: 'I want to work on causal inference and machine learning, including identifiability and applications to decision systems.' },
    { label: 'NLP', text: 'I am interested in natural language processing: efficient LLMs, evaluation, and grounding language in real tasks.' },
    { label: 'Vision + robotics', text: 'I want to research perception and control for robotic manipulation in unstructured environments.' },
    { label: 'HCI × AI', text: 'I care about human-computer interaction and how people collaborate with AI systems in high-stakes settings.' },
];

export type SearchFormPayload = {
    student_interest: string;
    school_scope: SchoolScope;
    student_level: string;
    student_background: string;
    department_filter: string;
    require_grant: boolean;
    min_alignment: number;
};

interface SearchInputProps {
    onSearch: (payload: SearchFormPayload) => void;
    /** UI-only: jump to results with demo fixtures (no API). */
    onDemoPreview?: () => void;
    isLoading?: boolean;
}

export default function SearchInput({ onSearch, onDemoPreview, isLoading = false }: SearchInputProps) {
    const [query, setQuery] = useState('');
    const [schoolScope, setSchoolScope] = useState<SchoolScope>('columbia');
    const [level, setLevel] = useState('masters');
    const [background, setBackground] = useState('');
    const [showBackground, setShowBackground] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [requireGrant, setRequireGrant] = useState(false);
    const [minAlignment, setMinAlignment] = useState(0);
    const [placeholderIdx, setPlaceholderIdx] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
        }, 3500);
        return () => clearInterval(timer);
    }, []);

    const handleSubmit = () => {
        if (!query.trim() || isLoading) return;
        onSearch({
            student_interest: query.trim(),
            school_scope: schoolScope,
            student_level: level,
            student_background: background,
            department_filter: departmentFilter.trim(),
            require_grant: requireGrant,
            min_alignment: minAlignment,
        });
    };

    return (
        <div className="mx-auto w-full max-w-2xl">
            <p className="mb-2 px-1 font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
                Quick starters
            </p>
            <div className="mb-5 flex flex-wrap justify-center gap-2 sm:justify-start">
                {TEMPLATES.map((t) => (
                    <button
                        type="button"
                        key={t.label}
                        onClick={() => setQuery(t.text)}
                        className="rounded-full border border-white/[0.1] bg-gradient-to-br from-white/[0.06] to-transparent px-4 py-2 font-mono text-[11px] text-text-secondary shadow-sm transition-all hover:border-accent-amber/35 hover:text-accent-amber hover:shadow-[0_0_20px_-4px_rgba(232,163,23,0.35)]"
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <label htmlFor="lablens-interest" className="sr-only">
                Describe your research interests
            </label>
            <div className="gradient-frame mb-5 shadow-[0_0_80px_-30px_rgba(232,163,23,0.2)] transition-shadow focus-within:shadow-[0_0_60px_-20px_rgba(45,212,191,0.25)]">
                <div className="gradient-frame-inner">
                    <textarea
                    id="lablens-interest"
                    ref={textareaRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={PLACEHOLDERS[placeholderIdx]}
                    className="min-h-[140px] w-full resize-none bg-transparent p-5 font-body text-base leading-relaxed text-text-primary placeholder:text-text-tertiary/80 focus:outline-none"
                    rows={4}
                    autoComplete="off"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                />
                </div>
            </div>

            <div className="mb-5">
                <span className="mb-2 block px-1 font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
                    School
                </span>
                <div
                    className="flex flex-wrap gap-1 rounded-2xl border border-white/[0.09] bg-bg-secondary/80 p-1.5 shadow-inner backdrop-blur-sm"
                    role="group"
                    aria-label="Target school"
                >
                    {(
                        [
                            { id: 'columbia' as const, label: 'Columbia' },
                            { id: 'nyu' as const, label: 'NYU' },
                            { id: 'both' as const, label: 'Both' },
                        ] as const
                    ).map((opt) => (
                        <button
                            type="button"
                            key={opt.id}
                            onClick={() => setSchoolScope(opt.id)}
                            className={`flex-1 rounded-xl px-3 py-2.5 font-mono text-xs transition-all sm:flex-none sm:px-6 ${
                                schoolScope === opt.id
                                    ? 'bg-gradient-to-br from-accent-teal/25 to-accent-teal/10 text-accent-teal shadow-glow-teal'
                                    : 'text-text-tertiary hover:bg-white/[0.04] hover:text-text-secondary'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                <p className="mt-2 px-1 font-body text-[11px] text-text-tertiary">
                    Both runs two live searches and merges matches (deduped by name).
                </p>
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 flex-col gap-1.5">
                    <span className="px-1 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                        Program
                    </span>
                    <div
                        className="flex flex-wrap gap-1 rounded-2xl border border-white/[0.09] bg-bg-secondary/80 p-1.5 backdrop-blur-sm"
                        role="group"
                        aria-label="Student level"
                    >
                        {LEVELS.map((l) => (
                            <button
                                type="button"
                                key={l.value}
                                onClick={() => setLevel(l.value)}
                                className={`rounded-xl px-3 py-2 font-mono text-xs transition-all ${
                                    level === l.value
                                        ? 'bg-gradient-to-br from-accent-amber/30 to-accent-amber/10 text-accent-amber shadow-glow-amber'
                                        : 'text-text-tertiary hover:bg-white/[0.04] hover:text-text-secondary'
                                }`}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-xs font-mono text-text-tertiary transition-colors hover:text-accent-teal"
                >
                    {showFilters ? '− Hide filters' : '+ Filters (department, funding, min score)'}
                </button>
                {showFilters && (
                    <div className="mt-3 space-y-4 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-bg-secondary/90 to-bg-tertiary/40 p-5 shadow-inner backdrop-blur-md">
                        <div>
                            <label htmlFor="dept-filter" className="mb-1 block font-mono text-[10px] uppercase text-text-tertiary">
                                Department contains
                            </label>
                            <input
                                id="dept-filter"
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                                placeholder="e.g. Computer Science, Psychology"
                                className="w-full rounded-lg border border-white/[0.08] bg-bg-tertiary px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-teal/30"
                            />
                        </div>
                        <label className="flex cursor-pointer items-center gap-2 font-body text-sm text-text-secondary">
                            <input
                                type="checkbox"
                                checked={requireGrant}
                                onChange={(e) => setRequireGrant(e.target.checked)}
                                className="rounded border-white/20 bg-bg-tertiary text-accent-amber focus:ring-accent-amber/40"
                            />
                            Only show professors with an active grant signal
                        </label>
                        <div>
                            <label htmlFor="min-align" className="mb-1 block font-mono text-[10px] uppercase text-text-tertiary">
                                Minimum alignment score: {minAlignment}
                            </label>
                            <input
                                id="min-align"
                                type="range"
                                min={0}
                                max={90}
                                step={5}
                                value={minAlignment}
                                onChange={(e) => setMinAlignment(Number(e.target.value))}
                                className="w-full accent-accent-amber"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="mb-4">
                <button
                    type="button"
                    onClick={() => setShowBackground(!showBackground)}
                    className="text-xs font-mono text-text-tertiary transition-colors hover:text-text-secondary"
                >
                    {showBackground ? '− Hide background' : '+ Technical background (optional)'}
                </button>
                {showBackground && (
                    <textarea
                        value={background}
                        onChange={(e) => setBackground(e.target.value)}
                        placeholder="e.g. Python/PyTorch, coursework, past projects…"
                        className="mt-2 min-h-[60px] w-full resize-none rounded-xl border border-white/[0.08] bg-bg-secondary px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-teal/35"
                        rows={2}
                    />
                )}
            </div>

            <button
                type="button"
                onClick={handleSubmit}
                disabled={!query.trim() || isLoading}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 py-4 font-body text-base font-semibold text-stone-950 shadow-[0_8px_32px_-8px_rgba(232,163,23,0.55)] transition-all before:absolute before:inset-0 before:bg-gradient-to-t before:from-white/25 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100 enabled:hover:shadow-glow-amber enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
                {isLoading ? (
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-800/20 border-t-stone-900" />
                        Searching…
                    </span>
                ) : (
                    <span className="relative z-10 tracking-wide">Find professors →</span>
                )}
            </button>

            <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-wider text-text-tertiary/90">
                Linkup · arXiv · NSF · embeddings · Claude · ⌘ / Ctrl + Enter
            </p>

            {onDemoPreview && (
                <div className="mt-6 border-t border-white/[0.06] pt-6">
                    <button
                        type="button"
                        onClick={onDemoPreview}
                        className="w-full rounded-2xl border border-accent-purple/30 bg-accent-purple/10 py-3 font-mono text-xs uppercase tracking-wider text-accent-purple transition-all hover:border-accent-purple/50 hover:bg-accent-purple/15"
                    >
                        Explore interface — demo data (no API)
                    </button>
                    <p className="mt-2 text-center font-body text-[11px] text-text-tertiary">
                        Builds every screen with sample professors so you can polish UI before the pipeline is wired.
                    </p>
                </div>
            )}
        </div>
    );
}
