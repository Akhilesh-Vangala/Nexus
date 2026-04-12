import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import PageBackdrop from '@/components/PageBackdrop';

export const metadata = {
    title: 'PhD program fit — LabLens',
    description: 'UI preview: how your research story maps to PhD tracks (coming with full pipeline).',
};

export default function PhdFitPage() {
    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg-primary">
            <PageBackdrop subtle />
            <SiteHeader subtitle="PhD fit" />

            <main id="main-content" className="relative z-10 mx-auto max-w-3xl flex-1 px-4 py-14 sm:px-6">
                <h1 className="mb-2 font-display text-4xl font-semibold sm:text-5xl">
                    <span className="text-gradient-gold">PhD program fit</span>
                </h1>
                <p className="mb-10 max-w-xl font-body text-sm leading-relaxed text-text-secondary">
                    This route is a <strong className="text-text-primary">UI shell</strong> for a later feature: given your
                    intent paragraph, surface which departmental tracks, methods, and lab cultures are strongest matches —
                    still grounded in retrieval, not generic advice.
                </p>

                <div className="space-y-4">
                    {[
                        {
                            title: 'Track mapping',
                            body: 'Infer likely home departments (CS, Stats, BMI, …) with confidence bands.',
                            tone: 'amber' as const,
                        },
                        {
                            title: 'Methods readiness',
                            body: 'Highlight proof-heavy vs systems-heavy paths based on your stated background.',
                            tone: 'teal' as const,
                        },
                        {
                            title: 'Timeline & signals',
                            body: 'Combine timing, grants, and publication velocity into a candid “apply now vs wait” note.',
                            tone: 'purple' as const,
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className={`glass-card rounded-2xl border border-white/[0.07] p-5 ${
                                item.tone === 'amber'
                                    ? 'border-l-2 border-l-accent-amber/60'
                                    : item.tone === 'teal'
                                      ? 'border-l-2 border-l-accent-teal/60'
                                      : 'border-l-2 border-l-accent-purple/60'
                            }`}
                        >
                            <h2 className="font-display text-lg text-text-primary">{item.title}</h2>
                            <p className="mt-2 font-body text-sm text-text-secondary">{item.body}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 rounded-2xl border border-accent-purple/25 bg-gradient-to-br from-accent-purple/10 to-transparent px-5 py-6 font-mono text-xs text-accent-purple">
                    Pipeline integration TBD — same intent object and embeddings as professor search; this page will call a
                    dedicated endpoint when the backend is ready.
                </div>

                <Link
                    href="/"
                    className="mt-8 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-colors hover:text-accent-amber"
                >
                    ← Back to search
                </Link>
            </main>
            <SiteFooter />
        </div>
    );
}
