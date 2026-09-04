import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Panel, PanelTitle, Disclaimer, DemoBadge } from "@/components/panel";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Project — AI Satellite Super-Resolution" },
      {
        name: "description",
        content:
          "Problem statement, approach, architecture and honesty notes for the SIH 2026 AI-based satellite image super-resolution prototype.",
      },
      { property: "og:title", content: "About the Project — AI Satellite Super-Resolution" },
      {
        property: "og:description",
        content: "Problem, solution approach, key innovation and system architecture.",
      },
    ],
  }),
  component: AboutPage,
});

const FLOW = [
  "10 m Sentinel-2 input",
  "Preprocessing & tiling",
  "Super-resolution network",
  "Consistency checks",
  "Uncertainty estimation",
  "Enhanced <4 m product",
];

function AboutPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <Panel>
          <PanelTitle
            title="Problem statement"
            sub="Smart India Hackathon 2026 — AI-Based Satellite Image Super-Resolution"
            right={<DemoBadge />}
          />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Freely available Sentinel-2 imagery covers the whole country on a short revisit cycle,
            but its 10 m ground sampling distance is too coarse for plot-level agriculture, dense
            urban mapping and rapid damage assessment. Commercial sub-metre imagery closes that gap
            only at high cost and with tasking delays. The challenge is to recover finer spatial
            detail from what is already freely acquired, without inventing content that misleads an
            analyst.
          </p>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <PanelTitle title="Solution approach" />
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Deep super-resolution network trained on paired coarse/fine satellite scenes.</li>
              <li>Tile-based inference with overlap blending to avoid seam artefacts.</li>
              <li>Post-inference spectral check so band ratios and indices stay faithful.</li>
              <li>Geometric check keeping enhanced features aligned to the input geo-reference.</li>
              <li>Per-pixel confidence output surfaced as an uncertainty overlay.</li>
            </ul>
          </Panel>
          <Panel>
            <PanelTitle title="Key innovation" />
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                Consistency-first design: sharpness is never accepted at the cost of spectral or
                geographic fidelity.
              </li>
              <li>
                Uncertainty is a first-class product, not an afterthought — analysts see which
                details to trust.
              </li>
              <li>
                Reference-based validation is built into the workflow instead of being a separate
                offline study.
              </li>
            </ul>
          </Panel>
        </div>

        <Panel>
          <PanelTitle
            title="System architecture"
            sub="End-to-end flow from input scene to validated product."
          />
          <div className="flex flex-wrap items-center gap-2">
            {FLOW.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <span className="rounded-lg border border-border bg-background/40 px-3 py-2 text-xs">
                  {step}
                </span>
                {i < FLOW.length - 1 ? <span className="text-muted-foreground">→</span> : null}
              </div>
            ))}
          </div>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-background/40 p-4 text-[11px] leading-relaxed text-muted-foreground">
            {`React + TanStack Start (this prototype)
   │  POST /api/upload    → image metadata
   │  POST /api/enhance   → enhanced product + metrics
   │  POST /api/validate  → PSNR / SSIM / MSE
   │  GET  /api/results   → last run summary
   ▼
Python / PyTorch inference service (planned)
   └── SR model · consistency checks · uncertainty head`}
          </pre>
        </Panel>

        <Panel>
          <PanelTitle
            title="Honest status"
            sub="What is real today versus what the trained model will add."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-accent/30 bg-accent/10 p-4">
              <p className="label-mono">Implemented</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>Full workflow UI with pipeline visualisation</li>
                <li>Before/after comparison, uncertainty and validation surfaces</li>
                <li>Mock API layer mirroring the future backend routes</li>
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-background/40 p-4">
              <p className="label-mono">Pending</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>Trained Python / PyTorch super-resolution model</li>
                <li>Calibrated per-pixel uncertainty</li>
                <li>Quantitative validation on real reference scenes</li>
              </ul>
            </div>
          </div>
          <Disclaimer>
            All metrics currently shown in this prototype are simulated demonstration values.
          </Disclaimer>
        </Panel>
      </div>
    </AppShell>
  );
}
