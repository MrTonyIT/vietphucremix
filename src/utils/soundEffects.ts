// Synthesized Web Audio micro-interactions for Viet Phuc Remix
// 100% Client-side synthetic audio - 0 external asset dependency, zero network lag.
// Styled after traditional Vietnamese silk/bamboo acoustic aesthetics.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const SOUND_STORAGE_KEY = 'vietphuc_sound_enabled';

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(SOUND_STORAGE_KEY);
  return stored !== 'false'; // Default to enabled
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'true' : 'false');
}

/**
 * Âm sắc Tơ Lụa (Silk Chime): Chuỗi nốt ngũ cung Đàn Tranh nhẹ nhàng khi đổi món hoặc áp dụng bộ đồ.
 */
export function playSilkChime(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Pentatonic notes: C5, E5, G5, A5
  const notes = [523.25, 659.25, 783.99, 880.0];

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.05);

    gain.gain.setValueAtTime(0, now + idx * 0.05);
    gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.05 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.05);
    osc.stop(now + idx * 0.05 + 0.36);
  });
}

/**
 * Âm sắc Ngọc Bội (Jade Bell): Tiếng chuông khánh thanh tao khi lưu bộ phối vào Lookbook hoặc Cloud.
 */
export function playSaveSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(880, now); // A5

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(1320, now); // E6 harmonic

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.56);
  osc2.stop(now + 0.56);
}

/**
 * Âm sắc Phách Gỗ (Wood Click): Tiếng gõ phách dứt khoát khi khóa / mở khóa vị trí slot.
 */
export function playLockSound(isLocked: boolean): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(isLocked ? 380 : 480, now);
  osc.frequency.exponentialRampToValueAtTime(isLocked ? 200 : 320, now + 0.04);

  gain.gain.setValueAtTime(0.09, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.06);
}
