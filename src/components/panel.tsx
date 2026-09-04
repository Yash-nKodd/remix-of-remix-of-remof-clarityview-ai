import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("glass p-5", className)}>{children}</section>;
}

export function PanelTitle({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-sm font-semibold sm:text-base">{title}</h2>
        {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
      </div>
      {right}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "accent" | "primary";
}) {
  return (
    <div className="glass p-4">
      <p className="label-mono">{label}</p>
      <p
        className={cn(
          "mt-2 font-mono text-xl font-semibold",
          tone === "accent" && "text-accent",
          tone === "primary" && "text-primary",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function DemoBadge({ children = "Demo / Simulated Evaluation" }: { children?: string }) {
  return (
    <span className="rounded-full border border-signal/40 bg-signal/10 px-3 py-1 text-[11px] font-medium text-signal">
      {children}
    </span>
  );
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 rounded-lg border border-border bg-background/40 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}
