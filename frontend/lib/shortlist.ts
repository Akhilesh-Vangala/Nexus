import type { Professor } from './types';

const KEY = 'nexus_shortlist_v1';

export type ShortlistEntry = {
    id: string;
    name: string;
    university: string;
    alignment_score?: number;
    department?: string;
    savedAt: number;
};

function readRaw(): ShortlistEntry[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as ShortlistEntry[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function getShortlist(): ShortlistEntry[] {
    return readRaw().sort((a, b) => b.savedAt - a.savedAt);
}

export function shortlistCount(): number {
    return readRaw().length;
}

export function isInShortlist(id: string): boolean {
    return readRaw().some((e) => e.id === id);
}

export function notifyShortlistChanged() {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new Event('nexus-shortlist'));
}

export function toggleShortlist(prof: Professor): boolean {
    const list = readRaw();
    const idx = list.findIndex((e) => e.id === prof.id);
    if (idx >= 0) {
        list.splice(idx, 1);
        localStorage.setItem(KEY, JSON.stringify(list));
        notifyShortlistChanged();
        return false;
    }
    list.push({
        id: prof.id,
        name: prof.name,
        university: prof.university,
        alignment_score: prof.alignment_score,
        department: prof.department,
        savedAt: Date.now(),
    });
    localStorage.setItem(KEY, JSON.stringify(list));
    notifyShortlistChanged();
    return true;
}

export function removeShortlist(id: string) {
    const list = readRaw().filter((e) => e.id !== id);
    localStorage.setItem(KEY, JSON.stringify(list));
    notifyShortlistChanged();
}
