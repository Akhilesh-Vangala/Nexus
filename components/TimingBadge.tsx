'use client';

export default function TimingBadge({ timing }: { timing: any }) {
    if (!timing) return null;

    const verdict = timing.verdict || 'good';
    const config: Record<string, { dot: string; text: string; label: string }> = {
        excellent: { dot: 'bg-accent-teal', text: 'text-accent-teal', label: 'Reach out now' },
        good: { dot: 'bg-accent-amber', text: 'text-accent-amber', label: 'Good window' },
        caution: { dot: 'bg-accent-coral', text: 'text-accent-coral', label: 'Caution' },
        wait: { dot: 'bg-accent-coral', text: 'text-accent-coral', label: 'Wait' },
    };

    const c = config[verdict] || config.good;

    return (
        <div className="flex items-center gap-1.5" title={timing.primary_reason || ''}>
            <span className={`w-2 h-2 rounded-full ${c.dot} animate-pulse`} />
            <span className={`font-mono text-[10px] ${c.text}`}>{c.label}</span>
        </div>
    );
}
