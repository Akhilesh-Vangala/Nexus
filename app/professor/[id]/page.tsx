'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import AlignmentBar from '@/components/AlignmentBar';
import TimingBadge from '@/components/TimingBadge';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageBackdrop from '@/components/PageBackdrop';
import { UiSection as Section } from '@/components/professor/UiSection';
import { apiUrl } from '@/lib/api';
import { mergeDemoProfile } from '@/lib/fixtures/lablens-demo';
import { loadLastSearchResults } from '@/lib/searchSession';
import { isUiDemoClient } from '@/lib/ui-demo';

const TABS = [
    { id: 'research', label: 'Research Intelligence', icon: '' },
    { id: 'lab', label: 'Lab Intelligence', icon: '' },
    { id: 'timing', label: 'Timing & Approach', icon: '' },
    { id: 'skills', label: 'Skills Gap', icon: '' },
    { id: 'grants', label: 'Grants', icon: '' },
    { id: 'email', label: 'Your Email', icon: '' },
];

export default function ProfessorPage() {
    const router = useRouter();
    const params = useParams();
    const routeId = params?.id as string | undefined;
    const [professor, setProfessor] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('research');
    const [deepData, setDeepData] = useState<any>(null);
    const [isLoadingDeep, setIsLoadingDeep] = useState(false);
    const [copied, setCopied] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [uiDemo, setUiDemo] = useState(false);

    useEffect(() => {
        setUiDemo(isUiDemoClient());
    }, []);

    useEffect(() => {
        const stored = sessionStorage.getItem('selectedProfessor');
        if (stored) {
            setProfessor(JSON.parse(stored));
            setDeepData(null);
            setEmailSent(false);
        } else {
            router.push('/');
        }
    }, [routeId, router]);

    const fetchDeepDive = async () => {
        if (!professor || deepData) return;
        setIsLoadingDeep(true);
        try {
            const context = JSON.parse(sessionStorage.getItem('searchContext') || '{}');
            const res = await fetch(apiUrl('/api/professor/deep'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    professor_name: professor.name,
                    university: professor.university,
                    department: professor.department,
                    student_interest: context.student_interest || '',
                    student_background: context.student_background || '',
                    student_level: context.student_level || 'masters',
                }),
            });
            const data = await res.json();
            setDeepData(data);
        } catch (err) {
            console.error('Deep dive error:', err);
        } finally {
            setIsLoadingDeep(false);
        }
    };

    const handleCopyEmail = () => {
        const email = deepData?.email_draft || professor?.email_draft;
        if (email) {
            navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!professor) {
        return (
            <div className="flex min-h-screen flex-col bg-bg-primary">
                <SiteHeader showBack subtitle="Profile" />
                <main id="main-content" className="flex flex-1 items-center justify-center">
                    <div className="skeleton h-8 w-48" />
                </main>
            </div>
        );
    }

    const data = deepData || (uiDemo ? mergeDemoProfile(professor) : professor);
    const score = data.alignment_score || 0;

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg-primary">
            <PageBackdrop />
            <SiteHeader showBack subtitle="Professor profile" />

            <main id="main-content" className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
                {/* Professor header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="font-display text-3xl md:text-4xl text-text-primary mb-1">
                                Prof. {professor.name}
                                {professor.has_private_signal && <span className="ml-3 text-accent-purple text-lg" title="Private signal active">🔒</span>}
                            </h1>
                            <p className="text-text-secondary font-body">
                                {professor.university} · {professor.department || 'Computer Science'}
                                {professor.lab_name && ` · ${professor.lab_name}`}
                            </p>
                        </div>

                        {/* Score */}
                        <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${score >= 85 ? 'border-accent-amber/30 bg-accent-amber/5' :
                                score >= 70 ? 'border-accent-teal/30 bg-accent-teal/5' :
                                    'border-white/10 bg-white/5'
                            }`}>
                            <span className={`font-mono text-3xl font-bold ${score >= 85 ? 'text-accent-amber' : score >= 70 ? 'text-accent-teal' : 'text-text-secondary'
                                }`}>
                                {Math.round(score)}
                            </span>
                            <div>
                                <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">Alignment</p>
                                <p className={`font-mono text-xs ${score >= 85 ? 'text-accent-amber' : score >= 70 ? 'text-accent-teal' : 'text-text-tertiary'
                                    }`}>
                                    {score >= 85 ? 'Strong Match' : score >= 70 ? 'Good Match' : 'Partial Match'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {data.why_aligned && (
                        <p className="mt-4 text-accent-teal text-sm font-body bg-accent-teal/5 border border-accent-teal/20 rounded-xl px-4 py-3">
                            {data.why_aligned}
                        </p>
                    )}

                    {!deepData && !uiDemo && (
                        <button
                            type="button"
                            onClick={fetchDeepDive}
                            disabled={isLoadingDeep}
                            className="mt-4 rounded-xl border border-accent-purple/30 bg-accent-purple/15 px-5 py-2.5 font-mono text-sm text-accent-purple transition-all hover:bg-accent-purple/25 disabled:opacity-50"
                        >
                            {isLoadingDeep ? '⟳ Loading deep analysis…' : '🔍 Load full deep dive (API)'}
                        </button>
                    )}
                    {uiDemo && (
                        <p className="mt-4 inline-flex items-center gap-2 rounded-xl border border-accent-teal/25 bg-accent-teal/10 px-4 py-2 font-mono text-xs text-accent-teal">
                            UI demo — tabs show fixture data. Connect the API for live deep dives.
                        </p>
                    )}
                </motion.div>

                {/* Tabs */}
                <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`shrink-0 rounded-full border px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider transition-all sm:text-[11px] ${
                                activeTab === tab.id
                                    ? 'border-accent-amber/35 bg-gradient-to-r from-accent-amber/20 to-accent-teal/10 text-accent-amber shadow-glow-amber'
                                    : 'border-white/[0.08] text-text-tertiary hover:border-white/15 hover:bg-white/[0.04] hover:text-text-secondary'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    {activeTab === 'research' && <ResearchTab data={data} />}
                    {activeTab === 'lab' && <LabTab data={data} />}
                    {activeTab === 'timing' && <TimingTab data={data} />}
                    {activeTab === 'skills' && <SkillsTab data={data} />}
                    {activeTab === 'grants' && <GrantsTab data={data} />}
                    {activeTab === 'email' && (
                        <EmailTab
                            data={data}
                            copied={copied}
                            onCopy={handleCopyEmail}
                            emailSent={emailSent}
                            onMarkSent={() => setEmailSent(true)}
                        />
                    )}
                </motion.div>

                <SimilarFromSearch currentId={professor.id} />
            </main>

            <SiteFooter />
        </div>
    );
}

