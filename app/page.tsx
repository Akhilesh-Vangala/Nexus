'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchInput from '@/components/SearchInput';
import { motion } from 'framer-motion';

export default function Home() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (query: string, university: string, level: string, background: string) => {
        setIsLoading(true);

        // Store search params in sessionStorage for results page
        sessionStorage.setItem('searchParams', JSON.stringify({
            student_interest: query,
            university,
            student_level: level,
            student_background: background,
        }));

        router.push('/results');
    };

    return (
        <main className="min-h-screen dot-grid-animated flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Subtle radial gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/50 to-bg-primary pointer-events-none" />

            <div className="relative z-10 max-w-3xl w-full text-center">
                {/* Logo / Title */}
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="font-display text-7xl md:text-8xl font-bold text-text-primary mb-4"
                    style={{ textShadow: '0 0 60px rgba(245,158,11,0.15)' }}
                >
                    LabLens
                </motion.h1>

                {/* Tagline */}
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="font-display text-xl md:text-2xl text-text-secondary mb-2"
                >
                    Find your research home.
                </motion.p>
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="font-body text-lg text-text-tertiary mb-6"
                >
                    Before you send a single email.
                </motion.p>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="font-body text-sm text-text-tertiary mb-6 max-w-xl mx-auto"
                >
                    Semantic research matching for Columbia &amp; NYU students — powered by live intelligence.
                </motion.p>

                {/* Feature badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="flex flex-wrap justify-center gap-3 mb-10"
                >
                    <Badge icon="⚡" text="Live research data" color="amber" />
                    <Badge icon="🧠" text="ML alignment scoring" color="purple" />
                    <Badge icon="🔗" text="Linkup Search" color="teal" />
                    <Badge icon="✦" text="Claude AI" color="default" />
                </motion.div>

                {/* Search Input */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <SearchInput onSearch={handleSearch} isLoading={isLoading} />
                </motion.div>

                {/* Professor portal link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-12"
                >
                    <a
                        href="/professor-portal"
                        className="text-sm text-text-tertiary hover:text-accent-purple transition-colors font-mono"
                    >
                        Are you a professor? →
                    </a>
                </motion.div>
            </div>
        </main>
    );
}

function Badge({ icon, text, color }: { icon: string; text: string; color: string }) {
    const colorClasses: Record<string, string> = {
        amber: 'border-accent-amber/30 text-accent-amber',
        teal: 'border-accent-teal/30 text-accent-teal',
        purple: 'border-accent-purple/30 text-accent-purple',
        default: 'border-white/10 text-text-secondary',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono ${colorClasses[color] || colorClasses.default}`}>
            <span>{icon}</span>
            {text}
        </span>
    );
}
