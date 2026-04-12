'use client';

import AlignmentBar from './AlignmentBar';
import TimingBadge from './TimingBadge';
import type { Professor } from '@/lib/types';

interface ProfessorCardProps {
    professor: Professor;
    rank: number;
    onClick: () => void;
}

export default function ProfessorCard({ professor, rank, onClick }: ProfessorCardProps) {
    const score = professor.alignment_score ?? 0;
    const matchLevel = score >= 85 ? 'Strong match' : score >= 70 ? 'Good match' : 'Partial match';
    const matchColor =
        score >= 85 ? 'text-accent-amber' : score >= 70 ? 'text-accent-teal' : 'text-text-tertiary';
    const glowClass = score >= 85 ? 'glow-amber' : score >= 70 ? 'glow-teal' : '';
    const detail = professor.alignment_detail;
    const confidence = detail?.confidence || professor.confidence;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <article
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            aria-label={`View profile for ${professor.name}, alignment score ${Math.round(score)}`}
            className={`group relative cursor-pointer rounded-2xl p-6 glass-card transition-transform duration-300 hover:-translate-y-0.5 ${glowClass}`}
        >
            <div className="absolute left-0 top-6 h-[calc(100%-3rem)] w-1 rounded-r-full bg-gradient-to-b from-accent-amber/80 via-accent-teal/40 to-transparent opacity-60" />

            <div className="absolute right-4 top-4 flex flex-col items-end gap-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary">Rank</span>
                <span className="font-display text-2xl font-bold text-white/20 transition-colors group-hover:text-accent-amber/40">
                    {rank}
                </span>
            </div>

            <div className="mb-4 flex items-start justify-between gap-4 pr-14">
                <div className="flex items-center gap-3">
                    <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 ${
                            score >= 85
                                ? 'border-accent-amber bg-accent-amber/10'
                                : score >= 70
                                  ? 'border-accent-teal bg-accent-teal/10'
                                  : 'border-text-tertiary bg-white/5'
                        }`}
                    >
                        <span className={`score-animate font-mono text-lg font-bold ${matchColor}`}>
                            {Math.round(score)}
                        </span>
                    </div>
                    <div>
                        <span className={`font-mono text-[10px] uppercase tracking-wider ${matchColor}`}>
                            {matchLevel}
                        </span>
                        {confidence && (
                            <p className="mt-0.5 font-mono text-[10px] text-text-tertiary">
                                Confidence: {confidence}
                            </p>
                        )}
                        {professor.has_private_signal && (
                            <span
                                className="mt-1 inline-block text-accent-purple"
                                title="Additional private alignment signal may be included in this score"
                                aria-label="Private signal"
                            >
                                🔒 Private tier
                            </span>
                        )}
                    </div>
                </div>

                {professor.timing && <TimingBadge timing={professor.timing} />}
            </div>

            <h3 className="mb-1 font-display text-xl text-text-primary transition-colors group-hover:text-accent-amber">
                Prof. {professor.name}
            </h3>
            <p className="mb-3 font-body text-sm text-text-tertiary">
                {professor.university} · {professor.department || 'Department'}
            </p>

            {professor.current_focus && (
                <p className="mb-4 line-clamp-3 font-body text-sm leading-relaxed text-text-secondary">
                    {professor.current_focus}
                </p>
            )}

            <AlignmentBar score={score} />

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-text-tertiary">
                {professor.seed_ideas && professor.seed_ideas.length > 0 && (
                    <span>{professor.seed_ideas.length} seed ideas</span>
                )}
                {professor.grants && professor.grants.length > 0 && (
                    <>
                        <span className="text-white/15" aria-hidden>
                            ·
                        </span>
                        <span>{professor.grants.length} grants</span>
                    </>
                )}
                {professor.papers && professor.papers.length > 0 && (
                    <>
                        <span className="text-white/15" aria-hidden>
                            ·
                        </span>
                        <span>{professor.papers.length} papers</span>
                    </>
                )}
                <span className="ml-auto text-text-tertiary transition-colors group-hover:text-accent-amber">
                    Open profile →
                </span>
            </div>

            {professor.verification?.verdict === 'UNCERTAIN' && (
                <div className="absolute left-4 top-4 rounded-full bg-accent-amber/15 px-2 py-0.5 font-mono text-[10px] text-accent-amber">
                    Limited data
                </div>
            )}
        </article>
    );
}
