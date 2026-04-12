'use client';

import AlignmentBar from './AlignmentBar';
import TimingBadge from './TimingBadge';

interface ProfessorCardProps {
    professor: any;
    rank: number;
    onClick: () => void;
}

export default function ProfessorCard({ professor, rank, onClick }: ProfessorCardProps) {
    const score = professor.alignment_score || 0;
    const matchLevel = score >= 85 ? 'STRONG MATCH' : score >= 70 ? 'GOOD MATCH' : 'PARTIAL MATCH';
    const matchColor = score >= 85 ? 'text-accent-amber' : score >= 70 ? 'text-accent-teal' : 'text-text-tertiary';
    const glowClass = score >= 85 ? 'glow-amber' : score >= 70 ? 'glow-teal' : '';

    return (
        <div
            onClick={onClick}
            className={`glass-card p-6 cursor-pointer group relative ${glowClass}`}
        >
            {/* Top row: score badge + timing */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {/* Alignment score circle */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${score >= 85 ? 'border-accent-amber bg-accent-amber/10' :
                            score >= 70 ? 'border-accent-teal bg-accent-teal/10' :
                                'border-text-tertiary bg-white/5'
                        }`}>
                        <span className={`font-mono text-lg font-bold score-animate ${matchColor}`}>
                            {Math.round(score)}
                        </span>
                    </div>
                    <div>
                        <span className={`font-mono text-[10px] uppercase tracking-wider ${matchColor}`}>
                            {matchLevel}
                        </span>
                        {professor.has_private_signal && (
                            <span className="ml-2 text-accent-purple text-xs" title="This professor has indicated additional private research alignment">
                                🔒
                            </span>
                        )}
                    </div>
                </div>

                {professor.timing && (
                    <TimingBadge timing={professor.timing} />
                )}
            </div>

            {/* Professor name */}
            <h3 className="font-display text-xl text-text-primary mb-1 group-hover:text-accent-amber transition-colors">
                Prof. {professor.name}
            </h3>
            <p className="text-text-tertiary text-sm font-body mb-3">
                {professor.university} · {professor.department || 'CS Department'}
            </p>

            {/* Current focus */}
            {professor.current_focus && (
                <p className="text-text-secondary text-sm font-body mb-4 line-clamp-2 leading-relaxed">
                    {professor.current_focus}
                </p>
            )}

            {/* Alignment bar */}
            <AlignmentBar score={score} />

            {/* Bottom stats */}
            <div className="flex items-center gap-3 mt-4 text-xs font-mono text-text-tertiary">
                {professor.seed_ideas?.length > 0 && (
                    <span>{professor.seed_ideas.length} seed ideas</span>
                )}
                {professor.grants?.length > 0 && (
                    <>
                        <span className="text-white/10">·</span>
                        <span>{professor.grants.length} grants</span>
                    </>
                )}
                {professor.papers?.length > 0 && (
                    <>
                        <span className="text-white/10">·</span>
                        <span>{professor.papers.length} papers</span>
                    </>
                )}
                <span className="ml-auto text-text-tertiary group-hover:text-accent-amber transition-colors">
                    View Full Profile →
                </span>
            </div>

            {/* Verification badge */}
            {professor.verification && (
                <div className="absolute top-3 right-3">
                    {professor.verification.verdict === 'UNCERTAIN' && (
                        <span className="text-[10px] font-mono bg-accent-amber/10 text-accent-amber px-2 py-0.5 rounded-full">
                            Limited data
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
