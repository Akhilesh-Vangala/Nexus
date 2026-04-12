'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchInput from '@/components/SearchInput';
import SiteFooter from '@/components/SiteFooter';
import { motion } from 'framer-motion';

export default function Home() {
    const router = useRouter();

    return (
        <>
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-[20%] top-[10%] h-[520px] w-[520px] rounded-full bg-accent-purple/[0.09] blur-[100px] animate-aurora" />
                <div className="absolute -right-[15%] top-[35%] h-[480px] w-[480px] rounded-full bg-accent-teal/[0.08] blur-[100px] animate-aurora-delayed" />
                <div className="absolute bottom-[-10%] left-[25%] h-[400px] w-[400px] rounded-full bg-accent-amber/[0.06] blur-[90px] animate-aurora" />
                <div className="noise-overlay" aria-hidden />
            </div>

            <main
                id="main-content"
                className="relative flex min-h-screen flex-col items-center justify-center px-4 py-24 dot-grid-animated sm:py-28"
            >
                <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg-primary/20 via-transparent to-bg-primary" />

                <nav className="absolute left-0 right-0 top-0 z-20 flex justify-center px-4 pt-6 sm:px-8">
                    <div className="flex w-full max-w-4xl items-center justify-between rounded-full border border-white/[0.08] bg-bg-primary/50 px-4 py-2.5 shadow-elevated backdrop-blur-xl supports-[backdrop-filter]:bg-bg-primary/35 sm:px-6">
                        <span className="font-display text-xl font-semibold tracking-wide text-text-primary">
                            LabLens
                        </span>
                        <div className="flex items-center gap-1 sm:gap-3">
                            <Link
                                href="/methodology"
                                className="rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-colors hover:bg-white/[0.06] hover:text-accent-amber sm:text-[11px]"
                            >
                                How it works
                            </Link>
                            <Link
                                href="/shortlist"
                                className="rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-colors hover:bg-white/[0.06] hover:text-accent-purple sm:text-[11px]"
                            >
                                Shortlist
                            </Link>
                            <Link
                                href="/professor-portal"
                                className="ml-1 rounded-full border border-accent-teal/25 bg-accent-teal/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-accent-teal transition-colors hover:border-accent-teal/45 hover:bg-accent-teal/15 sm:text-[11px]"
                            >
                                Professors
                            </Link>
                        </div>
                    </div>
                </nav>

                <div className="relative z-10 mx-auto w-full max-w-3xl pt-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary"
                    >
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-teal shadow-glow-teal" />
                        Research intelligence
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.85, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                        className="font-display text-6xl font-semibold leading-[0.95] tracking-tight sm:text-7xl md:text-8xl md:leading-[0.92]"
                    >
                        <span className="text-gradient-gold">LabLens</span>
                    </motion.h1>

                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="mx-auto mt-6 h-px max-w-xs origin-center bg-gradient-to-r from-transparent via-accent-amber/50 to-transparent"
                    />

                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.75, delay: 0.2 }}
                        className="mt-6 font-display text-2xl font-medium italic text-text-secondary sm:text-3xl"
                    >
                        Find your research home.
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.32 }}
                        className="mx-auto mt-3 max-w-lg font-body text-sm leading-relaxed text-text-tertiary sm:text-base"
                    >
                        Columbia &amp; NYU — live faculty signals, semantic fit scores, funding context, and outreach
                        drafts grounded in real papers.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-3"
                    >
                        <Badge icon="⚡" text="Linkup" color="teal" />
                        <Badge icon="📐" text="Embeddings" color="purple" />
                        <Badge icon="✦" text="Claude" color="amber" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.85, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-14 w-full"
                    >
                        <SearchInput
                            onSearch={(payload) => {
                                sessionStorage.setItem('searchParams', JSON.stringify(payload));
                                router.push('/results');
                            }}
                        />
                    </motion.div>
                </div>
            </main>

            <SiteFooter />
        </>
    );
}

function Badge({ icon, text, color }: { icon: string; text: string; color: string }) {
    const colorClasses: Record<string, string> = {
        amber:
            'border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.12] to-transparent text-accent-amber shadow-[0_0_24px_-4px_rgba(232,163,23,0.25)]',
        teal:
            'border-accent-teal/30 bg-gradient-to-br from-accent-teal/[0.1] to-transparent text-accent-teal shadow-[0_0_24px_-4px_rgba(45,212,191,0.2)]',
        purple:
            'border-accent-purple/30 bg-gradient-to-br from-accent-purple/[0.1] to-transparent text-accent-purple shadow-[0_0_24px_-4px_rgba(167,139,250,0.2)]',
        default: 'border-white/10 bg-white/[0.04] text-text-secondary',
    };

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-wider sm:text-xs ${colorClasses[color] || colorClasses.default}`}
        >
            <span aria-hidden className="text-sm opacity-90">
                {icon}
            </span>
            {text}
        </span>
    );
}