function SimilarFromSearch({ currentId }: { currentId: string }) {
    const router = useRouter();
    const others = loadLastSearchResults()
        .filter((p) => p.id !== currentId)
        .slice(0, 4);
    if (others.length === 0) return null;

    return (
        <section className="mt-16 border-t border-white/[0.06] pt-10">
            <h2 className="mb-6 font-display text-xl text-text-primary">Other matches from this search</h2>
            <div className="grid gap-4 md:grid-cols-2">
                {others.map((p) => (
                    <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                            sessionStorage.setItem('selectedProfessor', JSON.stringify(p));
                            router.push(`/professor/${p.id}`);
                        }}
                        className="rounded-xl border border-white/[0.06] bg-bg-secondary/40 p-4 text-left transition-colors hover:border-accent-amber/35 hover:bg-bg-tertiary/40"
                    >
                        <p className="font-display text-text-primary">Prof. {p.name}</p>
                        <p className="mt-1 font-mono text-xs text-accent-teal">
                            {Math.round(p.alignment_score || 0)} alignment
                        </p>
                        {p.current_focus && (
                            <p className="mt-2 line-clamp-2 font-body text-xs text-text-tertiary">{p.current_focus}</p>
                        )}
                    </button>
                ))}
            </div>
        </section>
    );
}

/* ========== TAB COMPONENTS ========== */

