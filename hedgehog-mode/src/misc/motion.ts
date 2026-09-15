/**
 * True when the user asked the OS for less motion. Guarded for non-browser
 * test environments where matchMedia doesn't exist.
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
