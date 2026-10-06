/**
 * Gentle ambient Web Audio Synthesizer for Holy Baptism & 1st Birthday invitation.
 * Synthesizes peaceful music box, harp, and celesta arpeggios (Brahms' Lullaby / Canon motif).
 * Completely self-contained, no external mp3 or network dependence.
 */

class AmbientInvitationAudio {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timerId: number | null = null;
  private currentNoteIndex: number = 0;
  private listeners: ((playing: boolean) => void)[] = [];

  // Gentle pentatonic lullaby notes (Frequencies in Hz)
  // C4, E4, G4, A4, C5, D5, E5, G5, A5
  private readonly melody: number[] = [
    261.63, 329.63, 392.00, 523.25, 440.00, 392.00, 329.63, 261.63,
    293.66, 349.23, 440.00, 587.33, 523.25, 440.00, 392.00, 329.63,
    329.63, 392.00, 523.25, 659.25, 587.33, 523.25, 440.00, 392.00,
    392.00, 329.63, 261.63, 293.66, 261.63, 329.63, 392.00, 523.25,
  ];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribe(callback: (playing: boolean) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isPlaying));
  }

  public getStatus() {
    return this.isPlaying;
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public play() {
    try {
      this.initContext();
      if (!this.ctx) return;
      this.isPlaying = true;
      this.notify();
      this.scheduleNextNote();
    } catch {
      // Audio playback failed
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.notify();
  }

  private playTone(freq: number, duration: number = 1.4) {
    if (!this.ctx || !this.isPlaying) return;

    const now = this.ctx.currentTime;
    
    // Main chime / harp oscillator
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    // Warm overtone oscillator
    const overtone = this.ctx.createOscillator();
    const overtoneGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freq * 2, now);

    // Filter to soften the high end (warm music-box tone)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    // Natural harp / celesta decay curve
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    overtoneGain.gain.setValueAtTime(0.0001, now);
    overtoneGain.gain.exponentialRampToValueAtTime(0.03, now + 0.04);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.7);

    // Wire up
    osc.connect(gainNode);
    overtone.connect(overtoneGain);
    gainNode.connect(filter);
    overtoneGain.connect(filter);
    filter.connect(this.ctx.destination);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + duration + 0.1);
    overtone.stop(now + duration + 0.1);
  }

  private scheduleNextNote = () => {
    if (!this.isPlaying) return;

    const freq = this.melody[this.currentNoteIndex % this.melody.length];
    this.playTone(freq, 1.6);

    // Occasionally play a gentle soft harmony third or fifth
    if (this.currentNoteIndex % 4 === 0) {
      this.playTone(freq * 1.25, 2.0);
    }

    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;

    // Tempo: ~750ms between notes for a dreamy, peaceful tempo
    this.timerId = window.setTimeout(this.scheduleNextNote, 760);
  };
}

export const invitationAudio = new AmbientInvitationAudio();
