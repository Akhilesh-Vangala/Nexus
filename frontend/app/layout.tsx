import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Nexus — Find Your Research Home',
    description: 'AI-powered research alignment engine. Semantic matching to professors whose active, funded research aligns with your intellectual interests.',
    keywords: ['research', 'professor matching', 'academic', 'ML', 'Columbia', 'NYU'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark scroll-smooth">
            <body className="relative min-h-screen bg-bg-primary font-body text-text-primary antialiased [color-scheme:dark] selection:bg-accent-amber/25 selection:text-text-primary">
                <a
                    href="#main-content"
                    className="absolute left-[-9999px] top-4 z-[100] rounded-lg bg-accent-amber px-4 py-2 font-mono text-sm text-stone-950 shadow-lg transition-none focus:left-4 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-stone-900"
                >
                    Skip to content
                </a>
                {children}
            </body>
        </html>
    )
}
