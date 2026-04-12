import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';

export const metadata = {
    title: 'How LabLens works — LabLens',
    description: 'Pipeline: intent extraction, Linkup search, verification, embeddings, and grounded synthesis.',
};

export default function MethodologyPage() {
    return (
        <div className="flex min-h-screen flex-col bg-bg-primary">
            <header className="border-b border-white/[0.06] bg-bg-secondary/40">
                <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
                    <Link href="/" className="font-display text-lg text-text-primary hover:text-accent-amber">
                        LabLens
                    </Link>
                    <Link href="/shortlist" className="font-mono text-xs text-text-tertiary hover:text-accent-purple">
                        Shortlist →
                    </Link>
                </div>
            </header>

            <main id="main-content" className="mx-auto max-w-3xl flex-1 px-4 py-12 sm:px-6">
                <h1 className="mb-4 font-display text-3xl text-text-primary">How LabLens works</h1>
                <p className="mb-10 font-body text-text-secondary">
                    A practical pipeline for student → professor fit: live retrieval, measurable similarity, and
                    text generation that stays tied to evidence.
                </p>

                <ol className="space-y-8 font-body text-sm text-text-secondary">
                    <li className="border-l-2 border-accent-amber/40 pl-5">
                        <h2 className="mb-2 font-display text-lg text-text-primary">1. Intent</h2>
                        <p>
                            Your paragraph is structured into domain, topics, and an{' '}
                            <strong className="text-text-primary">embedding_text</strong> optimized for similarity
                            against research text. Claude does structuring; it is not the similarity score.
                        </p>
                    </li>
                    <li className="border-l-2 border-accent-teal/40 pl-5">
                        <h2 className="mb-2 font-display text-lg text-text-primary">2. Live search (Linkup)</h2>
                        <p>
                            We query the open web for faculty, labs, and paper signals at{' '}
                            <strong className="text-text-primary">Columbia</strong> or <strong className="text-text-primary">NYU</strong>{' '}
                            (or <strong className="text-text-primary">both</strong>, merged and deduped). No invented
                            faculty: names and hints come from retrieved content.
                        </p>
                    </li>
                    <li className="border-l-2 border-accent-purple/40 pl-5">
                        <h2 className="mb-2 font-display text-lg text-text-primary">3. Verification</h2>
                        <p>
                            arXiv and NSF Awards add independent signals (recency, funding). We use them to filter or flag
                            uncertain rows—not as a perfect measure of quality.
                        </p>
                    </li>
                    <li className="border-l-2 border-accent-amber/40 pl-5">
                        <h2 className="mb-2 font-display text-lg text-text-primary">4. Embeddings</h2>
                        <p>
                            A local sentence-transformers model embeds your intent and professor abstracts. Alignment is{' '}
                            <strong className="text-text-primary">cosine similarity</strong>, surfaced on cards and the
                            explainability panel.
                        </p>
                    </li>
                    <li className="border-l-2 border-accent-teal/40 pl-5">
                        <h2 className="mb-2 font-display text-lg text-text-primary">5. Synthesis</h2>
                        <p>
                            Claude turns structured results into readable cards, seed ideas, and email drafts. Prompts
                            require staying within supplied titles and abstracts so outreach stays grounded.
                        </p>
                    </li>
                </ol>

                <div className="mt-12 rounded-xl border border-white/[0.08] bg-bg-secondary/50 p-6">
                    <p className="font-mono text-xs text-text-tertiary">
                        Privacy tier (professor portal) is optional for demos: professors can register a noisy embedding
                        of &ldquo;skills needed&rdquo; without storing raw text.
                    </p>
                </div>

                <Link
                    href="/"
                    className="mt-10 inline-block rounded-xl bg-accent-amber/20 px-6 py-3 font-mono text-sm text-accent-amber hover:bg-accent-amber/30"
                >
                    ← Start a search
                </Link>
            </main>

            <SiteFooter />
        </div>
    );
}
