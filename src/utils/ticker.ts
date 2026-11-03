export type TickListener = (now: number) => void;

export class Ticker {
  private listeners = new Set<TickListener>();
  private timerId: ReturnType<typeof setTimeout> | null = null;

  constructor(private interval = 1000) {}

  subscribe(fn: TickListener): () => void {
    this.listeners.add(fn);

    if (this.timerId === null) {
      this.start();
    }

    return () => {
      this.listeners.delete(fn);

      if (this.listeners.size === 0) {
        this.stop();
      }
    };
  }

  private start() {
    if (this.timerId !== null) return;

    const tick = () => {
      this.timerId = null;

      if (this.listeners.size === 0) return;

      const now = Date.now();
      for (const fn of this.listeners) {
        try {
          fn(now);
        } catch (e) {
          console.error(e);
        }
      }

      this.timerId = setTimeout(tick, this.interval);
    };

    this.timerId = setTimeout(tick, this.interval);
  }

  private stop() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}