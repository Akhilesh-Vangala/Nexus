'use client';

import { useEffect, useState } from 'react';

export default function AlignmentBar({ score }: { score: number }) {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setWidth(score), 100);
        return () => clearTimeout(timer);
    }, [score]);

    const barColor =
        score >= 85 ? 'bg-accent-amber' :
            score >= 70 ? 'bg-accent-teal' :
                'bg-text-tertiary';

    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full alignment-bar ${barColor}`}
                    style={{ width: `${width}%` }}
                />
            </div>
            <span className="font-mono text-xs text-text-secondary whitespace-nowrap">
                {Math.round(score)}% aligned
            </span>
        </div>
    );
}
