import { useSyncExternalStore } from "react";
import type { EnhanceResult, ImageMeta } from "./api";

type State = {
  meta: ImageMeta | null;
  result: EnhanceResult | null;
};

let state: State = { meta: null, result: null };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const runStore = {
  set(patch: Partial<State>) {
    state = { ...state, ...patch };
    emit();
  },
  get: () => state,
};

const serverSnapshot: State = { meta: null, result: null };

export function useRun() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => serverSnapshot,
  );
}
