import { useCallback, useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, MoveHorizontal, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

type Props = {
  originalUrl: string;
  enhancedUrl: string;
  /** CSS filter used to simulate the coarser 10 m input product. */
  degrade?: string;
  /** Subtle detail lift for the enhanced side — no aggressive sharpening. */
  enhance?: string;
  /** Demo mode = output is simulated, not a verified <4 m product. */
  demo?: boolean;
  inputSource?: string;
  /** Images already carry the degrade/enhance treatment — skip CSS filters. */
  preprocessed?: boolean;
};

export function CompareViewer({
  originalUrl,
  enhancedUrl,
  degrade = "blur(2.2px) saturate(0.94) contrast(0.96)",
  enhance = "saturate(1.03) contrast(1.03)",
  demo = true,
  inputSource = "Sentinel-2",
  preprocessed = false,
}: Props) {
  const degradeFilter = preprocessed ? "none" : degrade;
  const enhanceFilter = preprocessed ? "none" : enhance;
  const containerRef = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef<null | { mode: "pan" | "split"; x: number; y: number }>(null);

  const state = useRef({ zoom, offset });
  state.current = { zoom, offset };

  const zoomAt = useCallback((next: number, px: number, py: number) => {
    const { zoom: z, offset: o } = state.current;
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    const k = clamped / z;
    setZoom(clamped);
    setOffset({ x: px - (px - o.x) * k, y: py - (py - o.y) * k });
  }, []);

  const wheelRef = useRef<(e: WheelEvent) => void>(() => {});
  wheelRef.current = (e: WheelEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    zoomAt(
      state.current.zoom * Math.exp(-dy * 0.0018),
      e.clientX - rect.left,
      e.clientY - rect.top,
    );
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelRef.current(e);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const splitFromEvent = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return split;
    const rect = el.getBoundingClientRect();
    return Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const relX = splitFromEvent(e.clientX);
    // Generous grab zone so touch users can catch the handle easily.
    const mode = Math.abs(relX - split) < 6 ? "split" : "pan";
    dragging.current = { mode, x: e.clientX, y: e.clientY };
    el.setPointerCapture(e.pointerId);
    if (mode === "split") setSplit(relX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragging.current;
    if (!d) return;
    if (d.mode === "split") {
      setSplit(splitFromEvent(e.clientX));
    } else {
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      dragging.current = { ...d, x: e.clientX, y: e.clientY };
      setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
    }
  };

  const endDrag = () => {
    dragging.current = null;
  };

  const onHandleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setSplit((s) => Math.max(0, s - 2));
    if (e.key === "ArrowRight") setSplit((s) => Math.min(100, s + 2));
  };

  const reset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSplit(50);
  };

  const centerZoom = (factor: number) => {
    const el = containerRef.current;
    if (!el) return;
    zoomAt(state.current.zoom * factor, el.clientWidth / 2, el.clientHeight / 2);
  };

  const fullscreen = () => {
    void containerRef.current?.requestFullscreen?.();
  };

  const transform = `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`;

  return (
    <div className="w-full max-w-full">
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        className="relative aspect-[4/3] w-full max-w-full cursor-grab touch-none select-none overflow-hidden rounded-xl border border-border bg-[#0a0f14] active:cursor-grabbing sm:aspect-[16/10]"
      >
        <div className="absolute inset-0 origin-top-left" style={{ transform }}>
          <img
            src={enhancedUrl}
            alt="AI-enhanced super-resolved satellite product"
            className="absolute inset-0 size-full object-cover"
            style={{ filter: enhanceFilter }}
            draggable={false}
          />
        </div>
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
        >
          <div className="absolute inset-0 origin-top-left" style={{ transform }}>
            <img
              src={originalUrl}
              alt="Original Sentinel-2 image at approximately 10 m resolution"
              className="absolute inset-0 size-full object-cover"
              style={{ filter: degradeFilter }}
              draggable={false}
            />
          </div>
        </div>

        {/* Slider */}
        <div
          className="pointer-events-none absolute inset-y-0 z-20 w-0.5 bg-primary/90 shadow-[0_0_14px_rgba(80,180,220,0.65)]"
          style={{ left: `${split}%` }}
        >
          <div
            role="slider"
            tabIndex={0}
            aria-label="Comparison position"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(split)}
            onKeyDown={onHandleKeyDown}
            className="pointer-events-auto absolute top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-primary/70 bg-background/90 text-primary shadow-lg outline-none ring-primary/40 backdrop-blur focus-visible:ring-2"
          >
            <MoveHorizontal className="size-4" />
          </div>
        </div>

        {/* Fixed labels */}
        <div className="pointer-events-none absolute left-2 top-2 z-10 max-w-[45%] rounded-md border border-border bg-background/80 px-2.5 py-1.5 backdrop-blur sm:left-3 sm:top-3">
          <p className="truncate text-[11px] font-medium sm:text-xs">Original Sentinel-2</p>
          <p className="label-mono">INPUT · ~10 m</p>
        </div>
        <div className="pointer-events-none absolute right-2 top-2 z-10 max-w-[45%] rounded-md border border-accent/40 bg-background/80 px-2.5 py-1.5 text-right backdrop-blur sm:right-3 sm:top-3">
          <p className="truncate text-[11px] font-medium text-accent sm:text-xs">
            AI-Enhanced Product
          </p>
          <p className="label-mono">TARGET · &lt;4 m</p>
        </div>
        {demo ? (
          <div className="pointer-events-none absolute bottom-2 right-2 z-10 rounded-full border border-signal/40 bg-background/85 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-signal backdrop-blur sm:bottom-3 sm:right-3">
            Demo / Simulated output
          </div>
        ) : null}
        <div className="pointer-events-none absolute bottom-2 left-2 z-10 rounded-md border border-border bg-background/80 px-2 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur sm:bottom-3 sm:left-3 sm:text-[11px]">
          zoom {zoom.toFixed(2)}×
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ViewerButton onClick={() => centerZoom(1.4)} icon={<ZoomIn />}>
          Zoom in
        </ViewerButton>
        <ViewerButton onClick={() => centerZoom(1 / 1.4)} icon={<ZoomOut />}>
          Zoom out
        </ViewerButton>
        <ViewerButton onClick={reset} icon={<RotateCcw />}>
          Reset view
        </ViewerButton>
        <ViewerButton onClick={fullscreen} icon={<Maximize2 />}>
          Fullscreen
        </ViewerButton>
        <span className="w-full text-[11px] text-muted-foreground sm:ml-auto sm:w-auto sm:text-right">
          Drag the handle to compare · drag the image to pan · scroll to zoom
        </span>
      </div>

      {/* Metadata lives outside the imagery, never burned into it. */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-background/40 p-4">
          <p className="label-mono">Input</p>
          <dl className="mt-2 space-y-1 text-xs">
            <MetaRow term="Resolution" value="~10 m" />
            <MetaRow term="Source" value={inputSource} />
          </dl>
        </div>
        <div className="rounded-lg border border-accent/30 bg-background/40 p-4">
          <p className="label-mono text-accent">Output</p>
          <dl className="mt-2 space-y-1 text-xs">
            <MetaRow term="Target" value="<4 m" />
            <MetaRow term="Mode" value={demo ? "Demo" : "Model"} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{term}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  );
}

function ViewerButton({
  children,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      {icon}
      {children}
    </Button>
  );
}
