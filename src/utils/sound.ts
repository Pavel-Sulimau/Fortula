type AudioContextConstructor = new () => AudioContext;

let sharedAudioContext: AudioContext | null = null;

function getAudioContextConstructor(
  win: Window,
): AudioContextConstructor | undefined {
  const standardCtor = (
    win as Window & { AudioContext?: AudioContextConstructor }
  ).AudioContext;
  const fallbackCtor = (
    win as Window & { webkitAudioContext?: AudioContextConstructor }
  ).webkitAudioContext;
  return standardCtor || fallbackCtor;
}

function getSharedAudioContext(win: Window): AudioContext | null {
  if (sharedAudioContext && sharedAudioContext.state !== 'closed') {
    return sharedAudioContext;
  }

  const AudioContextCtor = getAudioContextConstructor(win);
  if (!AudioContextCtor) {
    return null;
  }

  try {
    sharedAudioContext = new AudioContextCtor();
    return sharedAudioContext;
  } catch {
    return null;
  }
}

export async function playWinTone(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const context = getSharedAudioContext(window);
  if (!context) {
    return;
  }

  try {
    if (context.state === 'suspended') {
      await context.resume();
    }
  } catch {
    return;
  }

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(440, now);
  oscillator.frequency.exponentialRampToValueAtTime(660, now + 0.18);
  oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.36);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.16, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.42);

  oscillator.addEventListener('ended', () => {
    oscillator.disconnect();
    gain.disconnect();
  });
}
