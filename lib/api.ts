/**
 * API base URL for browser and server.
 * In dev, we call FastAPI directly to avoid Next.js proxy timeout on long requests.
 * Set NEXT_PUBLIC_API_URL to override (e.g. deployed API).
 */
export function getApiBaseUrl(): string {
    const env = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    if (env) return env;
    return 'http://localhost:8000';
}

export function apiUrl(path: string): string {
    const base = getApiBaseUrl();
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
}
