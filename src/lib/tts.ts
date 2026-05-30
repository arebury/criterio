/**
 * Thin controller over the Web Speech API (SpeechSynthesis). Reads the active
 * section aloud in Spanish, mirroring the original artifact's behaviour.
 */

export type TtsState = 'idle' | 'playing' | 'paused';

export function isTtsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export class TtsController {
  private onState: (state: TtsState) => void;

  constructor(onState: (state: TtsState) => void) {
    this.onState = onState;
  }

  /** Start (or resume) reading the given text aloud. */
  play(text: string): void {
    if (!isTtsSupported()) return;
    const synth = window.speechSynthesis;

    if (synth.paused && synth.speaking) {
      synth.resume();
      this.onState('playing');
      return;
    }

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.92;
    const voice = synth.getVoices().find((v) => v.lang && v.lang.startsWith('es'));
    if (voice) utterance.voice = voice;
    utterance.onend = () => this.onState('idle');
    utterance.onerror = () => this.onState('idle');
    synth.speak(utterance);
    this.onState('playing');
  }

  pause(): void {
    if (!isTtsSupported()) return;
    window.speechSynthesis.pause();
    this.onState('paused');
  }

  stop(): void {
    if (!isTtsSupported()) return;
    window.speechSynthesis.cancel();
    this.onState('idle');
  }
}
