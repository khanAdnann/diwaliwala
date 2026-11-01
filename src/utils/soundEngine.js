/**
 * DiwaliWala Web Audio API Festive Sound & Music Engine
 * Generates 100% procedural, zero-dependency Indian festive sounds:
 *  1. Ambient Diwali Raga Yaman / Hamsadhwani Santoor & Temple Chimes + Tanpura Drone
 *  2. Firework Rocket Launch Whistle & Whoosh
 *  3. Firework Multi-Stage Explosion Boom + Sparkler Crackle (Pataakha)
 *  4. Sacred Temple Bell (Mandir Ghanti) when lighting Diyas
 *  5. Auspicious Celebration Arpeggio when downloading cards or showering gold
 */

class FestiveSoundManager {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.musicEnabled = false;
    this.musicInterval = null;
    this.droneOscillators = [];
    this.listeners = new Set();
  }

  initContext() {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const state = { sfxEnabled: this.sfxEnabled, musicEnabled: this.musicEnabled };
    this.listeners.forEach((fn) => fn(state));
  }

  toggleSfx(forceState) {
    this.sfxEnabled = typeof forceState === 'boolean' ? forceState : !this.sfxEnabled;
    if (this.sfxEnabled) {
      this.playDiyaLightSound();
    }
    this.notify();
    return this.sfxEnabled;
  }

  toggleMusic(forceState) {
    const next = typeof forceState === 'boolean' ? forceState : !this.musicEnabled;
    if (next) {
      this.startAmbientMusic();
    } else {
      this.stopAmbientMusic();
    }
    this.notify();
    return this.musicEnabled;
  }

  /**
   * 1. Sacred Temple Bell (Mandir Ghanti) + Warm Flame Ignition
   */
  playDiyaLightSound() {
    if (!this.sfxEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Metallic bell harmonics (Fundamental + overtones)
    const freqs = [528, 1056, 1584, 2376];
    const gains = [0.16, 0.08, 0.04, 0.02];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(gains[idx], now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.4 - idx * 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.45);
    });
  }

  /**
   * 2. Auspicious Celebration Arpeggio (Card Download / Confetti Burst)
   */
  playCelebrationChime() {
    if (!this.sfxEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    // Raga Hamsadhwani ascending notes (Sa, Re, Ga, Pa, Ni, Sa')
    const notes = [523.25, 587.33, 659.25, 783.99, 987.77, 1046.5];
    const now = ctx.currentTime;

    notes.forEach((freq, i) => {
      const start = now + i * 0.075;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.7);
    });
  }

  /**
   * 3. Firework Rocket Ascending Whistle / Whoosh
   */
  playRocketLaunchSound() {
    if (!this.sfxEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const startFreq = 320 + Math.random() * 90;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 2.6, now + 0.36);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  /**
   * 4. Firework Explosion Boom + Sparkling Crackle (Aatishbaazi)
   */
  playFireworkExplosionSound() {
    if (!this.sfxEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Stage A: Deep Sub-Bass Cannon Thump
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150 + Math.random() * 35, now);
    osc.frequency.exponentialRampToValueAtTime(26, now + 0.42);

    oscGain.gain.setValueAtTime(0.32, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.46);

    // Stage B: Sparkling White-Noise Pataakha Crackle
    const bufferSize = Math.floor(ctx.sampleRate * 0.5);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      const envelope = Math.exp(-i / (ctx.sampleRate * 0.15));
      const cracklePop = Math.random() > 0.92 ? 1.8 : 0.7;
      output[i] = (Math.random() * 2 - 1) * envelope * cracklePop;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1350 + Math.random() * 500, now);
    filter.Q.setValueAtTime(1.2, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.24, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.008, now + 0.48);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    whiteNoise.start(now);
  }

  /**
   * 5. Ambient Diwali Festive Background Music (Santoor & Tanpura Raga Yaman)
   */
  startAmbientMusic() {
    const ctx = this.initContext();
    if (!ctx) return;
    if (this.musicEnabled) return;
    this.musicEnabled = true;

    // Soft Tanpura Drone (Sa = 130.81Hz C3, Pa = 196.00Hz G3)
    const droneFreqs = [130.81, 196.0];
    this.droneOscillators = droneFreqs.map((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      gain.gain.setValueAtTime(0.018, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      return { osc, gain };
    });

    // Auspicious Evening Raga Scale (Sa, Re, Ga, तीव्र Ma, Pa, Dha, Ni, Sa')
    const ragaNotes = [261.63, 293.66, 329.63, 369.99, 392.0, 440.0, 493.88, 523.25, 659.25];
    let step = 0;
    const melodyPattern = [0, 2, 4, 3, 4, 6, 7, 4, 5, 4, 2, 1, 0];

    const playPluck = () => {
      if (!this.musicEnabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const noteIdx = melodyPattern[step % melodyPattern.length];
      step += 1;
      const freq = ragaNotes[noteIdx];

      const osc = this.ctx.createOscillator();
      const sub = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      sub.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      sub.frequency.setValueAtTime(freq * 2, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.055, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.6);

      osc.connect(gain);
      sub.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      sub.start(now);
      osc.stop(now + 1.65);
      sub.stop(now + 1.65);
    };

    playPluck();
    this.musicInterval = setInterval(playPluck, 680);
  }

  stopAmbientMusic() {
    this.musicEnabled = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.droneOscillators.forEach(({ osc, gain }) => {
      try {
        gain.gain.exponentialRampToValueAtTime(0.0001, (this.ctx?.currentTime || 0) + 0.2);
        osc.stop((this.ctx?.currentTime || 0) + 0.25);
      } catch {
        // Ignore already stopped
      }
    });
    this.droneOscillators = [];
  }
}

export const soundManager = new FestiveSoundManager();

