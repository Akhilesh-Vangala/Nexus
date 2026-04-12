import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'LabLens — Find Your Research Home',
    description: 'AI-powered research alignment engine. Semantic matching to professors whose active, funded research aligns with your intellectual interests.',
    keywords: ['research', 'professor matching', 'academic', 'ML', 'Columbia', 'NYU'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="font-body antialiased">
                {children}
            </body>
        </html>
    )
}
