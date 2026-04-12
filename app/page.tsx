'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchInput from '@/components/SearchInput';
import SiteFooter from '@/components/SiteFooter';
import { motion } from 'framer-motion';

export default function Home() {
    const router = useRouter();

    const handleSearch = (query: string, university: string, level: string, background: string) => {
        sessionStorage.setItem(
            'searchParams',
            JSON.stringify({
                student_interest: query,
                university,
                student_level: level,
                student_background: background,
            })
        );
        router.push('/results');
    };

    return (
        <>
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-accent-purple/[0.07] blur-3xl" />
                <div className="absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-accent-teal/[0.06] blur-3xl" />
            </div>

            <main
                id="main-content"
                className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 dot-grid-animated"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/40 to-bg-primary pointer-events-none" />

                <nav className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 py-5 sm:px-8">
                    <span className="font-display text-lg font-semibold text-text-primary/90">LabLens</span>
                    <Link
                        href="/professor-portal"
                        className="pointer-events-auto font-mono text-xs text-text-tertiary transition-colors hover:text-accent-purple"
                    >
                        Professor portal →
                    </Link>
                </nav>

                <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="font-display text-6xl font-bold tracking-tight text-text-primary sm:text-7xl md:text-8xl"
                        style={{ textShadow: '0 0 60px rgba(245,158,11,0.12)' }}
                    >
                        LabLens
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                        className="mt-2 font-display text-xl text-text-secondary sm:text-2xl"
                    >
                        Find your research home.
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="mt-2 font-body text-base text-text-tertiary"
                    >
                        Before you send a single email.
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.28 }}
                        className="mx-auto mt-8 max-w-lg font-body text-sm leading-relaxed text-text-tertiary"
                    >
                        Semantic research matching for Columbia &amp; NYU — live faculty signals, dense similarity scoring,
                        and outreach you can defend in one paragraph.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.36 }}
                        className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-3"
                    >
                        <Badge icon="⚡" text="Live research data" color="amber" />
                        <Badge icon="🧠" text="ML alignment scoring" color="purple" />
                        <Badge icon="🔗" text="Linkup Search" color="teal" />
                        <Badge icon="✦" text="Claude AI" color="default" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.44 }}
                        className="mt-12 w-full"
                    >
                        <SearchInput onSearch={handleSearch} />
                    </motion.div>
                </div>
            </main>

            <SiteFooter />
        </>
    );
}

function Badge({ icon, text, color }: { icon: string; text: string; color: string }) {
    const colorClasses: Record<string, string> = {
        amber: 'border-accent-amber/35 text-accent-amber bg-accent-amber/[0.06]',
        teal: 'border-accent-teal/35 text-accent-teal bg-accent-teal/[0.06]',
        purple: 'border-accent-purple/35 text-accent-purple bg-accent-purple/[0.06]',
        default: 'border-white/10 text-text-secondary bg-white/[0.03]',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] sm:text-xs ${colorClasses[color] || colorClasses.default}`}
        >
            <span aria-hidden>{icon}</span>
            {text}
        </span>
    );
}
