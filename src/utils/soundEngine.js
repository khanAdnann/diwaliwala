/**
 * DiwaliWala Web Audio API Festive Sound & Music Engine
 * Optimized for 60FPS mobile performance:
 *  - Pre-allocates a single reusable noise buffer for firework crackles (zero per-frame CPU allocation)
 *  - Throttles overlapping explosion sounds on rapid taps / Grand Finale
 */

class FestiveSoundManager {
  constructor() {
    this.ctx = null;
    this.crackleBuffer = null;
    this.lastExplosionTime = 0;
    this.lastLaunchTime = 0;
    this.sfxEnabled = true;
    this.musicEnabled = false;
    this.musicInterval = null;
    this.droneOscillators = [];
    this.ytPlayer = null;
    this.listeners = new Set();
  }

  registerYouTubePlayer(playerInstance) {
    this.ytPlayer = playerInstance;
  }

  setMusicStateFromYouTube(isPlaying) {
    this.musicEnabled = Boolean(isPlaying);
    this.notify();
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
    // Pre-build reusable firework crackle buffer once so explosions cost zero CPU loops
    if (!this.crackleBuffer && this.ctx) {
      const sampleRate = this.ctx.sampleRate || 44100;
      const bufferSize = Math.floor(sampleRate * 0.38);
      this.crackleBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const output = this.crackleBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i += 1) {
        const envelope = Math.exp(-i / (sampleRate * 0.12));
        const pop = Math.random() > 0.92 ? 1.6 : 0.65;
        output[i] = (Math.random() * 2 - 1) * envelope * pop;
      }
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
    if (this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
      try {
        if (next) {
          this.ytPlayer.unMute?.();
          this.ytPlayer.playVideo();
          this.musicEnabled = true;
        } else {
          this.ytPlayer.pauseVideo();
          this.musicEnabled = false;
        }
        this.notify();
        return this.musicEnabled;
      } catch {
        // Fallback to Web Audio if YT iframe blocked
      }
    }
    if (next) {
      this.startAmbientMusic();
    } else {
      this.stopAmbientMusic();
    }
    this.notify();
    return this.musicEnabled;
  }

  playDiyaLightSound() {
    if (!this.sfxEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [528, 1056, 1584];
    const gains = [0.14, 0.06, 0.03];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(gains[idx], now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1 - idx * 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.15);
    });
  }

  playCelebrationChime() {
    if (!this.sfxEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    const now = ctx.currentTime;

    notes.forEach((freq, i) => {
      const start = now + i * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.11, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.6);
    });
  }

  playRocketLaunchSound() {
    if (!this.sfxEnabled) return;
    const perfNow = performance.now();
    if (perfNow - this.lastLaunchTime < 90) return;
    this.lastLaunchTime = perfNow;

    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const startFreq = 320 + Math.random() * 80;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 2.4, now + 0.28);

    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  }

  playFireworkExplosionSound() {
    if (!this.sfxEnabled) return;
    const perfNow = performance.now();
    if (perfNow - this.lastExplosionTime < 85) return;
    this.lastExplosionTime = perfNow;

    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Sub-bass boom
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(145 + Math.random() * 30, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.36);

    oscGain.gain.setValueAtTime(0.26, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);

    // 2. Re-use pre-allocated crackle buffer (zero CPU loop overhead)
    if (this.crackleBuffer) {
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = this.crackleBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1300 + Math.random() * 400, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.008, now + 0.36);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start(now);
    }
  }

  startAmbientMusic() {
    const ctx = this.initContext();
    if (!ctx) return;
    if (this.musicEnabled) return;
    this.musicEnabled = true;

    const droneFreqs = [130.81, 196.0];
    this.droneOscillators = droneFreqs.map((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      gain.gain.setValueAtTime(0.016, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      return { osc, gain };
    });

    const ragaNotes = [261.63, 293.66, 329.63, 369.99, 392.0, 440.0, 493.88, 523.25];
    let step = 0;
    const melodyPattern = [0, 2, 4, 3, 4, 6, 7, 4, 5, 4, 2, 1, 0];

    const playPluck = () => {
      if (!this.musicEnabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const noteIdx = melodyPattern[step % melodyPattern.length];
      step += 1;
      const freq = ragaNotes[noteIdx];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.45);
    };

    playPluck();
    this.musicInterval = setInterval(playPluck, 700);
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
        // Ignore
      }
    });
    this.droneOscillators = [];
  }
}

export const soundManager = new FestiveSoundManager();
