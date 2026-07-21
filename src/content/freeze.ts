/**
 * Recursively Object.freeze a content object graph (plain objects and arrays).
 * Content is data the sim must never mutate; freezing turns an accidental
 * write into a loud TypeError (ES modules run in strict mode).
 */
export function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.getOwnPropertyNames(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}
