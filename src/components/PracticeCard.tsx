import React, { useRef, useEffect, useState } from 'react';
import { Volume2, CheckCircle2 } from 'lucide-react';
import type { SentenceItem } from '../types/sentence';
import { CharacterBox } from './CharacterBox';
import type { CharStatus } from './CharacterBox';
import { playKeyStrokeSound, playSuccessChime, playErrorBuzz } from '../utils/audio';

interface PracticeCardProps {
  sentence: SentenceItem;
  showPinyin: boolean;
  showGhost: boolean;
  soundEnabled: boolean;
  isSpeaking: boolean;
  onSpeak: (text: string) => void;
  onNext: () => void;
  onCharCorrect: (count: number) => void;
  onCompleteSentence: () => void;
}

export const PracticeCard: React.FC<PracticeCardProps> = ({
  sentence,
  showPinyin,
  showGhost,
  soundEnabled,
  isSpeaking,
  onSpeak,
  onNext,
  onCharCorrect,
  onCompleteSentence,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);

  // Target Chinese characters split into array
  const targetChars = Array.from(sentence.chinese);

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Normalize string for pinyin comparison (remove spaces & tone marks)
  const normalizeText = (str: string) => {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '');
  };

  const normalizedPinyinRaw = normalizeText(sentence.pinyinRaw || sentence.pinyin || '');

  // Calculate character statuses for the Chinese character boxes
  const chinesePunctuation = '，。！？、；：‘’“”「」『』（）［］【】《》〈〉…—～·,.!?;:\'"()[]';
  const isChineseInputChar = (char: string) =>
    /[\u3400-\u9fff]/.test(char) || chinesePunctuation.includes(char);
  const userChars = Array.from(inputValue).filter(isChineseInputChar);
  const charStatuses: { status: CharStatus; userChar?: string }[] = targetChars.map((targetChar, idx) => {
    if (idx < userChars.length) {
      const userChar = userChars[idx];
      if (userChar === targetChar) {
        return { status: 'correct', userChar };
      } else {
        return { status: 'wrong', userChar };
      }
    } else if (idx === userChars.length) {
      return { status: 'active' };
    } else {
      return { status: 'idle' };
    }
  });

  // Check completion state
  const handleCheckCompletion = (val: string) => {
    // Direct Chinese match
    const isDirectMatch = val.trim() === sentence.chinese.trim();

    // Or Pinyin matching (for users typing romanized letters)
    const normInput = normalizeText(val);
    const isPinyinMatch = normInput.length > 0 && normInput === normalizedPinyinRaw;

    if (isDirectMatch || isPinyinMatch) {
      if (!isCompleted) {
        setIsCompleted(true);
        if (soundEnabled) {
          playSuccessChime();
        }
        onCharCorrect(targetChars.length);
        onCompleteSentence();
      }
      return true;
    }
    return false;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    // IME emits intermediate values such as "shi" before a Chinese character is committed.
    if (isComposingRef.current) {
      return;
    }

    if (soundEnabled) {
      playKeyStrokeSound();
    }

    handleCheckCompletion(val);
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false;
    handleCheckCompletion(e.currentTarget.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComposingRef.current || e.nativeEvent.isComposing) {
      return;
    }

    // Tab key switches to next sentence
    if (e.key === 'Tab') {
      e.preventDefault();
      onNext();
      return;
    }

    // Enter key checks or advances
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isCompleted) {
        onNext();
      } else {
        const completed = handleCheckCompletion(inputValue);
        if (!completed && soundEnabled) {
          playErrorBuzz();
        }
      }
    }
  };

  // Play pronunciation
  const handleSpeak = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onSpeak(sentence.chinese);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Main Card */}
      <div className="rounded-[28px]  p-6 sm:p-12 md:p-14 flex flex-col items-center text-center">
        {/* Vietnamese sentence */}
        <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold text-gray-900 tracking-tight leading-relaxed max-w-xl mb-6">
          {sentence.vietnamese}
        </h2>

        {/* Pinyin badge pill */}
        {showPinyin && (
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#fffdf5] border border-amber-200/70 text-amber-800/90 mb-7 shadow-xs">
            <span className="text-base sm:text-lg font-medium tracking-wide">
              {sentence.pinyin}
            </span>
          </div>
        )}

        {/* Hanzi character boxes grid */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 max-w-full px-2">
          {targetChars.map((char, index) => (
            <CharacterBox
              key={`${sentence.id}-${index}`}
              char={char}
              status={charStatuses[index]?.status || 'idle'}
              userChar={charStatuses[index]?.userChar}
              showGhost={showGhost}
            />
          ))}
        </div>

        {/* Long Input pill field with audio speaker icon */}
        <div className="relative w-full max-w-xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onKeyDown={handleKeyDown}
            placeholder="Tab để sang câu tiếp theo, Enter để kiểm tra"
            className="w-full py-3.5 sm:py-4 pl-6 pr-14 text-center text-base sm:text-lg text-gray-800 placeholder-gray-400 bg-white border border-gray-200 rounded-2xl sm:rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            autoFocus
          />

          {/* Speaker button on right */}
          <button
            type="button"
            onClick={handleSpeak}
            title="Nghe phát âm tiếng Trung"
            className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
              isSpeaking
                ? 'text-amber-600 bg-amber-50 scale-110'
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        {/* Success completion badge if sentence is finished */}
        {isCompleted && (
          <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium animate-pop border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Chính xác! Nhấn Enter hoặc Tab để sang câu tiếp theo</span>
          </div>
        )}

        {/* Next sentence button with Tab keycap badge */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onNext}
            className="group px-6 py-2.5 rounded-full bg-neutral-900 hover:bg-black text-white text-sm sm:text-base font-medium flex items-center gap-2.5 transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
          >
            <span>Câu tiếp theo</span>
            <span className="bg-neutral-800 text-neutral-300 text-xs px-2 py-0.5 rounded-md font-mono group-hover:bg-neutral-700 transition-colors">
              Tab
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
