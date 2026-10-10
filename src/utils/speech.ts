// Web Speech API and Audio synthesis utilities for Maya

// Clean markdown syntax before speaking so TTS doesn't read asterisks or hashtags
export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' कोड ब्लॉक ') // skip raw code block reading
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/[*_~#]/g, '') // asterisks, hashtags, underscores
    .replace(/[😊❤️🎮📚🎵✨🙏🙌👏💡🎯🎉🔥]/g, '') // remove common emojis so TTS doesn't stumble
    .replace(/\s+/g, ' ')
    .trim();
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

export interface SpeechOptions {
  rate?: number; // 0.8 - 1.2
  pitch?: number; // 0.9 - 1.2
  voiceURI?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}

export function findBestHindiVoice(voices: SpeechSynthesisVoice[], preferredURI?: string): SpeechSynthesisVoice | null {
  if (preferredURI) {
    const found = voices.find((v) => v.voiceURI === preferredURI);
    if (found) return found;
  }

  // 1. Exact Hindi female voice
  const hindiFemale = voices.find(
    (v) =>
      (v.lang.startsWith('hi') || v.lang.includes('IN')) &&
      (v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('swara') ||
        v.name.toLowerCase().includes('kalpana') ||
        v.name.toLowerCase().includes('lekha') ||
        v.name.includes('हिन्दी'))
  );
  if (hindiFemale) return hindiFemale;

  // 2. Any Hindi voice
  const hindiAny = voices.find((v) => v.lang.startsWith('hi') || v.lang.toLowerCase().includes('hi-in'));
  if (hindiAny) return hindiAny;

  // 3. Indian English voice (reads Hinglish naturally)
  const indianEn = voices.find((v) => v.lang.includes('en-IN') || v.name.toLowerCase().includes('india'));
  if (indianEn) return indianEn;

  // 4. Default voice
  return voices.find((v) => v.default) || voices[0] || null;
}

export function speakText(text: string, options: SpeechOptions = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  stopSpeech();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) {
    options.onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleaned);
  activeUtterance = utterance;

  const voices = getAvailableVoices();
  const selectedVoice = findBestHindiVoice(voices, options.voiceURI);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang || 'hi-IN';
  } else {
    utterance.lang = 'hi-IN';
  }

  // Soft, clear, and natural tone
  utterance.rate = options.rate ?? 1.0;
  utterance.pitch = options.pitch ?? 1.05;

  utterance.onstart = () => {
    options.onStart?.();
  };

  utterance.onend = () => {
    activeUtterance = null;
    options.onEnd?.();
  };

  utterance.onerror = () => {
    activeUtterance = null;
    options.onError?.();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  activeUtterance = null;
}

export function isSpeaking(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}

// Gentle Web Audio API synthesizer for interface sounds
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
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSound(type: 'send' | 'receive' | 'mic-start' | 'mic-stop' | 'click') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'receive') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'mic-start') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === 'mic-stop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.16);
    }
  } catch {
    // Ignore audio errors gracefully
  }
}
