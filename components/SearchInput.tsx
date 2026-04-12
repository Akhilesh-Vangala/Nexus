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
    isLoading?: boolean;
}

export default function SearchInput({ onSearch, isLoading = false }: SearchInputProps) {
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
            <p className="mb-2 px-1 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                Quick starters
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
                {TEMPLATES.map((t) => (
                    <button
                        type="button"
                        key={t.label}
                        onClick={() => setQuery(t.text)}
                        className="rounded-full border border-white/10 bg-bg-secondary/80 px-3 py-1.5 font-mono text-[11px] text-text-secondary transition-colors hover:border-accent-amber/30 hover:text-accent-amber"
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <label htmlFor="lablens-interest" className="sr-only">
                Describe your research interests
            </label>
            <div className="glass-card mb-4 p-1 ring-1 ring-white/[0.04] transition-shadow focus-within:ring-accent-amber/25">
                <textarea
                    id="lablens-interest"
                    ref={textareaRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={PLACEHOLDERS[placeholderIdx]}
                    className="min-h-[128px] w-full resize-none bg-transparent p-4 font-body text-base text-text-primary placeholder:text-text-tertiary focus:outline-none"
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

            <div className="mb-4">
                <span className="mb-2 block px-1 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                    School
                </span>
                <div
                    className="flex flex-wrap gap-1 rounded-xl border border-white/[0.08] bg-bg-secondary p-1"
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
                            className={`flex-1 rounded-lg px-3 py-2.5 font-mono text-xs transition-all sm:flex-none sm:px-5 ${
                                schoolScope === opt.id
                                    ? 'bg-accent-teal/20 text-accent-teal'
                                    : 'text-text-tertiary hover:text-text-secondary'
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
                        className="flex flex-wrap gap-1 rounded-xl border border-white/[0.08] bg-bg-secondary p-1"
                        role="group"
                        aria-label="Student level"
                    >
                        {LEVELS.map((l) => (
                            <button
                                type="button"
                                key={l.value}
                                onClick={() => setLevel(l.value)}
                                className={`rounded-lg px-3 py-2 font-mono text-xs transition-all ${
                                    level === l.value
                                        ? 'bg-accent-amber/20 text-accent-amber'
                                        : 'text-text-tertiary hover:text-text-secondary'
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
                    <div className="mt-3 space-y-4 rounded-xl border border-white/[0.06] bg-bg-secondary/50 p-4">
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
                className="w-full rounded-xl bg-gradient-to-r from-accent-amber to-amber-600 py-4 font-body text-base font-semibold text-bg-primary shadow-lg shadow-accent-amber/10 transition-all hover:shadow-glow-amber enabled:hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-bg-primary/30 border-t-bg-primary" />
                        Searching…
                    </span>
                ) : (
                    'Find professors →'
                )}
            </button>

            <p className="mt-3 text-center font-mono text-[11px] text-text-tertiary">
                Live Linkup + verification + embeddings · ⌘ or Ctrl + Enter
            </p>
        </div>
    );
}
