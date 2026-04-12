import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import PageBackdrop from '@/components/PageBackdrop';

export default function NotFound() {
    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg-primary">
            <PageBackdrop />
            <SiteHeader />
            <main
                id="main-content"
                className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-20 text-center"
            >
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">404</p>
                <h1 className="mt-3 font-display text-4xl font-semibold text-text-primary sm:text-5xl">
                    <span className="text-gradient-gold">Off the map</span>
                </h1>
                <p className="mt-4 max-w-md font-body text-sm text-text-secondary">
                    That path does not exist in this build. Head home to run a search or open the demo UI.
                </p>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="rounded-full bg-gradient-to-r from-accent-amber/90 to-accent-purple/80 px-6 py-2.5 font-mono text-[10px] uppercase tracking-wider text-bg-primary shadow-lg shadow-accent-purple/25"
                    >
                        Home
                    </Link>
                    <Link
                        href="/methodology"
                        className="rounded-full border border-white/[0.1] px-5 py-2.5 font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-colors hover:border-accent-teal/40 hover:text-accent-teal"
                    >
                        How it works
                    </Link>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
