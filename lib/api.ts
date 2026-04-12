/**
 * API base URL for browser and server.
 * In dev, Next.js rewrites `/api/*` → FastAPI (see next.config.mjs).
 * Set NEXT_PUBLIC_API_URL to override (e.g. deployed API).
 */
export function getApiBaseUrl(): string {
    const env = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    if (env) return env;
    if (typeof window !== 'undefined') return '';
    return 'http://127.0.0.1:8000';
}

export function apiUrl(path: string): string {
    const base = getApiBaseUrl();
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
}
