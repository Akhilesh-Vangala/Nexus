/** Shared atmospheric background for inner pages. */
export default function PageBackdrop({ subtle }: { subtle?: boolean }) {
    return (
        <div className="pointer-events-none fixed inset-0" aria-hidden>
            {!subtle && (
                <>
                    <div className="absolute -right-[20%] top-0 h-[420px] w-[420px] rounded-full bg-accent-purple/[0.06] blur-[100px]" />
                    <div className="absolute -left-[15%] bottom-0 h-[380px] w-[380px] rounded-full bg-accent-teal/[0.05] blur-[90px]" />
                </>
            )}
            {subtle && (
                <div className="absolute right-0 top-1/3 h-[280px] w-[280px] rounded-full bg-accent-amber/[0.04] blur-[90px]" />
            )}
            <div className="noise-overlay opacity-[0.1]" />
        </div>
    );
}
