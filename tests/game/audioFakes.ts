import type {
  AudioContextLike,
  AudioParamLike,
  BufferSourceLike,
  GainLike,
  NoiseBufferLike,
  OscillatorLike,
} from '../../src/game/audio';

export class FakeParam implements AudioParamLike {
  events: Array<{ kind: 'set' | 'ramp'; value: number; time: number }> = [];
  setValueAtTime(value: number, time: number): void {
    this.events.push({ kind: 'set', value, time });
  }
  exponentialRampToValueAtTime(value: number, time: number): void {
    this.events.push({ kind: 'ramp', value, time });
  }
}
export class FakeOsc implements OscillatorLike {
  type: OscillatorType = 'sine';
  frequency = new FakeParam();
  started = false;
  connect(): void {}
  start(): void { this.started = true; }
  stop(): void {}
}
export class FakeSource implements BufferSourceLike {
  buffer: unknown = null;
  playbackRate = new FakeParam();
  started = false;
  connect(): void {}
  start(): void { this.started = true; }
  stop(): void {}
}
export class FakeGain implements GainLike {
  gain = new FakeParam();
  connect(): void {}
}
export class FakeContext implements AudioContextLike {
  destination = {};
  sampleRate = 8000;
  currentTime = 0;
  state: 'suspended' | 'running' | 'closed' | 'interrupted' = 'suspended';
  oscillators: FakeOsc[] = [];
  sources: FakeSource[] = [];
  gains: FakeGain[] = [];
  buffers: Float32Array[] = [];
  resume(): Promise<void> {
    this.state = 'running';
    return Promise.resolve();
  }
  createGain(): GainLike {
    const g = new FakeGain();
    this.gains.push(g);
    return g;
  }
  createOscillator(): OscillatorLike {
    const o = new FakeOsc();
    this.oscillators.push(o);
    return o;
  }
  createBuffer(_channels: number, length: number): NoiseBufferLike {
    const data = new Float32Array(length);
    this.buffers.push(data);
    return { getChannelData: () => data };
  }
  createBufferSource(): BufferSourceLike {
    const s = new FakeSource();
    this.sources.push(s);
    return s;
  }
}
