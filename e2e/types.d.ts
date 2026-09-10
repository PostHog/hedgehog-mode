import type { HedgeHogMode } from "@posthog/hedgehog-mode";

declare global {
  interface Window {
    /** Set by fixtures/probe.js: "allowed" or "blocked:<ErrorName>". */
    __cspProbe?: string;
    /** Set by fixtures/app.ts once the engine finished rendering. */
    __game?: HedgeHogMode;
    __ready?: boolean;
    __bootError?: string;
  }
}

export {};
