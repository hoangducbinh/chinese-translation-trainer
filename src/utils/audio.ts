// Web Speech & Web Audio API utilities for Chinese typing practice

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a subtle, clean mechanical keystroke click
 */
export function playKeyStrokeSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // AudioContext might be blocked before first user gesture
  }
}

/**
 * Play a cheerful, subtle completion chime
 */
export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.08, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  } catch {
    // Graceful fallback
  }
}

/**
 * Play a subtle error buzz
 */
export function playErrorBuzz() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // Graceful fallback
  }
}

/**
 * Get all available Chinese voices from browser SpeechSynthesis
 */
export function getChineseVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  const voices = window.speechSynthesis.getVoices();
  const chineseVoices = voices.filter((v) => {
    const lang = v.lang.toLowerCase();
    const name = v.name.toLowerCase();
    return (
      lang.startsWith('zh') ||
      lang.includes('cmn') ||
      lang.includes('yue') ||
      name.includes('chinese') ||
      name.includes('mandarin') ||
      name.includes('cantonese')
    );
  });

  return chineseVoices.sort((a, b) => getVoiceQualityScore(b) - getVoiceQualityScore(a));
}

function getVoiceQualityScore(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  let score = 0;

  if (name.includes('enhanced') || name.includes('premium') || name.includes('natural')) score += 100;
  if (name.includes('google')) score += 80;
  if (name.includes('ting-ting') || name.includes('tingting') || name.includes('mei-jia') || name.includes('meijia')) {
    score += 50;
  }
  if (lang === 'zh-cn' || lang.startsWith('zh-cn')) score += 20;
  if (name.includes('eddy') || name.includes('flo') || name.includes('grandma') || name.includes('grandpa')) {
    score -= 10;
  }

  return score;
}

/**
 * Cancel any ongoing speech
 */
export function cancelSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Speak Chinese text using Web Speech Synthesis API
 */
export function speakChinese(
  text: string,
  voiceURI?: string | null,
  rate: number = 0.85,
  onEnd?: () => void,
  onError?: () => void
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    if (onEnd) onEnd();
    return null;
  }

  // Cancel any ongoing speech
  cancelSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.volume = 1;

  const voices = window.speechSynthesis.getVoices();
  let matchedVoice: SpeechSynthesisVoice | undefined;

  // 1. Try matching by explicit voiceURI
  if (voiceURI) {
    matchedVoice = voices.find((v) => v.voiceURI === voiceURI || v.name === voiceURI);
  }

  // 2. Fallback to any Chinese voice
  if (!matchedVoice) {
    matchedVoice = voices.find((v) => {
      const lang = v.lang.toLowerCase();
      const name = v.name.toLowerCase();
      return (
        lang.startsWith('zh') ||
        lang.includes('cmn') ||
        lang.includes('yue') ||
        name.includes('chinese') ||
        name.includes('mandarin') ||
        name.includes('cantonese')
      );
    });
  }

  if (matchedVoice) {
    utterance.voice = matchedVoice;
    utterance.lang = matchedVoice.lang;
  }

  if (onEnd) {
    utterance.onend = () => onEnd();
  }

  if (onError) {
    utterance.onerror = () => onError();
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}
