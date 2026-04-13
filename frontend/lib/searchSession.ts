import type { SearchResponse } from './types';

export type SchoolScope = 'columbia' | 'nyu' | 'both';

/** Stored in sessionStorage as `searchParams` — includes UI-only filters applied on results. */
export interface ClientSearchParams {
    student_interest: string;
    student_level: string;
    student_background: string;
    school_scope: SchoolScope;
    department_filter: string;
    require_grant: boolean;
    min_alignment: number;
}

export function schoolScopeToUniversity(scope: SchoolScope): string {
    if (scope === 'columbia') return 'Columbia University';
    if (scope === 'nyu') return 'NYU';
    return 'Columbia University';
}

/** Support legacy session payloads from before school_scope existed. */
export function normalizeClientSearchParams(raw: Record<string, unknown>): ClientSearchParams {
    if (raw.school_scope && typeof raw.student_interest === 'string') {
        return raw as unknown as ClientSearchParams;
    }
    const u = String(raw.university || 'Columbia University');
    let school_scope: SchoolScope = 'columbia';
    if (u.includes('NYU') && !u.includes('Columbia')) school_scope = 'nyu';
    return {
        student_interest: String(raw.student_interest || ''),
        student_level: String(raw.student_level || 'masters'),
        student_background: String(raw.student_background || ''),
        school_scope,
        department_filter: '',
        require_grant: false,
        min_alignment: 0,
    };
}

/** Last ranked professors for “similar” suggestions on profile pages. */
const LAST_RESULTS_KEY = 'nexus_last_results';

export function saveLastSearchResults(professors: SearchResponse['professors']) {
    if (typeof window === 'undefined') return;
    try {
        sessionStorage.setItem(LAST_RESULTS_KEY, JSON.stringify(professors));
    } catch {
        /* ignore */
    }
}

export function loadLastSearchResults(): SearchResponse['professors'] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = sessionStorage.getItem(LAST_RESULTS_KEY);
        if (!raw) return [];
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}
