import { useState, useMemo, useEffect, useCallback } from 'react';
import type { SentenceItem } from './types/sentence';
import { Header } from './components/Header';
import { PracticeCard } from './components/PracticeCard';
import { FooterStatus } from './components/FooterStatus';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { useSpeechVoice } from './hooks/useSpeechVoice';
import { triggerConfetti } from './utils/confetti';
import { fetchSentencesFromSheet } from './services/sheetsService';
import { AlertCircle, RefreshCw, Loader2, BookOpen } from 'lucide-react';

function App() {
  const [sentences, setSentences] = useState<SentenceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedLevel, setSelectedLevel] = useState<string>('Tất cả');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showPinyin, setShowPinyin] = useState<boolean>(false);
  const [showGhost, setShowGhost] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const {
    voices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    speechRate,
    setSpeechRate,
    isSpeaking,
    speak,
  } = useSpeechVoice();

  // Statistics
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [correctCharCount, setCorrectCharCount] = useState<number>(0);

  // Fetch data from API on mount
  useEffect(() => {
    let isCancelled = false;

    fetchSentencesFromSheet()
      .then((data) => {
        if (!isCancelled) {
          if (data.length === 0) {
            setError('Không có dữ liệu câu nào trong cơ sở dữ liệu.');
          } else {
            setSentences(data);
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : 'Không thể kết nối tới cơ sở dữ liệu';
          setError(message);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Manual retry handler
  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetchSentencesFromSheet()
      .then((data) => {
        if (data.length === 0) {
          setError('Không có dữ liệu câu nào trong cơ sở dữ liệu.');
        } else {
          setSentences(data);
        }
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Không thể kết nối tới cơ sở dữ liệu';
        setError(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Extract unique levels dynamically from API data
  const availableLevels = useMemo(() => {
    const set = new Set<string>();
    sentences.forEach((s) => {
      if (s.level) set.add(s.level);
    });
    return ['Tất cả', ...Array.from(set)];
  }, [sentences]);

  // Filter sentences according to selected level
  const filteredSentences = useMemo(() => {
    if (selectedLevel === 'Tất cả') return sentences;
    return sentences.filter((s) => s.level === selectedLevel);
  }, [selectedLevel, sentences]);

  // Derive safe index within bounds
  const safeIndex =
    filteredSentences.length > 0 && currentIndex >= filteredSentences.length ? 0 : currentIndex;

  // Current sentence
  const currentSentence: SentenceItem | undefined = filteredSentences[safeIndex];

  // Change level
  const handleSelectLevel = (level: string) => {
    setSelectedLevel(level);
    setCurrentIndex(0);
  };

  // Next sentence
  const handleNextSentence = useCallback(() => {
    setCurrentIndex((prev) => {
      if (filteredSentences.length <= 1) return 0;
      return (prev + 1) % filteredSentences.length;
    });
  }, [filteredSentences.length]);

  // When a sentence is completed
  const handleCompleteSentence = useCallback(() => {
    setCompletedCount((prev) => prev + 1);
    triggerConfetti();
  }, []);

  // When characters are counted
  const handleCharCorrect = useCallback((count: number) => {
    setCorrectCharCount((prev) => prev + count);
  }, []);

  // Reset statistics
  const handleResetStats = useCallback(() => {
    if (window.confirm('Bạn có chắc muốn đặt lại toàn bộ thống kê luyện tập không?')) {
      setCompletedCount(0);
      setCorrectCharCount(0);
      setCurrentIndex(0);
    }
  }, []);

  // Global keydown handler for Tab (next sentence)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        handleNextSentence();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleNextSentence]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6f8] text-[#16202a] selection:bg-[#f8c8b8] selection:text-[#642515]">
      {/* Top Navigation */}
      <Header
        levels={availableLevels}
        currentLevel={selectedLevel}
        onSelectLevel={handleSelectLevel}
        showPinyin={showPinyin}
        onTogglePinyin={() => setShowPinyin((p) => !p)}
        showGhost={showGhost}
        onToggleGhost={() => setShowGhost((g) => !g)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((s) => !s)}
        onResetStats={handleResetStats}
        isLoading={isLoading}
        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
        speechRate={speechRate}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-8 lg:py-12">
        {/* State 1: Loading */}
        {isLoading && sentences.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <p className="text-gray-800 font-semibold text-base">Đang tải dữ liệu</p>
            <p className="text-xs text-gray-500 mt-1">Chờ xíu!</p>
          </div>
        )}

        {/* State 2: Error */}
        {!isLoading && error && sentences.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center max-w-md bg-white rounded-3xl border border-red-100 shadow-sm">
            <div className="p-3 bg-red-50 text-red-500 rounded-full mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Không thể tải dữ liệu</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs sm:text-sm font-medium rounded-full transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Thử lại</span>
            </button>
          </div>
        )}

        {/* State 3: Empty Filtered Sentences */}
        {!isLoading && !error && filteredSentences.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center max-w-md bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-full mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Chưa có câu luyện tập</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">
              Không tìm thấy câu nào thuộc cấp độ &ldquo;{selectedLevel}&rdquo;.
            </p>
            <button
              onClick={() => handleSelectLevel('Tất cả')}
              className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-medium rounded-full transition-all"
            >
              Xem tất cả các câu
            </button>
          </div>
        )}

        {/* State 4: Practice Card */}
        {currentSentence && (
          <PracticeCard
            key={currentSentence.id}
            sentence={currentSentence}
            showPinyin={showPinyin}
            showGhost={showGhost}
            soundEnabled={soundEnabled}
            isSpeaking={isSpeaking}
            onSpeak={speak}
            onNext={handleNextSentence}
            onCharCorrect={handleCharCorrect}
            onCompleteSentence={handleCompleteSentence}
          />
        )}
      </main>

      {/* Bottom Status Bar */}
      <FooterStatus
        completedCount={completedCount}
        correctCharCount={correctCharCount}
      />

      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        voices={voices}
        selectedVoiceURI={selectedVoiceURI}
        onSelectVoice={setSelectedVoiceURI}
        speechRate={speechRate}
        onSelectRate={setSpeechRate}
      />
    </div>
  );
}

export default App;