function ResearchTab({ data }: { data: any }) {
    return (
        <div className="space-y-6">
            {/* Current focus */}
            <Section title="Current Research Focus">
                <p className="text-text-secondary font-body leading-relaxed">{data.current_focus || 'Loading...'}</p>
            </Section>

            {/* Open questions */}
            {data.open_questions?.length > 0 && (
                <Section title="Open Research Questions">
                    <ul className="space-y-2">
                        {data.open_questions.map((q: string, i: number) => (
                            <li key={i} className="flex gap-2 text-text-secondary text-sm">
                                <span className="text-accent-amber mt-0.5">▸</span>
                                <span>{q}</span>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {/* Seed Ideas */}
            {data.seed_ideas?.length > 0 && (
                <Section title="Research Ideas">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {data.seed_ideas.map((idea: any, i: number) => (
                            <div key={i} className="glass-card p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="font-mono text-xs text-accent-amber">Idea {i + 1}</span>
                                </div>
                                <h4 className="font-body font-semibold text-text-primary text-sm mb-2">{idea.title}</h4>
                                <p className="text-text-secondary text-xs leading-relaxed mb-3">{idea.question}</p>
                                <div className="space-y-2 text-xs">
                                    <p className="text-accent-teal"><strong>Why this prof:</strong> {idea.connection_to_professor}</p>
                                    <p className="text-accent-purple"><strong>Why you:</strong> {idea.connection_to_student}</p>
                                </div>
                                <span className={`inline-block mt-3 px-2 py-0.5 rounded text-[10px] font-mono ${idea.difficulty === 'phd_level' ? 'bg-accent-coral/10 text-accent-coral' :
                                        idea.difficulty === 'masters_suitable' ? 'bg-accent-amber/10 text-accent-amber' :
                                            'bg-accent-teal/10 text-accent-teal'
                                    }`}>
                                    {idea.difficulty?.replace('_', ' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* ML Explainability Panel */}
            <Section title="How Nexus computed this score">
                <div className="glass-card space-y-3 border-accent-purple/20 p-5 font-mono text-xs">
                    <p className="text-text-tertiary">
                        Model:{' '}
                        <span className="text-text-secondary">
                            {typeof data.alignment_detail?.model === 'string'
                                ? data.alignment_detail.model
                                : 'sentence-transformers (local)'}
                        </span>
                    </p>
                    <p className="text-text-tertiary">
                        Vector dimensions:{' '}
                        <span className="text-text-secondary">
                            {typeof data.alignment_detail?.embedding_dimensions === 'number'
                                ? data.alignment_detail.embedding_dimensions
                                : 384}
                        </span>
                    </p>
                    <p className="text-text-tertiary">
                        Method:{' '}
                        <span className="text-text-secondary">
                            {data.three_tier_score
                                ? 'Three-tier composite (public similarity + private signal)'
                                : 'Cosine similarity over dense research embeddings'}
                        </span>
                    </p>
                    <div className="border-t border-white/[0.06] pt-3">
                        <p className="mb-2 text-text-tertiary">Paper-level similarity (normalized)</p>
                        {data.alignment_detail?.paper_scores?.map((s: number, i: number) => (
                            <div key={i} className="flex items-center gap-2 mb-1">
                                <span className="text-text-tertiary w-4">{i + 1}.</span>
                                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent-purple rounded-full" style={{ width: `${s}%` }} />
                                </div>
                                <span className={`w-10 text-right ${i === data.alignment_detail?.best_matching_paper_idx ? 'text-accent-amber' : 'text-text-secondary'
                                    }`}>
                                    {Math.round(s)}%
                                    {i === data.alignment_detail?.best_matching_paper_idx && ' ★'}
                                </span>
                            </div>
                        ))}
                        {data.three_tier_score && (
                            <div className="mt-3 pt-3 border-t border-white/[0.06]">
                                <p className="text-accent-purple mb-1">🔒 TIER 3 — Confidential signal</p>
                                <p className="text-text-tertiary">Method: (ε={data.three_tier_score.tier3_score ? '1.0' : 'N/A'})-differentially private Gaussian mechanism</p>
                                <p className="text-text-tertiary">Privacy guarantee: Source description irreversibly discarded</p>
                            </div>
                        )}
                    </div>
                    <p className="text-text-tertiary pt-2 border-t border-white/[0.06]">
                        This is not a Claude opinion. This is a real ML similarity computation over dense vector representations of research content.
                    </p>
                </div>
            </Section>
        </div>
    );
}

function LabTab({ data }: { data: any }) {
    const culture = data.lab_culture;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lab Culture Report */}
            <Section title="Lab Culture Report">
                {culture ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className={`font-mono text-2xl font-bold ${culture.culture_score >= 75 ? 'text-accent-teal' : culture.culture_score >= 50 ? 'text-accent-amber' : 'text-accent-coral'
                                }`}>
                                {culture.culture_score}
                            </span>
                            <span className="text-text-tertiary font-mono text-xs">/ 100 culture score</span>
                        </div>

                        {culture.strengths?.length > 0 && (
                            <div>
                                <h4 className="text-text-tertiary font-mono text-xs mb-2 uppercase">Strengths</h4>
                                {culture.strengths.map((s: string, i: number) => (
                                    <p key={i} className="text-accent-teal text-sm mb-1">✓ {s}</p>
                                ))}
                            </div>
                        )}

                        {culture.watch_fors?.length > 0 && (
                            <div>
                                <h4 className="text-text-tertiary font-mono text-xs mb-2 uppercase">Watch For</h4>
                                {culture.watch_fors.map((w: string, i: number) => (
                                    <p key={i} className="text-accent-amber text-sm mb-1">⚠ {w}</p>
                                ))}
                            </div>
                        )}

                        <p className="text-text-secondary text-sm"><strong>Timeline:</strong> {culture.graduation_timeline}</p>
                        <p className="text-text-secondary text-sm"><strong>Best fit:</strong> {culture.best_fit_for}</p>

                        {culture.questions_to_ask?.length > 0 && (
                            <div>
                                <h4 className="text-text-tertiary font-mono text-xs mb-2 uppercase mt-4">Questions to Ask</h4>
                                {culture.questions_to_ask.map((q: string, i: number) => (
                                    <p key={i} className="text-text-secondary text-sm mb-1">• {q}</p>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-text-tertiary text-sm">Load deep dive for lab culture analysis</p>
                )}
            </Section>

            {/* Alumni Trail */}
            <Section title="Lab Alumni — Where Did They Go?">
                {data.alumni_data ? (
                    <p className="text-text-secondary text-sm whitespace-pre-wrap">{typeof data.alumni_data === 'string' ? data.alumni_data : JSON.stringify(data.alumni_data, null, 2)}</p>
                ) : (
                    <p className="text-text-tertiary text-sm">Load deep dive for alumni data</p>
                )}
            </Section>
        </div>
    );
}

function TimingTab({ data }: { data: any }) {
    const timing = data.timing;
    if (!timing) return <p className="text-text-tertiary">Load deep dive for timing analysis</p>;

    return (
        <Section title="Timing Intelligence">
            <div className="glass-card p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-mono font-bold ${timing.verdict === 'excellent' ? 'bg-accent-teal/10 text-accent-teal border border-accent-teal/20' :
                            timing.verdict === 'good' ? 'bg-accent-amber/10 text-accent-amber border border-accent-amber/20' :
                                'bg-accent-coral/10 text-accent-coral border border-accent-coral/20'
                        }`}>
                        {timing.timing_score}
                    </div>
                    <div>
                        <TimingBadge timing={timing} />
                        <p className="text-text-primary font-body mt-1">{timing.primary_reason}</p>
                        <p className="text-text-secondary text-sm mt-1">{timing.details}</p>
                    </div>
                </div>
                {timing.optimal_send_time && (
                    <div className="bg-accent-teal/5 border border-accent-teal/20 rounded-xl p-4">
                        <p className="font-mono text-xs text-accent-teal uppercase mb-1">Best time to send</p>
                        <p className="text-text-primary font-body">{timing.optimal_send_time}</p>
                    </div>
                )}
            </div>
        </Section>
    );
}

function SkillsTab({ data }: { data: any }) {
    const skills = data.skills_gap;
    if (!skills) return <p className="text-text-tertiary">Load deep dive for skills analysis</p>;

    return (
        <div className="space-y-6">
            <Section title="Skills Gap Analysis">
                {skills.required_skills?.length > 0 && (
                    <div className="space-y-2">
                        {skills.required_skills.map((s: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 glass-card">
                                <span className="text-text-primary text-sm">{s.skill}</span>
                                <div className="flex items-center gap-2">
                                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${s.importance === 'required' ? 'bg-accent-coral/10 text-accent-coral' :
                                            s.importance === 'helpful' ? 'bg-accent-amber/10 text-accent-amber' :
                                                'bg-accent-teal/10 text-accent-teal'
                                        }`}>{s.importance}</span>
                                    <span className={`w-3 h-3 rounded-full ${s.student_has ? 'bg-accent-teal' : 'bg-accent-coral'}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Section>

            {skills.two_week_prep?.length > 0 && (
                <Section title="Two-Week Prep Plan">
                    {skills.two_week_prep.map((week: any, i: number) => (
                        <div key={i} className="glass-card p-4 mb-3">
                            <h4 className="font-mono text-xs text-accent-amber mb-2">Week {week.week}</h4>
                            <ul className="space-y-1">
                                {week.tasks?.map((t: string, j: number) => (
                                    <li key={j} className="text-text-secondary text-sm">• {t}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </Section>
            )}
        </div>
    );
}

function GrantsTab({ data }: { data: any }) {
    const grants = data.grants || [];
    return (
        <Section title="Active Grants & Funding">
            {grants.length > 0 ? (
                <div className="space-y-4">
                    {grants.map((g: any, i: number) => (
                        <div key={i} className="glass-card p-5">
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="text-text-primary font-body font-semibold text-sm flex-1">{g.title}</h4>
                                {g.amount && (
                                    <span className="font-mono text-accent-amber text-sm ml-3">${Number(g.amount).toLocaleString()}</span>
                                )}
                            </div>
                            {g.abstract && <p className="text-text-secondary text-xs leading-relaxed mb-2">{g.abstract}</p>}
                            {g.expires && <p className="text-text-tertiary font-mono text-[10px]">Expires: {g.expires}</p>}
                            <p className="text-accent-teal text-xs mt-2">Active grant — this professor likely needs students</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-text-tertiary text-sm">No NSF grants found. Grant data loaded from the public NSF Awards API.</p>
            )}
        </Section>
    );
}

function EmailTab({ data, copied, onCopy, emailSent, onMarkSent }: {
    data: any; copied: boolean; onCopy: () => void; emailSent: boolean; onMarkSent: () => void;
}) {
    const email = data.email_draft;
    if (!email) return <p className="text-text-tertiary">Load deep dive to generate email</p>;

    return (
        <Section title="Your Personalized Email">
            <div className="glass-card p-6">
                <div className="mb-4">
                    <p className="font-mono text-xs text-text-tertiary mb-1">Subject:</p>
                    <p className="text-text-primary font-body font-semibold">{email.subject}</p>
                </div>
                <div className="mb-4">
                    <p className="font-mono text-xs text-text-tertiary mb-1">Body:</p>
                    <pre className="text-text-secondary font-body text-sm whitespace-pre-wrap leading-relaxed">{email.body}</pre>
                </div>
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
                    <span className="font-mono text-[10px] text-text-tertiary">
                        {email.word_count || '~150'} words · Optimized for response rate
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={onCopy}
                            className="px-4 py-2 rounded-lg bg-accent-amber/20 text-accent-amber font-mono text-xs hover:bg-accent-amber/30 transition-colors"
                        >
                            {copied ? '✓ Copied!' : '📋 Copy Email'}
                        </button>
                        {!emailSent && (
                            <button
                                onClick={onMarkSent}
                                className="px-4 py-2 rounded-lg bg-accent-teal/20 text-accent-teal font-mono text-xs hover:bg-accent-teal/30 transition-colors"
                            >
                                I Sent This Email →
                            </button>
                        )}
                    </div>
                </div>
                {emailSent && (
                    <div className="mt-4 p-4 bg-accent-teal/5 border border-accent-teal/20 rounded-xl">
                        <p className="font-mono text-xs text-accent-teal mb-1">✓ Email marked as sent</p>
                        <p className="text-text-secondary text-sm">Follow-up window opens in 10 days. We&apos;ll remind you.</p>
                    </div>
                )}
            </div>
        </Section>
    );
}

