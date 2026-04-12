'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { apiUrl } from '@/lib/api';

const EPSILON_OPTIONS = [
    { value: 0.5, label: 'High Privacy', desc: 'Maximum noise, lower matching accuracy' },
    { value: 1.0, label: 'Balanced', desc: 'Recommended default — good privacy + accuracy' },
    { value: 2.0, label: 'Lower Privacy', desc: 'Less noise, higher matching accuracy' },
];

export default function ProfessorPortal() {
    const [professorName, setProfessorName] = useState('');
    const [professorId, setProfessorId] = useState('');
    const [university, setUniversity] = useState('Columbia University');
    const [skillsDescription, setSkillsDescription] = useState('');
    const [epsilon, setEpsilon] = useState(1.0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSubmit = async () => {
        if (!skillsDescription.trim() || !professorName.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(apiUrl('/api/professor/private-signal'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    professor_id: professorId || professorName.toLowerCase().replace(/\s/g, '_'),
                    professor_name: professorName,
                    university,
                    skills_description: skillsDescription,
                    epsilon,
                }),
            });
            const data = await res.json();
            setResult(data);
            setSkillsDescription(''); // Clear immediately
        } catch (err) {
            console.error('Signal error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-bg-primary dot-grid">
            <SiteHeader subtitle="Professor portal" />

            <main id="main-content" className="flex-1">
            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
                    <Link
                        href="/"
                        className="mb-8 inline-block font-mono text-xs text-text-tertiary transition-colors hover:text-accent-amber"
                    >
                        ← Home
                    </Link>

                    <h1 className="mb-2 font-display text-3xl text-text-primary sm:text-4xl">Professor Portal</h1>
                    <p className="text-text-secondary font-body mb-8">
                        Register confidential research signals. Students see alignment — never your description.
                    </p>
                </motion.div>

                {/* Three-tier visualizer */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-10">
                    <h3 className="font-mono text-xs text-text-tertiary uppercase tracking-wider mb-4">Three-Tier Data Architecture</h3>
                    <div className="space-y-3">
                        <TierBar tier="TIER 1 — PUBLIC" desc="Published papers, grants, lab website" fill={100} color="amber" />
                        <TierBar tier="TIER 2 — SEMI-PUBLIC" desc="Workshop papers, GitHub, syllabi" fill={60} color="teal" />
                        <TierBar tier="TIER 3 — PRIVATE" desc="Confidential project signals" fill={result ? 30 : 0} color="purple" locked={!result} />
                    </div>
                </motion.div>

                {/* Private signal form */}
                {!result ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="glass-card p-6 border-accent-purple/20"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-accent-purple">🔒</span>
                            <h3 className="font-display text-xl text-text-primary">Confidential Research Signal</h3>
                        </div>
                        <p className="text-text-tertiary text-sm mb-6 font-body">
                            Describe the type of mind you need. <strong className="text-text-secondary">Not</strong> what the project is.
                        </p>

                        {/* Name + University */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <input
                                value={professorName}
                                onChange={(e) => setProfessorName(e.target.value)}
                                placeholder="Your name"
                                className="bg-bg-tertiary border border-white/[0.08] rounded-xl px-4 py-3 text-text-primary font-body text-sm focus:outline-none focus:border-accent-purple/40"
                            />
                            <select
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}
                                className="bg-bg-tertiary border border-white/[0.08] rounded-xl px-4 py-3 text-text-primary font-body text-sm focus:outline-none"
                            >
                                <option>Columbia University</option>
                                <option>NYU</option>
                                <option>MIT</option>
                                <option>Stanford University</option>
                            </select>
                        </div>

                        {/* Skills description */}
                        <textarea
                            value={skillsDescription}
                            onChange={(e) => setSkillsDescription(e.target.value)}
                            placeholder="I need someone who thinks carefully about [skills, methods, intellectual approach]..."
                            className="w-full bg-bg-tertiary border border-white/[0.08] rounded-xl px-4 py-3 text-text-primary placeholder-text-tertiary font-body text-sm resize-none focus:outline-none focus:border-accent-purple/40 min-h-[120px] mb-4"
                            rows={4}
                        />

                        {/* Epsilon selector */}
                        <div className="mb-4">
                            <p className="font-mono text-xs text-text-tertiary mb-2">Privacy Level (ε — epsilon)</p>
                            <div className="flex gap-2">
                                {EPSILON_OPTIONS.map((opt) => (
                                    <button
                                        type="button"
                                        key={opt.value}
                                        onClick={() => setEpsilon(opt.value)}
                                        className={`flex-1 p-3 rounded-xl text-center transition-all ${epsilon === opt.value
                                                ? 'bg-accent-purple/20 border border-accent-purple/40 text-accent-purple'
                                                : 'bg-bg-tertiary border border-white/[0.08] text-text-tertiary hover:text-text-secondary'
                                            }`}
                                    >
                                        <p className="font-mono text-xs font-bold">{opt.label}</p>
                                        <p className="text-[10px] mt-0.5">ε = {opt.value}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Warning */}
                        <div className="bg-accent-coral/5 border border-accent-coral/20 rounded-xl p-4 mb-4">
                            <p className="text-accent-coral text-xs font-mono mb-1">⚠ Privacy Guarantee</p>
                            <p className="text-text-secondary text-xs">
                                Your text is <strong>immediately discarded</strong> after embedding. Only a noised mathematical
                                signal persists. Students see &ldquo;Additional alignment detected&rdquo; — they never see what you wrote.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!skillsDescription.trim() || !professorName.trim() || isSubmitting}
                            className="w-full rounded-xl bg-gradient-to-r from-accent-purple to-purple-700 py-3 font-body font-semibold text-white shadow-lg shadow-purple-900/20 transition-all hover:brightness-110 disabled:opacity-40"
                        >
                            {isSubmitting ? '⟳ Generating Private Signal...' : 'Generate Private Signal →'}
                        </button>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 border-accent-teal/20">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-accent-teal text-xl">✓</span>
                            <h3 className="font-display text-xl text-text-primary">Signal Generated</h3>
                        </div>
                        <div className="space-y-3 font-mono text-sm">
                            <p className="text-text-secondary">Signal ID: <span className="text-accent-purple">{result.signal_id}</span></p>
                            <p className="text-text-secondary">Privacy: <span className="text-text-primary">{result.privacy_guarantee}</span></p>
                            <p className="text-text-secondary">Raw text stored: <span className="text-accent-coral font-bold">FALSE</span></p>
                            <p className="text-text-secondary">Description: <span className="text-accent-coral">[DISCARDED]</span></p>
                        </div>
                        <p className="text-accent-teal text-sm mt-4 font-body">{result.message}</p>
                        <button
                            type="button"
                            onClick={() => setResult(null)}
                            className="mt-4 rounded-lg bg-white/5 px-4 py-2 text-sm text-text-tertiary transition-colors hover:text-text-secondary"
                        >
                            Create another signal
                        </button>
                    </motion.div>
                )}
            </div>
            </main>

            <SiteFooter />
        </div>
    );
}

function TierBar({ tier, desc, fill, color, locked }: {
    tier: string; desc: string; fill: number; color: string; locked?: boolean;
}) {
    const colors: Record<string, string> = {
        amber: 'bg-accent-amber',
        teal: 'bg-accent-teal',
        purple: 'bg-accent-purple',
    };

    return (
        <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-text-secondary">{tier}</span>
                {locked && <span className="text-text-tertiary text-xs">🔒 Not registered</span>}
            </div>
            <p className="text-text-tertiary text-xs mb-2">{desc}</p>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className={`h-full rounded-full alignment-bar ${colors[color]}`} style={{ width: `${fill}%` }} />
            </div>
        </div>
    );
}
