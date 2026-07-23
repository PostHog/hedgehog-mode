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
