'use client';

import { useState, useEffect, useRef } from 'react';

const PLACEHOLDERS = [
    "I'm fascinated by how language models fail at causal reasoning...",
    "I want to work on computer vision for robotic manipulation...",
    "I'm interested in fairness and bias in machine learning systems...",
    "I want to research protein structure prediction using deep learning...",
    "I'm curious about reinforcement learning for real-world decision making...",
];

const UNIVERSITIES = [
    "Columbia University",
    "NYU",
    "MIT",
    "Stanford University",
    "Carnegie Mellon University",
    "UC Berkeley",
    "Harvard University",
];

const LEVELS = [
    { value: 'undergrad', label: 'Undergrad' },
    { value: 'masters', label: "Master's" },
    { value: 'phd_applicant', label: 'PhD Applicant' },
];

interface SearchInputProps {
    onSearch: (query: string, university: string, level: string, background: string) => void;
    isLoading?: boolean;
}

export default function SearchInput({ onSearch, isLoading = false }: SearchInputProps) {
    const [query, setQuery] = useState('');
    const [university, setUniversity] = useState('Columbia University');
    const [level, setLevel] = useState('masters');
    const [background, setBackground] = useState('');
    const [showBackground, setShowBackground] = useState(false);
    const [placeholderIdx, setPlaceholderIdx] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Rotate placeholders
    useEffect(() => {
        const timer = setInterval(() => {
            setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const handleSubmit = () => {
        if (query.trim() && !isLoading) {
            onSearch(query, university, level, background);
        }
    };

    return (
        <div className="mx-auto w-full max-w-2xl">
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
                    className="min-h-[120px] w-full resize-none bg-transparent p-4 font-body text-base text-text-primary placeholder:text-text-tertiary focus:outline-none"
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

            {/* Controls row */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 flex-col gap-1.5">
                    <span className="px-1 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                        University
                    </span>
                    <select
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    aria-label="University"
                    className="flex-1 cursor-pointer appearance-none rounded-xl border border-white/[0.08] bg-bg-secondary px-4 py-3 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-amber/35"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239CA3AF' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                >
                    {UNIVERSITIES.map((u) => (
                        <option key={u} value={u} className="bg-bg-secondary">
                            {u}
                        </option>
                    ))}
                </select>
                </div>

                <div className="flex flex-col gap-1.5 sm:min-w-[220px]">
                    <span className="px-1 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                        Level
                    </span>
                    <div
                        className="flex gap-1 rounded-xl border border-white/[0.08] bg-bg-secondary p-1"
                        role="group"
                        aria-label="Student level"
                    >
                    {LEVELS.map((l) => (
                        <button
                            type="button"
                            key={l.value}
                            onClick={() => setLevel(l.value)}
                            className={`rounded-lg px-3 py-2 font-mono text-xs transition-all ${level === l.value
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

            {/* Optional background toggle */}
            <div className="mb-4">
                <button
                    type="button"
                    onClick={() => setShowBackground(!showBackground)}
                    className="text-xs font-mono text-text-tertiary transition-colors hover:text-text-secondary"
                >
                    {showBackground ? '− Hide background' : '+ Add your technical background (optional)'}
                </button>
                {showBackground && (
                    <textarea
                        value={background}
                        onChange={(e) => setBackground(e.target.value)}
                        placeholder="e.g. 2 years Python/PyTorch, took ML and probability courses, worked on NLP project..."
                        className="mt-2 min-h-[60px] w-full resize-none rounded-xl border border-white/[0.08] bg-bg-secondary px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-teal/35"
                        rows={2}
                    />
                )}
            </div>

            {/* CTA Button */}
            <button
                type="button"
                onClick={handleSubmit}
                disabled={!query.trim() || isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-accent-amber to-amber-600 py-4 font-body text-base font-semibold text-bg-primary shadow-lg shadow-accent-amber/10 transition-all hover:shadow-glow-amber enabled:hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                        Searching...
                    </span>
                ) : (
                    'Find My Research Home →'
                )}
            </button>

            {/* Helper text */}
            <p className="text-center text-xs text-text-tertiary font-mono mt-3">
                Live faculty data, papers, and grants · ⌘ or Ctrl + Enter to search
            </p>
        </div>
    );
}
