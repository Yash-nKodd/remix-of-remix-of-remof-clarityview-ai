import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Layers,
  Info,
  Satellite,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/enhancement", label: "Image Enhancement", icon: Sparkles },
  { to: "/results", label: "Results", icon: BarChart3 },
  { to: "/validation", label: "Validation", icon: ShieldCheck },
  { to: "/applications", label: "Applications", icon: Layers },
  { to: "/about", label: "About Project", icon: Info },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside
        className={`${open ? "block" : "hidden"} border-r border-border bg-surface/70 backdrop-blur-xl lg:sticky lg:top-0 lg:block lg:h-screen`}
      >
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
            <Satellite className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">AI Satellite SR</p>
            <p className="label-mono">SIH 2026</p>
          </div>
        </div>
        <nav className="space-y-1 px-3 pb-6">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
              activeProps={{
                className:
                  "bg-primary/15 text-foreground ring-1 ring-primary/30 [&_svg]:text-primary",
              }}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mx-3 rounded-lg border border-border bg-background/40 p-3">
          <p className="label-mono">Model status</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Mock inference backend. Python / PyTorch service not yet connected.
          </p>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 px-5 py-4 backdrop-blur-xl">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {open ? <X /> : <Menu />}
          </Button>
          <div>
            <h1 className="text-base font-semibold sm:text-lg">AI Satellite Super-Resolution</h1>
            <p className="text-xs text-muted-foreground">
              Enhancing Sentinel-2 imagery for fine-scale Earth observation
            </p>
          </div>
          <span className="ml-auto hidden rounded-full border border-signal/40 bg-signal/10 px-3 py-1 text-[11px] font-medium text-signal sm:inline">
            Demo / Simulated Evaluation
          </span>
        </header>
        <main className="flex-1 px-5 py-6 lg:px-8">{children}</main>
        <footer className="border-t border-border px-5 py-4 text-[11px] text-muted-foreground lg:px-8">
          AI-enhanced details are inferred from learned patterns and are not direct observations.
          High-resolution reference data is required for quantitative validation.
        </footer>
      </div>
    </div>
  );
}
