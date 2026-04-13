/**
 * API base URL. Calls FastAPI directly to avoid Next.js proxy timeout.
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
