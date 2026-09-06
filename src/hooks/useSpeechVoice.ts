import { useState, useEffect, useCallback } from 'react';
import { getChineseVoices, speakChinese, cancelSpeech } from '../utils/audio';

const STORAGE_KEY_VOICE = 'chinese_typing_voice_uri';
const STORAGE_KEY_RATE = 'chinese_typing_speech_rate';

export function useSpeechVoice() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURIState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_VOICE) || '';
    } catch {
      return '';
    }
  });
  const [speechRate, setSpeechRateState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RATE);
      return saved ? Number(saved) : 0.85;
    } catch {
      return 0.85;
    }
  });
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Update voices on mount & when voiceschanged event fires
  useEffect(() => {
    const updateVoices = () => {
      const zhVoices = getChineseVoices();
      setVoices(zhVoices);

      setSelectedVoiceURIState((current) => {
        if (current && zhVoices.some((v) => v.voiceURI === current || v.name === current)) {
          return current;
        }
        if (zhVoices.length > 0) {
          const defaultVoice =
            zhVoices.find((v) => v.lang === 'zh-CN' || v.lang.startsWith('zh-CN')) || zhVoices[0];
          return defaultVoice.voiceURI;
        }
        return '';
      });
    };

    updateVoices();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const setSelectedVoiceURI = useCallback((uri: string) => {
    setSelectedVoiceURIState(uri);
    try {
      localStorage.setItem(STORAGE_KEY_VOICE, uri);
    } catch {
      // Ignore quota errors
    }
  }, []);

  const setSpeechRate = useCallback((rate: number) => {
    setSpeechRateState(rate);
    try {
      localStorage.setItem(STORAGE_KEY_RATE, String(rate));
    } catch {
      // Ignore quota errors
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      setIsSpeaking(true);
      speakChinese(
        text,
        selectedVoiceURI,
        speechRate,
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    },
    [selectedVoiceURI, speechRate]
  );

  const cancel = useCallback(() => {
    cancelSpeech();
    setIsSpeaking(false);
  }, []);

  return {
    voices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    speechRate,
    setSpeechRate,
    isSpeaking,
    speak,
    cancel,
  };
}
