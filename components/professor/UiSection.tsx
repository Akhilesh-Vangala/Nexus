export function UiSection({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
    return (
        <section className="mb-8">
            <div className="mb-4 flex flex-col gap-1 border-b border-white/[0.06] pb-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h3 className="font-display text-xl font-medium tracking-tight text-text-primary sm:text-2xl">{title}</h3>
                    {subtitle && <p className="mt-1 max-w-2xl font-body text-xs text-text-tertiary">{subtitle}</p>}
                </div>
                <div className="hidden h-px w-24 bg-gradient-to-r from-accent-amber/50 to-transparent sm:block" />
            </div>
            {children}
        </section>
    );
}
