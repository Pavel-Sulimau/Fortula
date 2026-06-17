type AudioConstructor = new (src?: string) => HTMLAudioElement;

let sharedWinAudio: HTMLAudioElement | null = null;

const WIN_SOUND_ASSET_PATH = '/sounds/win-bugle.ogg';

function getSharedWinAudio(win: Window): HTMLAudioElement | null {
  if (sharedWinAudio) {
    return sharedWinAudio;
  }

  const AudioCtor = (win as Window & { Audio?: AudioConstructor }).Audio;
  if (!AudioCtor) {
    return null;
  }

  try {
    const audio = new AudioCtor(WIN_SOUND_ASSET_PATH);
    audio.preload = 'auto';
    sharedWinAudio = audio;
    return sharedWinAudio;
  } catch {
    return null;
  }
}

async function playWinSample(win: Window): Promise<boolean> {
  const audio = getSharedWinAudio(win);
  if (!audio) {
    return false;
  }

  try {
    audio.currentTime = 0;
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

export async function playWinTone(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  await playWinSample(window);
}
