import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': '#0B0E1A',
                'bg-secondary': '#111827',
                'bg-tertiary': '#1A2035',
                'bg-hover': '#1E2840',
                'accent-amber': '#F59E0B',
                'accent-teal': '#14B8A6',
                'accent-coral': '#F87171',
                'accent-purple': '#8B5CF6',
                'text-primary': '#F1F0EB',
                'text-secondary': '#9CA3AF',
                'text-tertiary': '#6B7280',
            },
            fontFamily: {
                display: ['Playfair Display', 'serif'],
                body: ['DM Sans', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                'glow-amber': '0 0 20px rgba(245,158,11,0.15)',
                'glow-teal': '0 0 20px rgba(20,184,166,0.15)',
                'glow-purple': '0 0 20px rgba(139,92,246,0.15)',
            },
        },
    },
    plugins: [],
}
export default config
