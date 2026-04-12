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
    isLoading: boolean;
}

export default function SearchInput({ onSearch, isLoading }: SearchInputProps) {
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
        <div className="w-full max-w-2xl mx-auto">
            {/* Main textarea */}
            <div className="glass-card p-1 mb-4">
                <textarea
                    ref={textareaRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={PLACEHOLDERS[placeholderIdx]}
                    className="w-full bg-transparent text-text-primary placeholder-text-tertiary font-body text-base p-4 resize-none focus:outline-none min-h-[100px]"
                    rows={3}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.metaKey) handleSubmit();
                    }}
                />
            </div>

            {/* Controls row */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {/* University selector */}
                <select
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="flex-1 bg-bg-secondary border border-white/[0.08] rounded-xl px-4 py-3 text-text-primary font-body text-sm focus:outline-none focus:border-accent-amber/40 appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239CA3AF' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                >
                    {UNIVERSITIES.map((u) => (
                        <option key={u} value={u} className="bg-bg-secondary">
                            {u}
                        </option>
                    ))}
                </select>

                {/* Level pills */}
                <div className="flex gap-1 bg-bg-secondary border border-white/[0.08] rounded-xl p-1">
                    {LEVELS.map((l) => (
                        <button
                            key={l.value}
                            onClick={() => setLevel(l.value)}
                            className={`px-3 py-2 rounded-lg text-xs font-mono transition-all ${level === l.value
                                    ? 'bg-accent-amber/20 text-accent-amber'
                                    : 'text-text-tertiary hover:text-text-secondary'
                                }`}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Optional background toggle */}
            <div className="mb-4">
                <button
                    onClick={() => setShowBackground(!showBackground)}
                    className="text-xs font-mono text-text-tertiary hover:text-text-secondary transition-colors"
                >
                    {showBackground ? '− Hide background' : '+ Add your technical background (optional)'}
                </button>
                {showBackground && (
                    <textarea
                        value={background}
                        onChange={(e) => setBackground(e.target.value)}
                        placeholder="e.g. 2 years Python/PyTorch, took ML and probability courses, worked on NLP project..."
                        className="w-full mt-2 bg-bg-secondary border border-white/[0.08] rounded-xl px-4 py-3 text-text-primary placeholder-text-tertiary font-body text-sm resize-none focus:outline-none focus:border-accent-teal/40 min-h-[60px]"
                        rows={2}
                    />
                )}
            </div>

            {/* CTA Button */}
            <button
                onClick={handleSubmit}
                disabled={!query.trim() || isLoading}
                className="w-full py-4 rounded-xl font-body font-semibold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-accent-amber to-amber-600 text-bg-primary hover:shadow-glow-amber hover:scale-[1.01] active:scale-[0.99]"
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
                Searches live faculty data, papers, grants, and alumni in real time · ⌘+Enter to search
            </p>
        </div>
    );
}
