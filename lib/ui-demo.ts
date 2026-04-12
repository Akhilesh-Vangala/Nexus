/** UI-only / demo mode: full frontend without backend. Toggle via session flag. */

export const UI_DEMO_KEY = 'lablens_ui_demo';

export function isUiDemoClient(): boolean {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(UI_DEMO_KEY) === '1';
}

export function setUiDemo(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(UI_DEMO_KEY, '1');
}

export function clearUiDemo(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(UI_DEMO_KEY);
}
