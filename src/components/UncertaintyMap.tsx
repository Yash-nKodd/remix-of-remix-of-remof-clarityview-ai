export function UncertaintyMap({ imageUrl }: { imageUrl: string }) {
  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border">
        <img
          src={imageUrl}
          alt="Enhanced satellite product with AI confidence overlay"
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
        />
        <div
          className="absolute inset-0 mix-blend-screen opacity-75"
          style={{
            backgroundImage: `
              radial-gradient(28% 26% at 22% 28%, rgba(239,68,68,0.85), transparent 70%),
              radial-gradient(22% 20% at 68% 24%, rgba(249,168,37,0.8), transparent 70%),
              radial-gradient(30% 30% at 74% 72%, rgba(239,68,68,0.6), transparent 72%),
              radial-gradient(40% 38% at 40% 62%, rgba(34,197,94,0.7), transparent 72%),
              radial-gradient(60% 60% at 50% 50%, rgba(20,120,180,0.55), transparent 80%)
            `,
          }}
        />
        <span className="absolute left-3 top-3 rounded-md border border-border bg-background/80 px-2 py-1 text-[11px] backdrop-blur">
          Prototype uncertainty visualization
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="label-mono">Low confidence</span>
        <div
          className="h-2 flex-1 rounded-full"
          style={{
            background: "linear-gradient(90deg,#ef4444,#f59e0b,#22c55e,#38bdf8)",
          }}
        />
        <span className="label-mono">High confidence</span>
      </div>
    </div>
  );
}
