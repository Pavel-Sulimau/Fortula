export async function playWinTone(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  type AudioContextConstructor = new () => AudioContext;
  const fallbackCtor = (
    window as Window & { webkitAudioContext?: AudioContextConstructor }
  ).webkitAudioContext;
  const AudioContextCtor = window.AudioContext || fallbackCtor;
  if (!AudioContextCtor) {
    return;
  }

  const context = new AudioContextCtor();
  if (context.state === 'suspended') {
    await context.resume();
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
    void context.close();
  });
}
