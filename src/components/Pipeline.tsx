import { Check, Loader2, Circle } from "lucide-react";
import type { PipelineStageId } from "@/lib/api";

export const STAGES: { id: PipelineStageId; label: string; note: string }[] = [
  { id: "input", label: "Uploading", note: "Sentinel-2 scene" },
  { id: "preprocess", label: "Pre-processing", note: "Radiometric scaling, tiling" },
  { id: "superres", label: "AI Super-Resolution", note: "Mock inference (backend pending)" },
  { id: "spectral", label: "Spectral Check", note: "Band ratios and values" },
  { id: "spatial", label: "Spatial Check", note: "Geometry and alignment" },
  { id: "uncertainty", label: "Uncertainty", note: "Trust surface (demo)" },
  { id: "output", label: "Enhanced Product", note: "Target <4 m detail" },
];

export type StageState = "done" | "active" | "pending";

export function stageStates(current: PipelineStageId | null, finished: boolean) {
  const idx = current ? STAGES.findIndex((s) => s.id === current) : -1;
  return STAGES.map((s, i): StageState => {
    if (finished) return "done";
    if (idx < 0) return "pending";
    if (i < idx) return "done";
    if (i === idx) return "active";
    return "pending";
  });
}

export function Pipeline({
  current,
  finished,
}: {
  current: PipelineStageId | null;
  finished: boolean;
}) {
  const states = stageStates(current, finished);
  const doneCount = states.filter((s) => s === "done").length;
  const progress = Math.round(((doneCount + (finished ? 0 : 0.4)) / STAGES.length) * 100);

  return (
    <div>
      <div className="grid gap-3 lg:grid-cols-6">
        {STAGES.map((stage, i) => {
          const state = states[i];
          return (
            <div
              key={stage.id}
              className={`rounded-xl border p-3 transition-colors ${
                state === "done"
                  ? "border-accent/40 bg-accent/10"
                  : state === "active"
                    ? "border-primary/50 bg-primary/10"
                    : "border-border bg-background/30"
              }`}
            >
              <div className="flex items-center gap-2">
                {state === "done" ? (
                  <Check className="size-4 text-accent" />
                ) : state === "active" ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <Circle className="size-4 text-muted-foreground" />
                )}
                <span className="label-mono">step {i + 1}</span>
              </div>
              <p className="mt-2 text-sm font-medium leading-tight">{stage.label}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{stage.note}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
            style={{ width: `${Math.min(100, finished ? 100 : progress)}%` }}
          />
        </div>
        <ul className="mt-3 space-y-1 font-mono text-[11px] text-muted-foreground">
          {STAGES.map((stage, i) => (
            <li key={stage.id}>
              {states[i] === "done" ? "✓" : states[i] === "active" ? "⟳" : "○"} {stage.label}
              {states[i] === "done" ? " complete" : states[i] === "active" ? " running" : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
