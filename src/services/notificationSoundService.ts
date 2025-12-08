// Global notification sound service
export type SoundType = 'bell' | 'chime' | 'ding' | 'notification' | 'alert';

export interface SoundConfig {
  volume: number; // 0-100
  soundType: SoundType;
}

const SOUNDS: Record<SoundType, { frequencies: number[], durations: number[] }> = {
  bell: {
    frequencies: [800, 1000, 800],
    durations: [0.15, 0.15, 0.2]
  },
  chime: {
    frequencies: [523, 659, 784, 1047],
    durations: [0.1, 0.1, 0.1, 0.2]
  },
  ding: {
    frequencies: [880],
    durations: [0.3]
  },
  notification: {
    frequencies: [587, 784],
    durations: [0.15, 0.25]
  },
  alert: {
    frequencies: [440, 880, 440, 880],
    durations: [0.1, 0.1, 0.1, 0.2]
  }
};

class NotificationSoundService {
  private audioContext: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.log('Audio not supported');
        return null;
      }
    }
    return this.audioContext;
  }

  getConfig(): SoundConfig {
    const savedVolume = localStorage.getItem('notification-volume');
    const savedSound = localStorage.getItem('notification-sound-type');
    
    return {
      volume: savedVolume ? parseInt(savedVolume) : 50,
      soundType: (savedSound as SoundType) || 'notification'
    };
  }

  saveConfig(config: Partial<SoundConfig>) {
    if (config.volume !== undefined) {
      localStorage.setItem('notification-volume', config.volume.toString());
    }
    if (config.soundType) {
      localStorage.setItem('notification-sound-type', config.soundType);
    }
  }

  play(soundType?: SoundType) {
    const config = this.getConfig();
    const volume = config.volume;
    const type = soundType || config.soundType;
    
    if (volume === 0) return;
    
    const audioContext = this.getAudioContext();
    if (!audioContext) return;

    const sound = SOUNDS[type];
    if (!sound) return;

    const normalizedVolume = (volume / 100) * 0.5;
    let startTime = audioContext.currentTime;

    sound.frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      const duration = sound.durations[index];
      gainNode.gain.setValueAtTime(normalizedVolume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
      
      startTime += duration * 0.9; // Slight overlap
    });
  }

  getSoundTypes(): { id: SoundType, name: string }[] {
    return [
      { id: 'bell', name: 'Sino' },
      { id: 'chime', name: 'Carrilhão' },
      { id: 'ding', name: 'Ding' },
      { id: 'notification', name: 'Notificação' },
      { id: 'alert', name: 'Alerta' }
    ];
  }
}

export const notificationSoundService = new NotificationSoundService();
