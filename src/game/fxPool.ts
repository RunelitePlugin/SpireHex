/**
 * Minimal render-FX object pool (P8 carried ticket, decided at P10 planning):
 * the tracer/burst path allocated 2 Lines + 1 ParticleEmitter per SHOT and one
 * emitter per death, each destroyed within ~400 ms — >100 allocations/sec at
 * 3x speed, multiplied by endless swarm waves. Phaser-free plain TS
 * (META_FILES-tripwired) so reuse semantics stay unit-testable headless.
 */
export class FxPool<T> {
  private readonly free: T[] = [];
  /** Lifetime factory calls — the reuse metric (stays at peak concurrency under churn). */
  created = 0;

  constructor(
    private readonly make: () => T,
    private readonly reset: (item: T) => void,
  ) {}

  acquire(): T {
    const item = this.free.pop();
    if (item !== undefined) return item;
    this.created += 1;
    return this.make();
  }

  release(item: T): void {
    this.reset(item);
    this.free.push(item);
  }

  get available(): number {
    return this.free.length;
  }
}
