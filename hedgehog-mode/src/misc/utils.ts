let uniqueIdCounter = 0;

export const range = (end: number): number[] =>
  Array.from({ length: end }, (_, index) => index);

export function sample<T>(values: readonly [T, ...T[]]): T;
export function sample<T>(values: readonly T[]): T | undefined;
export function sample<T>(values: readonly T[]): T | undefined {
  return values[Math.floor(Math.random() * values.length)];
}

export const uniqueId = (prefix = ""): string =>
  `${prefix}${++uniqueIdCounter}`;

/** A copy of `values` in random order (Fisher-Yates). */
export function shuffle<T>(values: readonly T[]): T[] {
  const shuffled = [...values];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
