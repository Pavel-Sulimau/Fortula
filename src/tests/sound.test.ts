import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class MockAudioElement {
  static instances: MockAudioElement[] = [];
  static playCalls = 0;

  src: string | undefined;
  preload = 'auto';
  currentTime = 0;

  constructor(src?: string) {
    this.src = src;
    MockAudioElement.instances.push(this);
  }

  play(): Promise<void> {
    MockAudioElement.playCalls += 1;
    return Promise.resolve();
  }
}

beforeEach(() => {
  MockAudioElement.instances = [];
  MockAudioElement.playCalls = 0;

  Object.defineProperty(window, 'Audio', {
    value: MockAudioElement,
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('playWinTone', () => {
  it('plays the downloaded win sample', async () => {
    const sound = await import('../utils/sound');

    await sound.playWinTone();

    expect(MockAudioElement.instances).toHaveLength(1);
    expect(MockAudioElement.instances[0]?.src).toBe('/sounds/win-bugle.ogg');
    expect(MockAudioElement.instances[0]?.currentTime).toBe(0);
    expect(MockAudioElement.playCalls).toBe(1);
  });
});
