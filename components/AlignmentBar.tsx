'use client';

import { useEffect, useState } from 'react';

export default function AlignmentBar({ score }: { score: number }) {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setWidth(score), 120);
        return () => clearTimeout(timer);
    }, [score]);

    const gradient =
        score >= 85
            ? 'from-amber-300 via-amber-400 to-amber-600'
            : score >= 70
              ? 'from-teal-300 via-teal-400 to-teal-600'
              : 'from-text-tertiary/80 to-text-tertiary/40';

    return (
        <div className="flex items-center gap-3">
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06] shadow-inner">
                <div
                    className={`h-full rounded-full bg-gradient-to-r ${gradient} alignment-bar relative overflow-hidden shadow-[0_0_12px_-2px_rgba(232,163,23,0.4)]`}
                    style={{ width: `${width}%` }}
                >
                    <span className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent" />
                </div>
            </div>
            <span className="whitespace-nowrap font-mono text-xs tabular-nums text-text-secondary">
                <span className="text-text-primary">{Math.round(score)}</span>
                <span className="text-text-tertiary">%</span>
            </span>
        </div>
    );
}
