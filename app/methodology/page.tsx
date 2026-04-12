import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import PageBackdrop from '@/components/PageBackdrop';

export const metadata = {
    title: 'How LabLens works — LabLens',
    description: 'Pipeline: intent extraction, Linkup search, verification, embeddings, and grounded synthesis.',
};

export default function MethodologyPage() {
    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg-primary">
            <PageBackdrop subtle />
            <SiteHeader subtitle="How it works" />

            <main id="main-content" className="relative z-10 mx-auto max-w-3xl flex-1 px-4 py-14 sm:px-6">
                <h1 className="mb-2 font-display text-4xl font-semibold sm:text-5xl">
                    <span className="text-gradient-gold">How it works</span>
                </h1>
                <p className="mb-12 max-w-xl font-body text-sm leading-relaxed text-text-secondary">
                    Live retrieval, measurable similarity, and synthesis that stays tied to evidence — built for credible
                    demos and real outreach prep.
                </p>

                <ol className="space-y-6">
                    {[
                        {
                            n: '1',
                            title: 'Intent',
                            accent: 'amber',
                            body: (
                                <>
                                    Your paragraph becomes domain, topics, and an{' '}
                                    <strong className="text-text-primary">embedding_text</strong> for similarity. Claude
                                    structures; it does not replace the numeric score.
                                </>
                            ),
                        },
                        {
                            n: '2',
                            title: 'Live search (Linkup)',
                            accent: 'teal',
                            body: (
                                <>
                                    We search the web for faculty and paper signals at{' '}
                                    <strong className="text-text-primary">Columbia</strong>,{' '}
                                    <strong className="text-text-primary">NYU</strong>, or{' '}
                                    <strong className="text-text-primary">both</strong> (merged, deduped). No invented
                                    names.
                                </>
                            ),
                        },
                        {
                            n: '3',
                            title: 'Verification',
                            accent: 'purple',
                            body: (
                                <>
                                    arXiv and NSF Awards add independent signals. We use them to filter or flag thin
                                    rows — not as a perfect proxy for quality.
                                </>
                            ),
                        },
                        {
                            n: '4',
                            title: 'Embeddings',
                            accent: 'amber',
                            body: (
                                <>
                                    A local sentence-transformers model embeds your intent and professor text. Alignment
                                    is <strong className="text-text-primary">cosine similarity</strong>, shown on cards
                                    and in the explainability panel.
                                </>
                            ),
                        },
                        {
                            n: '5',
                            title: 'Synthesis',
                            accent: 'teal',
                            body: (
                                <>
                                    Claude writes cards, seed ideas, and emails from structured JSON — constrained to
                                    supplied titles and abstracts.
                                </>
                            ),
                        },
                    ].map((step) => (
                        <li key={step.n} className="glass-card glass-card-shine p-6 sm:p-7">
                            <div className="mb-3 flex items-center gap-3">
                                <span
                                    className={`flex h-9 w-9 items-center justify-center rounded-xl border font-mono text-sm font-medium ${
                                        step.accent === 'amber'
                                            ? 'border-accent-amber/35 bg-accent-amber/10 text-accent-amber'
                                            : step.accent === 'teal'
                                              ? 'border-accent-teal/35 bg-accent-teal/10 text-accent-teal'
                                              : 'border-accent-purple/35 bg-accent-purple/10 text-accent-purple'
                                    }`}
                                >
                                    {step.n}
                                </span>
                                <h2 className="font-display text-xl text-text-primary">{step.title}</h2>
                            </div>
                            <p className="pl-0 font-body text-sm leading-relaxed text-text-secondary sm:pl-12">{step.body}</p>
                        </li>
                    ))}
                </ol>

                <div className="mt-10 rounded-2xl border border-accent-purple/20 bg-gradient-to-br from-accent-purple/10 to-transparent p-6">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-accent-purple">Optional</p>
                    <p className="mt-2 font-body text-sm text-text-secondary">
                        The professor portal registers a noisy embedding of &ldquo;skills needed&rdquo; — raw text is not
                        retained for matching.
                    </p>
                </div>

                <Link
                    href="/"
                    className="mt-12 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3 font-body text-sm font-semibold text-stone-950 shadow-glow-amber transition-transform hover:scale-[1.02]"
                >
                    ← Start a search
                </Link>
            </main>

            <SiteFooter />
        </div>
    );
}
