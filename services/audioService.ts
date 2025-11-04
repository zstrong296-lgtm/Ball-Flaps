
class AudioService {
  private audioContext: AudioContext | null = null;

  private init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.5) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  public playFlapSound = () => {
    this.init();
    this.playTone(800, 0.05, 'triangle', 0.3);
  };

  public playScoreSound = () => {
    this.init();
    if (!this.audioContext) return;
    const time = this.audioContext.currentTime;
    
    // Play a quick, funny arpeggio
    this.playTone(523.25, 0.05, 'square', 0.3); // C5
    setTimeout(() => this.playTone(659.25, 0.05, 'square', 0.3), 50); // E5
    setTimeout(() => this.playTone(783.99, 0.05, 'square', 0.3), 100); // G5
  };

  public playCrashSound = () => {
    this.init();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sawtooth';
    gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.5);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.5);
  };
}

export const audioService = new AudioService();
