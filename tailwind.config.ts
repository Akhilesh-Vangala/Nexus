import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: 'class',
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': '#070a12',
                'bg-secondary': '#0c101c',
                'bg-tertiary': '#141b2e',
                'bg-hover': '#1a2238',
                'accent-amber': '#e8a317',
                'accent-teal': '#2dd4bf',
                'accent-coral': '#f87171',
                'accent-purple': '#a78bfa',
                'text-primary': '#f4f3ee',
                'text-secondary': '#a1a7b3',
                'text-tertiary': '#6b7289',
            },
            fontFamily: {
                display: ['Cormorant Garamond', 'Georgia', 'serif'],
                body: ['DM Sans', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
            },
            boxShadow: {
                'glow-amber': '0 0 40px rgba(232,163,23,0.14), 0 0 0 1px rgba(232,163,23,0.06) inset',
                'glow-teal': '0 0 40px rgba(45,212,191,0.12), 0 0 0 1px rgba(45,212,191,0.05) inset',
                'glow-purple': '0 0 40px rgba(167,139,250,0.14), 0 0 0 1px rgba(167,139,250,0.06) inset',
                'elevated': '0 32px 64px -20px rgba(0,0,0,0.75)',
            },
            backgroundImage: {
                'radial-fade': 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,163,23,0.09), transparent 55%)',
                'mesh-header':
                    'linear-gradient(180deg, rgba(12,16,28,0.95) 0%, rgba(7,10,18,0.85) 100%)',
            },
            animation: {
                'fade-up': 'fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards',
            },
            keyframes: {
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
};
export default config;
