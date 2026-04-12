'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProfessorCard from '@/components/ProfessorCard';
import type { Professor, SearchResponse } from '@/lib/types';

const PIPELINE_STEPS = [
    { label: 'Extracting your research intent...', icon: '🧠' },
    { label: 'Finding professors via live search...', icon: '🔗' },
    { label: 'Verifying active status (arXiv + .edu)...', icon: '✓' },
    { label: 'Computing semantic alignment...', icon: '📐' },
    { label: 'Generating approach strategies...', icon: '💡' },
    { label: 'Drafting personalized emails...', icon: '✉️' },
];

export default function ResultsPage() {
    const router = useRouter();
    const [results, setResults] = useState<SearchResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<any>(null);
    const [sortBy, setSortBy] = useState<'score' | 'timing'>('score');

    useEffect(() => {
        const stored = sessionStorage.getItem('searchParams');
        if (!stored) {
            router.push('/');
            return;
        }

        const params = JSON.parse(stored);
        setSearchParams(params);

        // Animate through pipeline steps
        const stepTimer = setInterval(() => {
            setCurrentStep((prev) => Math.min(prev + 1, PIPELINE_STEPS.length - 1));
        }, 5000);

        // Execute search
        fetchResults(params).finally(() => {
            clearInterval(stepTimer);
            setCurrentStep(PIPELINE_STEPS.length - 1);
        });

        return () => clearInterval(stepTimer);
    }, []);

    const fetchResults = async (params: any) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/api/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const data = await response.json();
            setResults(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <h2 className="font-display text-2xl text-text-primary mb-8 text-center">
                        Finding your research home...
                    </h2>

                    <div className="space-y-3">
                        {PIPELINE_STEPS.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{
                                    opacity: i <= currentStep ? 1 : 0.3,
                                    x: 0,
                                }}
                                transition={{ delay: i * 0.3, duration: 0.4 }}
                                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${i === currentStep
                                        ? 'bg-bg-tertiary border border-accent-amber/20'
                                        : i < currentStep
                                            ? 'bg-bg-secondary/50'
                                            : ''
                                    }`}
                            >
                                <span className="text-lg">{step.icon}</span>
                                <span className={`font-mono text-sm ${i === currentStep ? 'text-accent-amber step-pulse' : i < currentStep ? 'text-accent-teal' : 'text-text-tertiary'
                                    }`}>
                                    {i < currentStep ? '✓ ' : i === currentStep ? '⟳ ' : ''}{step.label}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Skeleton cards */}
                    <div className="mt-10 grid grid-cols-1 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="glass-card p-6" style={{ animationDelay: `${i * 200}ms` }}>
                                <div className="skeleton h-4 w-24 mb-3" />
                                <div className="skeleton h-6 w-48 mb-2" />
                                <div className="skeleton h-3 w-full mb-4" />
                                <div className="skeleton h-2 w-3/4" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
                <div className="glass-card p-8 max-w-md text-center">
                    <h2 className="font-display text-xl text-accent-coral mb-4">Search Error</h2>
                    <p className="text-text-secondary text-sm mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-2 rounded-lg bg-accent-amber/20 text-accent-amber font-mono text-sm hover:bg-accent-amber/30 transition-colors"
                    >
                        ← Try Again
                    </button>
                </div>
            </main>
        );
    }

    const professors = results?.professors || [];

    return (
        <main className="min-h-screen bg-bg-primary">
            {/* Header */}
            <div className="border-b border-white/[0.06] bg-bg-secondary/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button onClick={() => router.push('/')} className="font-display text-xl text-text-primary hover:text-accent-amber transition-colors">
                        LabLens
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="font-mono text-xs text-text-tertiary">
                            {results?.total_verified || 0} professors verified · {professors.length} shown
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Search context */}
                <div className="mb-8">
                    <p className="font-mono text-xs text-accent-teal mb-2">
                        Found {professors.length} professors matching your research interest
                    </p>
                    <blockquote className="text-text-secondary text-sm italic border-l-2 border-accent-amber/30 pl-4">
                        &ldquo;{searchParams?.student_interest?.slice(0, 150)}...&rdquo;
                    </blockquote>

                    {/* Sort controls */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setSortBy('score')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${sortBy === 'score' ? 'bg-accent-amber/20 text-accent-amber' : 'text-text-tertiary hover:text-text-secondary'
                                }`}
                        >
                            Best Match
                        </button>
                        <button
                            onClick={() => setSortBy('timing')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${sortBy === 'timing' ? 'bg-accent-teal/20 text-accent-teal' : 'text-text-tertiary hover:text-text-secondary'
                                }`}
                        >
                            Best Timing
                        </button>
                    </div>
                </div>

                {/* Professor cards grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {professors.map((prof: any, i: number) => (
                        <motion.div
                            key={prof.id || i}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.15, duration: 0.5 }}
                        >
                            <ProfessorCard
                                professor={prof}
                                rank={i + 1}
                                onClick={() => {
                                    sessionStorage.setItem('selectedProfessor', JSON.stringify(prof));
                                    sessionStorage.setItem('searchContext', JSON.stringify(searchParams));
                                    router.push(`/professor/${prof.id || i}`);
                                }}
                            />
                        </motion.div>
                    ))}
                </div>

                {professors.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-text-tertiary font-body">No professors found. Try adjusting your search.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
